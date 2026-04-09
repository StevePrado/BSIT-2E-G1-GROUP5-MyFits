


// Edit clothes modal
function openEditClothesModal(id, name, category, season, occasion, color, status, image) {
            document.getElementById('editClothesId').value = id;
            document.getElementById('editClothesName').value = name;
            document.getElementById('editClothesCategory').value = category;
            document.getElementById('editClothesSeason').value = season;
            document.getElementById('editClothesOccasion').value = occasion;
            document.getElementById('editClothesColor').value = color;
            document.getElementById('editClothesStatus').value = status;
            document.getElementById('editUploadPreview').src = image;
            
            new bootstrap.Modal(document.getElementById('editClothesModal')).show();
        }

// Category pill navigation
        let currentCategory = 'all';

        function filterCategory(category, buttonElement) {
            currentCategory = category;

            document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active', 'bg-black', 'text-white'));
            buttonElement.classList.add('active', 'bg-black', 'text-white');

            const sectionMap = {
                'outfit': { title: document.querySelector('.section-title[data-category="outfit"]'), row: document.getElementById('outfitsRow') },
                'top':    { title: document.querySelector('.section-title[data-category="top"]'),    row: document.getElementById('topsRow') },
                'bottom': { title: document.querySelector('.section-title[data-category="bottom"]'), row: document.getElementById('bottomsRow') },
                'shoes':  { title: document.querySelector('.section-title[data-category="shoes"]'),  row: document.getElementById('shoesRow') }
            };

            if (category === 'all') {
                Object.values(sectionMap).forEach(s => {
                    if (s.title) s.title.style.display = 'block';
                    if (s.row) s.row.style.display = 'flex';
                });
            } else {
                Object.entries(sectionMap).forEach(([key, s]) => {
                    if (key === category) {
                        if (s.title) s.title.style.display = 'block';
                        if (s.row) s.row.style.display = 'flex';
                    } else {
                        if (s.title) s.title.style.display = 'none';
                        if (s.row) s.row.style.display = 'none';
                    }
                });
            }

            updateFabButton(category);

            applyFilters();
        }

        function updateFabButton(category) {
        }

// Filter engine (backend-powered)
        function applyFilters() {
            let statuses = [];
            const readyNode = document.getElementById('filter-ready') || document.getElementById('filter-status-availability');
            if (readyNode && readyNode.checked) statuses.push('ready', 'available', 'availability');
            const laundryNode = document.getElementById('filter-laundry') || document.getElementById('filter-status-laundry');
            if (laundryNode && laundryNode.checked) statuses.push('laundry');

            let seasons = [];
            ['spring', 'summer', 'fall', 'winter'].forEach(s => {
                const node = document.getElementById('filter-season-' + s);
                if (node && node.checked) seasons.push(s);
            });

            let occasions = [];
            ['work', 'casual', 'date', 'sports', 'formal', 'home', 'party', 'school'].forEach(o => {
                const node = document.getElementById('filter-occasion-' + o);
                if (node && node.checked) occasions.push(o);
            });

            let colors = [];
            ['black', 'white', 'blue', 'gray', 'brown', 'red', 'green', 'khaki', 'yellow'].forEach(c => {
                const node = document.getElementById('filter-color-' + c);
                if (node && node.checked) colors.push(c);
            });

            let qParams = [];
            if (statuses.length > 0) qParams.push('status=' + statuses.join(','));
            if (seasons.length > 0) qParams.push('season=' + seasons.join(','));
            if (occasions.length > 0) qParams.push('occasion=' + occasions.join(','));
            if (colors.length > 0) qParams.push('color=' + colors.join(','));
            if (currentCategory !== 'all') qParams.push('category=' + currentCategory);
            if (currentSearchQuery) qParams.push('search=' + encodeURIComponent(currentSearchQuery));

            let queryString = qParams.length > 0 ? '?' + qParams.join('&') : '';


            let oParams = [];
            if (statuses.length > 0) oParams.push('status=' + statuses.join(','));
            if (seasons.length > 0) oParams.push('season=' + seasons.join(','));
            if (occasions.length > 0) oParams.push('occasion=' + occasions.join(','));
            if (colors.length > 0) oParams.push('color=' + colors.join(','));
            if (currentSearchQuery) oParams.push('search=' + encodeURIComponent(currentSearchQuery));
            let outfitQueryString = oParams.length > 0 ? '?' + oParams.join('&') : '';


            fetch('../backend/get_clothes.php' + queryString)
            .then(res => res.json())
            .then(data => {
                ['topsRow', 'bottomsRow', 'shoesRow'].forEach(rowId => {
                    const row = document.getElementById(rowId);
                    if (row) {
                        row.querySelectorAll('.filter-item').forEach(el => el.remove());
                        const emptyCard = row.querySelector('.empty-state-card');
                        if (emptyCard) emptyCard.remove();
                    }
                });

                if (data.status === 200) {
                    data.clothes.reverse().forEach(item => renderClothItem(item));
                }
                updateEmptyStates();
            })
            .catch(err => { console.error("Filter fetch error:", err); updateEmptyStates(); });


            fetch('../backend/get_outfits.php' + outfitQueryString)
            .then(res => res.json())
            .then(data => {
                const outfitRow = document.getElementById('outfitsRow');
                if (outfitRow) {
                    outfitRow.querySelectorAll('.filter-item').forEach(el => el.remove());
                    const emptyCard = outfitRow.querySelector('.empty-state-card');
                    if (emptyCard) emptyCard.remove();
                }

                if (data.status === 200) {
                    data.outfits.reverse().forEach(outfit => renderOutfitItem(outfit));
                }
                updateEmptyStates();
            })
            .catch(err => { console.error("Outfit filter fetch error:", err); updateEmptyStates(); });
        }

// Empty state cards
        function updateEmptyStates() {
            const rowCategoryMap = {
                'outfitsRow': 'outfit',
                'topsRow': 'top',
                'bottomsRow': 'bottom',
                'shoesRow': 'shoes'
            };

            document.querySelectorAll('.gallery-wrapper .scroll-row').forEach(grid => {
                const rowCategory = rowCategoryMap[grid.id];
                if (currentCategory !== 'all' && rowCategory && rowCategory !== currentCategory) {
                    return;
                }

                let hasVisible = grid.querySelectorAll('.filter-item').length > 0;
                
                // Creates the empty
                let emptyCard = grid.querySelector('.empty-state-card');
                if (!emptyCard) {
                    let text = 'No items found';
                    let targetVal = 'top';
                    let isOutfit = false;
                    let targetWidth = '220px';
                    let targetHeight = '260px';
                    if (grid.id === 'outfitsRow') { text = 'Add Outfit'; isOutfit = true; targetWidth = '250px'; targetHeight = '340px'; }
                    else if (grid.id === 'topsRow') { text = 'Add Top'; targetVal = 'top'; targetWidth = '220px'; targetHeight = '260px'; }
                    else if (grid.id === 'bottomsRow') { text = 'Add Bottom'; targetVal = 'bottom'; targetWidth = '250px'; targetHeight = '340px'; }
                    else if (grid.id === 'shoesRow') { text = 'Add Shoes'; targetVal = 'shoes'; targetWidth = '280px'; targetHeight = '280px'; }
                    
                    emptyCard = document.createElement('div');
                    emptyCard.className = 'empty-state-card d-flex flex-column align-items-center justify-content-center text-muted me-3 mb-4';
                    emptyCard.style.flexShrink = '0';
                    emptyCard.style.order = '-1';
                    emptyCard.dataset.cardWidth = targetWidth;
                    emptyCard.dataset.cardHeight = targetHeight;
                    emptyCard.style.border = '2px dashed #ddd';
                    emptyCard.style.borderRadius = '12px';
                    emptyCard.style.backgroundColor = '#f9f9f9';
                    emptyCard.style.cursor = 'pointer';
                    emptyCard.style.transition = 'all 0.3s ease';
                    emptyCard.innerHTML = `<i class="bi bi-plus-circle fs-3 mb-2"></i><span class="fw-bold" style="font-size: 0.85rem;">${text}</span>`;
                    
                    emptyCard.addEventListener('mouseenter', () => { emptyCard.style.backgroundColor = '#f0f0f0'; emptyCard.style.borderColor = '#aaa'; emptyCard.style.color = '#333'; });
                    emptyCard.addEventListener('mouseleave', () => { emptyCard.style.backgroundColor = '#f9f9f9'; emptyCard.style.borderColor = '#ddd'; emptyCard.style.color = '#aaa'; });
                    
                    emptyCard.onclick = () => {
                        if (isOutfit) {
                            window.location.href = 'create.html';
                        } else {
                            document.getElementById('clothesCategory').value = targetVal;
                            new bootstrap.Modal(document.getElementById('addClothesModal')).show();
                        }
                    };
                    grid.appendChild(emptyCard);
                }
                
                if (!hasVisible) {
                    emptyCard.style.width = '100%';
                    emptyCard.style.minWidth = '0';
                    emptyCard.style.height = '180px';
                    emptyCard.style.minHeight = '180px';
                    emptyCard.style.marginRight = '0';
                    emptyCard.classList.remove('me-3');
                } else {
                    const w = emptyCard.dataset.cardWidth || '220px';
                    const h = emptyCard.dataset.cardHeight || '300px';
                    emptyCard.style.width = w;
                    emptyCard.style.minWidth = w;
                    emptyCard.style.height = 'auto';
                    emptyCard.style.minHeight = h;
                    emptyCard.style.marginRight = '';
                    if (!emptyCard.classList.contains('me-3')) emptyCard.classList.add('me-3');
                }
                
                emptyCard.style.display = 'flex';

                // Adjusts layout
                if (currentCategory === 'all') {
                    grid.style.display = 'flex';
                    grid.style.flexWrap = 'nowrap';
                    grid.style.overflowX = hasVisible ? 'auto' : 'hidden';
                } else {
                    grid.style.display = 'flex';
                    grid.style.flexWrap = 'wrap';
                    grid.style.overflowX = 'hidden';
                }
            });
        }

        let uploadedImageData = null;

        document.getElementById('clothesFileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(ev) {
                uploadedImageData = ev.target.result;
                document.getElementById('uploadPreview').src = uploadedImageData;
                document.getElementById('uploadPreview').style.display = 'block';
                document.getElementById('uploadPlaceholder').style.display = 'none';
                document.getElementById('uploadZone').classList.add('has-image');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('addClothesBtn').addEventListener('click', function() {
            const name = document.getElementById('clothesName').value.trim();
            const category = document.getElementById('clothesCategory').value;
            const season = document.getElementById('clothesSeason').value;
            const occasion = document.getElementById('clothesOccasion').value;
            const color = document.getElementById('clothesColor').value;
            const fileInput = document.getElementById('clothesFileInput');

            if (!fileInput.files[0]) {
                alert('Please upload an image first!');
                return;
            }
            if (!name) {
                alert('Please enter an item name!');
                return;
            }

            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            formData.append('name', name);
            formData.append('category', category);
            formData.append('season', season);
            formData.append('occasion', occasion);
            formData.append('color', color);

            const btn = document.getElementById('addClothesBtn');
            btn.innerHTML = 'Uploading...';
            btn.disabled = true;

            fetch('../backend/add_clothes.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                btn.innerHTML = 'Add to Closet';
                btn.disabled = false;
                
                if (data.status === 200) {
                    document.getElementById('clothesFileInput').value = '';
                    document.getElementById('clothesName').value = '';
                    document.getElementById('uploadPreview').style.display = 'none';
                    document.getElementById('uploadPlaceholder').style.display = 'block';
                    document.getElementById('uploadZone').classList.remove('has-image');
                    bootstrap.Modal.getInstance(document.getElementById('addClothesModal')).hide();

                    // Re
                    applyFilters();
                } else {
                    alert(data.message || 'Error occurred during upload.');
                }
            })
            .catch(err => {
                btn.innerHTML = 'Add to Closet';
                btn.disabled = false;
                console.error(err);
                alert('Network error while uploading.');
            });
        });

// Edit clothes — save changes
        document.getElementById('saveEditClothesBtn').addEventListener('click', function() {
            const id = document.getElementById('editClothesId').value;
            const name = document.getElementById('editClothesName').value.trim();
            const category = document.getElementById('editClothesCategory').value;
            const season = document.getElementById('editClothesSeason').value;
            const occasion = document.getElementById('editClothesOccasion').value;
            const color = document.getElementById('editClothesColor').value;
            const status = document.getElementById('editClothesStatus').value;
            
            if (!name) return alert('Name required');
            const btn = this; btn.disabled = true; btn.innerHTML = 'Saving...';
            
            fetch('../backend/update_clothes.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ cloth_id: id, name, category, season, occasion, color, status })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 200) {
                    const mCard = document.querySelector(`.filter-item[data-id="${id}"]`);
                    if(mCard) {
                        mCard.className = `scroll-item filter-item ${category} status-${status} season-${season} occasion-${occasion} color-${color}`;
                        
                        const badge = mCard.querySelector('.badge.bg-danger');
                        if (status === 'laundry' && !badge) {
                             mCard.querySelector('.item-card').insertAdjacentHTML('afterbegin', '<span class="badge bg-danger position-absolute top-0 start-0 m-2">In Laundry</span>');
                             mCard.querySelector('.item-img').style.opacity = '0.5';
                             mCard.querySelector('.item-title').classList.add('text-muted');
                        } else if (status !== 'laundry') {
                             if(badge) badge.remove();
                             mCard.querySelector('.item-img').style.opacity = '1';
                             mCard.querySelector('.item-title').classList.remove('text-muted');
                        }
                        mCard.querySelector('.item-title').textContent = name;
                        
                        const targetRow = document.getElementById(category === 'top' ? 'topsRow' : (category === 'bottom' ? 'bottomsRow' : 'shoesRow'));
                        if (mCard.parentElement !== targetRow) {
                            targetRow.appendChild(mCard);
                        }
                        
                        document.querySelectorAll('.filter-item.outfit').forEach(outfitCard => {
                             if (outfitCard.getAttribute('data-top-id') == id || outfitCard.getAttribute('data-bottom-id') == id || outfitCard.getAttribute('data-shoes-id') == id) {
                                  if (status === 'laundry') {
                                       outfitCard.classList.remove('status-ready');
                                       outfitCard.classList.add('status-laundry');
                                       if (!outfitCard.querySelector('.badge.bg-danger')) {
                                            outfitCard.querySelector('.item-card').insertAdjacentHTML('afterbegin', '<span class="badge bg-danger position-absolute top-0 start-0 m-2">In Laundry</span>');
                                       }
                                       outfitCard.querySelector('.item-title').classList.add('text-muted');
                                       
                                       if (outfitCard.getAttribute('data-top-id') == id) outfitCard.setAttribute('data-top-laundry', 'true');
                                       if (outfitCard.getAttribute('data-bottom-id') == id) outfitCard.setAttribute('data-bottom-laundry', 'true');
                                       if (outfitCard.getAttribute('data-shoes-id') == id) outfitCard.setAttribute('data-shoes-laundry', 'true');
                                  } else {
                                       if (outfitCard.getAttribute('data-top-id') == id) outfitCard.removeAttribute('data-top-laundry');
                                       if (outfitCard.getAttribute('data-bottom-id') == id) outfitCard.removeAttribute('data-bottom-laundry');
                                       if (outfitCard.getAttribute('data-shoes-id') == id) outfitCard.removeAttribute('data-shoes-laundry');
                                       
                                       if (!outfitCard.getAttribute('data-top-laundry') && !outfitCard.getAttribute('data-bottom-laundry') && !outfitCard.getAttribute('data-shoes-laundry') && outfitCard.getAttribute('data-outfit-laundry') !== 'true') {
                                            outfitCard.classList.remove('status-laundry');
                                            outfitCard.classList.add('status-ready');
                                            const bgBadge = outfitCard.querySelector('.badge.bg-danger');
                                            if (bgBadge) bgBadge.remove();
                                            outfitCard.querySelector('.item-title').classList.remove('text-muted');
                                       }
                                  }
                             }
                        });
                        
                        applyFilters();
                    }
                    var modalEl = document.getElementById('editClothesModal');
                    var modalObj = bootstrap.Modal.getInstance(modalEl);
                    if(modalObj) modalObj.hide();
                    btn.disabled = false; btn.innerHTML = 'Save Changes';
                } else {
                    alert(data.message);
                    btn.disabled = false; btn.innerHTML = 'Save Changes';
                }
            })
            .catch(()=> { alert('Network error'); btn.disabled = false; btn.innerHTML = 'Save Changes'; });
        });

// Render clothing card
        function renderClothItem(item) {
            const categoryMap = { 'top': 'topsRow', 'bottom': 'bottomsRow', 'shoes': 'shoesRow' };
            if (!categoryMap[item.category]) return;
            const targetRow = document.getElementById(categoryMap[item.category]);

            const newItem = document.createElement('div');
            newItem.className = `scroll-item filter-item ${item.category} status-${item.status} season-${item.season} occasion-${item.occasion} color-${item.color}`;
            newItem.setAttribute('data-id', item.id);
            const safeName = item.name.replace(/'/g, "\\'");
            newItem.innerHTML = `
                <div class="item-card hover-parent" style="position: relative;">
                    ${item.status === 'laundry' ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2" style="z-index:5;">In Laundry</span>' : ''}
                    <button class="btn-delete-cloth hover-delete" onclick="event.stopPropagation(); deleteClothItem(${item.id}, this);" title="Delete item">
                        <i class="bi bi-trash3" style="font-size: 12px;"></i>
                    </button>
                    <img src="${item.image}" class="item-img" style="object-fit: contain;">
                    <div class="item-title ${item.status === 'laundry' ? 'text-muted' : ''}">${item.name}</div>
                </div>
            `;

            const cardEl = newItem.querySelector('.item-card');
            cardEl.addEventListener('click', function(e) {
                if (e.target.closest('.hover-delete')) return;
                openEditClothesModal(item.id, item.name, item.category, item.season, item.occasion, item.color, item.status, item.image);
            });

            if (targetRow) {
                targetRow.prepend(newItem);
            }
        }

// Delete clothing item
        function deleteClothItem(clothId, btnEl) {
            if (!confirm('Delete this clothing item? This cannot be undone.')) return;
            
            btnEl.disabled = true;
            
            fetch('../backend/delete_clothes.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'cloth_id=' + clothId
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 200) {
                    const card = document.querySelector(`.filter-item[data-id="${clothId}"]`);
                    if (card) {
                        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.remove();
                            applyFilters(); // Refresh to update empty states
                        }, 300);
                    }
                } else {
                    alert(data.message);
                    btnEl.disabled = false;
                }
            })
            .catch(err => {
                console.error(err);
                alert('Network error while deleting.');
                btnEl.disabled = false;
            });
        }

// Outfit editing redirect
        function editOutfit(id) {
            window.location.href = 'create.html?id=' + id;
        }

        function renderOutfitItem(outfit) {
            const targetRow = document.getElementById('outfitsRow');
            if (!targetRow) return;

            const newItem = document.createElement('div');
            const statusClass = outfit.in_laundry ? 'status-laundry' : 'status-ready';
            newItem.className = `scroll-item filter-item outfit ${statusClass} season-${outfit.season} occasion-${outfit.occasion} color-${outfit.color}`;
            newItem.setAttribute('data-outfit-id', outfit.id);
            newItem.setAttribute('data-top-id', outfit.top_id || '');
            newItem.setAttribute('data-top-laundry', outfit.top_status === 'laundry' ? 'true' : '');
            newItem.setAttribute('data-bottom-id', outfit.bottom_id || '');
            newItem.setAttribute('data-bottom-laundry', outfit.bottom_status === 'laundry' ? 'true' : '');
            newItem.setAttribute('data-shoes-id', outfit.shoes_id || '');
            newItem.setAttribute('data-shoes-laundry', outfit.shoes_status === 'laundry' ? 'true' : '');
            newItem.setAttribute('data-outfit-laundry', outfit.status === 'laundry' ? 'true' : '');
            
            let imagesHtml = '';
            let hasImages = false;
            if (outfit.top_image) { imagesHtml += `<img src="${outfit.top_image}" style="width: auto; height: 140px; object-fit: contain; z-index: 3; position: relative; mix-blend-mode: multiply;">`; hasImages = true; }
            if (outfit.bottom_image) { imagesHtml += `<img src="${outfit.bottom_image}" style="width: auto; height: 185px; object-fit: contain; z-index: 2; position: relative; margin-top: ${outfit.top_image ? '-65px' : '0'}; mix-blend-mode: multiply;">`; hasImages = true; }
            if (outfit.shoes_image) { imagesHtml += `<img src="${outfit.shoes_image}" style="width: auto; height: 85px; object-fit: contain; z-index: 4; position: relative; margin-top: ${outfit.bottom_image ? '-35px' : (outfit.top_image ? '-25px' : '0')}; mix-blend-mode: multiply;">`; hasImages = true; }
            
            if (!hasImages) imagesHtml = '<div style="height: 350px; display: flex; align-items:center; justify-content:center; color:#999; font-weight:600;">No Items</div>';

            newItem.innerHTML = `
                <div class="item-card hover-parent" style="position: relative;">
                    ${outfit.in_laundry ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2" style="z-index: 5;">In Laundry</span>' : ''}
                    <button class="btn-delete-cloth hover-delete" onclick="event.stopPropagation(); deleteOutfitItem(${outfit.id}, this);" title="Delete outfit">
                        <i class="bi bi-trash3" style="font-size: 12px;"></i>
                    </button>
                    <div class="d-flex flex-column align-items-center justify-content-center w-100" style="height: 350px; overflow: visible;">
                        ${imagesHtml}
                    </div>
                    <div class="item-title ${outfit.in_laundry ? 'text-muted' : ''}">${outfit.name}</div>
                </div>
            `;

            const cardEl = newItem.querySelector('.item-card');
            cardEl.addEventListener('click', function(e) {
                if (e.target.closest('.hover-delete')) return;
                editOutfit(outfit.id);
            });

            targetRow.prepend(newItem);
        }

// Delete outfit
        function deleteOutfitItem(outfitId, btnEl) {
            if (!confirm('Delete this outfit? This cannot be undone.')) return;
            btnEl.disabled = true;
            
            fetch('../backend/delete_outfit.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'outfit_id=' + outfitId
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 200) {
                    // Fade
                    const card = document.querySelector(`.filter-item[data-outfit-id="${outfitId}"]`);
                    if (card) {
                        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.remove();
                            applyFilters();
                        }, 300);
                    }
                } else {
                    alert(data.message);
                    btnEl.disabled = false;
                }
            })
            .catch(err => {
                console.error(err);
                alert('Network error while deleting.');
                btnEl.disabled = false;
            });
        }

// Search & sort
        let currentSearchQuery = '';
        let currentSortOrder = 'newest';

        function handleSearch() {
            currentSearchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
            applyFilters();
        }

        function handleSort(order, linkEl) {
            currentSortOrder = order;
            const label = order === 'newest' ? 'Sort By: Newest' : 'Sort By: Oldest';
            document.getElementById('sortDropdownBtn').textContent = label;

            document.querySelectorAll('.scroll-row').forEach(row => {
                const items = Array.from(row.querySelectorAll('.filter-item'));
                if (items.length === 0) return;

                items.sort((a, b) => {
                    const aId = parseInt(a.getAttribute('data-id') || a.getAttribute('data-outfit-id') || 0);
                    const bId = parseInt(b.getAttribute('data-id') || b.getAttribute('data-outfit-id') || 0);
                    return order === 'newest' ? bId - aId : aId - bId;
                });

                items.forEach(item => row.appendChild(item));
                // Moves the empty
                const emptyCard = row.querySelector('.empty-state-card');
                if (emptyCard) row.prepend(emptyCard);
            });
        }

// Laundry room modal
        function openLaundryBasket() {
            const topsRow = document.getElementById('laundryTopsRow');
            const bottomsRow = document.getElementById('laundryBottomsRow');
            const shoesRow = document.getElementById('laundryShoesRow');
            
            topsRow.innerHTML = ''; bottomsRow.innerHTML = ''; shoesRow.innerHTML = '';
            
            let laundryCount = 0;
            
            document.querySelectorAll('.filter-item.status-laundry:not(.outfit)').forEach(item => {
                laundryCount++;
                const isTop = item.classList.contains('top');
                const isBottom = item.classList.contains('bottom');
                const clothId = item.getAttribute('data-id');
                const img = item.querySelector('.item-img').src;
                const title = item.querySelector('.item-title').textContent;
                
                const card = document.createElement('div');
                card.className = 'scroll-item laundry-card item-card p-2 text-center';
                let cardWidth = isTop ? '220px' : (isBottom ? '250px' : '280px');
                let imgHeight = isTop ? '220px' : (isBottom ? '220px' : '150px');
                card.style.width = cardWidth;
                card.style.flexShrink = '0';
                card.setAttribute('data-l-id', clothId);
                
                card.innerHTML = `
                    <div class="laundry-overlay">
                        <button class="btn btn-success fw-bold p-2 px-3 shadow" onclick="markItemClean(${clothId}, this)">
                            <i class="bi bi-check-circle me-1"></i>Ready to Wear
                        </button>
                    </div>
                    <img src="${img}" style="width:100%; height:${imgHeight}; object-fit:contain;">
                    <div class="fw-bold text-uppercase mt-2" style="font-size:0.8rem;">${title}</div>
                `;
                
                if (isTop) topsRow.appendChild(card);
                else if (isBottom) bottomsRow.appendChild(card);
                else shoesRow.appendChild(card);
            });
            
            if (laundryCount === 0) {
                document.getElementById('laundryEmptyMsg').style.display = 'block';
                document.getElementById('laundryContent').style.display = 'none';
                document.getElementById('markAllCleanBtn').disabled = true;
            } else {
                document.getElementById('laundryEmptyMsg').style.display = 'none';
                document.getElementById('laundryContent').style.display = 'block';
                document.getElementById('markAllCleanBtn').disabled = false;
            }
            
            new bootstrap.Modal(document.getElementById('laundryBasketModal')).show();
        }

// Mark single item clean
        function markItemClean(clothId, btnEl) {
            btnEl.disabled = true;
            btnEl.innerHTML = 'Updating...';
            
            fetch('../backend/update_laundry_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'cloth_id=' + clothId
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 200) {
                    const lCard = document.querySelector(`.laundry-card[data-l-id="${clothId}"]`);
                    if(lCard) {
                        lCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        lCard.style.opacity = '0'; lCard.style.transform = 'scale(0.8)';
                        setTimeout(() => lCard.remove(), 300);
                    }
                    
                    const mCard = document.querySelector(`.filter-item[data-id="${clothId}"]`);
                    if(mCard) {
                        mCard.classList.remove('status-laundry');
                        mCard.classList.add('status-ready');
                        const badge = mCard.querySelector('.badge.bg-danger');
                        if(badge) badge.remove();
                        const img = mCard.querySelector('.item-img');
                        const title = mCard.querySelector('.item-title');
                        if (img) img.style.opacity = '1';
                        if (title) title.classList.remove('text-muted');
                    }
                    
                    document.querySelectorAll('.filter-item.outfit').forEach(outfitCard => {
                        if (outfitCard.getAttribute('data-top-id') == clothId) outfitCard.removeAttribute('data-top-laundry');
                        if (outfitCard.getAttribute('data-bottom-id') == clothId) outfitCard.removeAttribute('data-bottom-laundry');
                        if (outfitCard.getAttribute('data-shoes-id') == clothId) outfitCard.removeAttribute('data-shoes-laundry');
                        
                        if (!outfitCard.getAttribute('data-top-laundry') && 
                            !outfitCard.getAttribute('data-bottom-laundry') && 
                            !outfitCard.getAttribute('data-shoes-laundry') &&
                            outfitCard.getAttribute('data-outfit-laundry') !== 'true') {
                            
                            outfitCard.classList.remove('status-laundry');
                            outfitCard.classList.add('status-ready');
                            const badge = outfitCard.querySelector('.badge.bg-danger');
                            if(badge) badge.remove();
                            const title = outfitCard.querySelector('.item-title');
                            if(title) title.classList.remove('text-muted');
                        }
                    });
                    
                    setTimeout(() => applyFilters(), 350);
                } else {
                    alert(data.message);
                    btnEl.disabled = false;
                    btnEl.innerHTML = '<i class="bi bi-check-circle me-1"></i>Ready to Wear';
                }
            })
            .catch(err => alert('Network error.'));
        }

        function markAllClean() {
            const btn = document.getElementById('markAllCleanBtn');
            btn.disabled = true;
            btn.innerHTML = 'Updating...';
            
            fetch('../backend/update_laundry_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'bulk_action=mark_all_clean'
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 200) {
                    document.querySelectorAll('.filter-item.status-laundry:not(.outfit)').forEach(mCard => {
                        mCard.classList.remove('status-laundry');
                        mCard.classList.add('status-ready');
                        const badge = mCard.querySelector('.badge.bg-danger');
                        if(badge) badge.remove();
                        const img = mCard.querySelector('.item-img');
                        const title = mCard.querySelector('.item-title');
                        if (img) img.style.opacity = '1';
                        if (title) title.classList.remove('text-muted');
                    });
                    
                    document.querySelectorAll('.filter-item.outfit').forEach(outfitCard => {
                        outfitCard.removeAttribute('data-top-laundry');
                        outfitCard.removeAttribute('data-bottom-laundry');
                        outfitCard.removeAttribute('data-shoes-laundry');
                        
                        if (outfitCard.getAttribute('data-outfit-laundry') !== 'true') {
                            outfitCard.classList.remove('status-laundry');
                            outfitCard.classList.add('status-ready');
                            const badge = outfitCard.querySelector('.badge.bg-danger');
                            if(badge) badge.remove();
                            const title = outfitCard.querySelector('.item-title');
                            if(title) title.classList.remove('text-muted');
                        }
                    });
                    
                    document.getElementById('laundryEmptyMsg').style.display = 'block';
                    document.getElementById('laundryContent').style.display = 'none';
                    
                    applyFilters();
                    btn.innerHTML = '<i class="bi bi-check2-all me-1"></i> Mark All as Clean';
                } else {
                    alert(data.message);
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-check2-all me-1"></i> Mark All as Clean';
                }
            })
            .catch(err => alert('Network error.'));
        }

// Page initialization
        document.addEventListener('DOMContentLoaded', () => {
            fetch('../backend/get_session.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 200) {
                    const userNameEl = document.getElementById('userNameDisplay');
                    if (userNameEl) userNameEl.textContent = data.userName;
                }
            })
            .catch(err => console.error('Failed to fetch user session:', err));

            applyFilters();
        });
