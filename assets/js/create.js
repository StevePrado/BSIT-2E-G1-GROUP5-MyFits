


$(document).ready(function() {

    // Tag picker modals
    $('.option-list .list-group-item').click(function() {
        let selectionText = $(this).text().trim();
        
        let targetId = $(this).closest('.option-list').data('target');
        
        $('#' + targetId).text(selectionText);
        $(this).closest('.modal').modal('hide');
    });

    $('#saveOutfitBtn').click(function() {
        var topImg = $('#slot-top .equipped-img').attr('src');
        var bottomImg = $('#slot-bottom .equipped-img').attr('src');
        var shoesImg = $('#slot-shoes .equipped-img').attr('src');
        
        var previewHtml = '';

        if (!topImg && !bottomImg && !shoesImg) {
            previewHtml = '<div class="empty-preview" style="height: 100%; display: flex; align-items: center; justify-content: center; color: #aaa; font-weight: 600;">No items equipped</div>';
        } else {
            previewHtml += '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding: 15px 0;">';
            
            if(topImg) {
                previewHtml += `<img src="${topImg}" style="width: auto; height: 170px; object-fit: contain; z-index: 2; position: relative; mix-blend-mode: multiply;">`;
            }
            if(bottomImg) {
                let mt = topImg ? '-35px' : '0';
                previewHtml += `<img src="${bottomImg}" style="width: auto; height: 200px; object-fit: contain; z-index: 1; position: relative; margin-top: ${mt}; mix-blend-mode: multiply;">`;
            }
            if(shoesImg) {
                let mt = bottomImg ? '-35px' : (topImg ? '-20px' : '0');
                previewHtml += `<img src="${shoesImg}" style="width: auto; height: 90px; object-fit: contain; z-index: 3; position: relative; margin-top: ${mt}; mix-blend-mode: multiply;">`;
            }
            
            previewHtml += '</div>';
        }
        
        $('#previewCard').html(previewHtml);

        var outfitName = $('.name-input').val() || 'Untitled Outfit';
        var status = $('#val-status').text();
        var occasion = $('#val-occasion').text();
        var season = $('#val-season').text();
        var color = $('#val-color').text();
        var scheduleDate = $('#scheduleDateInput').val();
        var repeatWeekly = $('#repeatWeeklyToggle').is(':checked');
        let displayDate = scheduleDate ? scheduleDate + (repeatWeekly ? ' (Weekly)' : '') : 'Unscheduled';

        $('#previewInfo').html(
            '<h5 class="fw-bold mb-3">' + outfitName + '</h5>' +
            '<span class="badge bg-dark rounded-pill me-2 px-3 py-2 fw-medium text-white mb-2">' + status + '</span>' +
            '<span class="badge bg-dark rounded-pill me-2 px-3 py-2 fw-medium text-white mb-2">' + season + '</span>' +
            '<span class="badge bg-dark rounded-pill me-2 px-3 py-2 fw-medium text-white mb-2">' + occasion + '</span><br>' +
            '<span class="badge bg-dark rounded-pill me-2 px-3 py-2 fw-medium text-white mb-2">' + color + '</span>' +
            '<span class="badge bg-dark rounded-pill me-2 px-3 py-2 fw-medium text-white"><i class="bi bi-calendar-event me-2"></i>' + displayDate + '</span>'
        );

        // Opens the preview modal
        var modal = new bootstrap.Modal(document.getElementById('previewModal'));
        modal.show();
    });

    $('#scheduleDateInput').change(function() {
        let selectedDateStr = $(this).val();
        if (!selectedDateStr) return;

        let status = $('#val-status').text().trim();
            let isLaundry = (status === 'In Laundry');
            
            $('#outfit-canvas .equipped-img').each(function() {
                let id = $(this).data('id');
                let srcCard = $(`.clickable-item[data-id="${id}"]`).closest('.filter-item');
                if(srcCard.hasClass('status-laundry')) {
                    isLaundry = true;
                }
            });

            if (isLaundry) {
                let selectedDate = new Date(selectedDateStr + 'T00:00:00');
                let today = new Date();
                today.setHours(0,0,0,0);
                
                if (selectedDate <= today) {
                    alert('In Laundry items must be scheduled for Tomorrow or later.');
                    let tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    let yr = tomorrow.getFullYear();
                    let mo = String(tomorrow.getMonth() + 1).padStart(2, '0');
                    let da = String(tomorrow.getDate()).padStart(2, '0');
                    $(this).val(`${yr}-${mo}-${da}`);
                }
            }
        
        let finalVal = $(this).val();
        if (finalVal) {
            let parts = finalVal.split('-');
            let mm = parts[1];
            let dd = parts[2];
            let yy = parts[0].substring(2);
            $('.btn-schedule').html(`Scheduled: ${mm}/${dd}/${yy} <i class="bi bi-calendar-check ms-1 fs-5"></i>`);
        } else {
            $('.btn-schedule').html(`Schedule outfit <i class="bi bi-calendar-event fs-5"></i>`);
        }
    });

    $('#confirmSaveBtn').click(function() {
        let urlParams = new URLSearchParams(window.location.search);
        let currentOutfitId = urlParams.get('id');

        let topId = $('#slot-top .equipped-img').data('id') || null;
        let bottomId = $('#slot-bottom .equipped-img').data('id') || null;
        let shoesId = $('#slot-shoes .equipped-img').data('id') || null;
        let name = $('.name-input').val().trim() || 'Untitled Outfit';
        
        // Converts display
        let rawStatus = $('#val-status').text().trim();
        let status = rawStatus === 'In Laundry' ? 'laundry' : 'ready';
        
        let rawSeason = $('#val-season').text().trim();
        let season = rawSeason === 'Any Season' ? 'all-season' : rawSeason.toLowerCase();
        
        let rawOccasion = $('#val-occasion').text().trim();
        let occasion = rawOccasion === 'Any Occasion' ? 'any-occasion' : rawOccasion.toLowerCase();
        
        let color = $('#val-color').text().trim().toLowerCase();
        let scheduleDate = $('#scheduleDateInput').val() || null;
        let repeatWeekly = $('#repeatWeeklyToggle').is(':checked') ? 1 : 0;
        
        let btn = $(this);
        btn.text('Generating Preview...').prop('disabled', true);

        let canvasEl = document.querySelector('.outfit-canvas-area');
        let capturePromise;
        if (canvasEl && typeof html2canvas === 'function') {
            capturePromise = html2canvas(canvasEl, {
                backgroundColor: '#ffffff',
                scale: 0.5,           // Half resolution to save storage
                useCORS: true,
                allowTaint: true
            }).then(canvas => canvas.toDataURL('image/png')).catch(() => null);
        } else {
            capturePromise = Promise.resolve(null);
        }

        capturePromise.then(previewImage => {
            let outfitData = { id: currentOutfitId, top_id: topId, bottom_id: bottomId, shoes_id: shoesId, name: name, season: season, occasion: occasion, color: color, status: status, scheduleDate: scheduleDate, repeatWeekly: repeatWeekly, preview_image: previewImage };
            
            btn.text('Saving...'); 
            
            $.ajax({
                url: '../backend/save_outfit.php',
                type: 'POST',
                data: { outfitData: JSON.stringify(outfitData) },
                dataType: 'json',
                success: function(res) {
                    btn.text('Save to Closet').prop('disabled', false);
                    if(res.status === 200) {
                        bootstrap.Modal.getInstance(document.getElementById('previewModal')).hide();
                        alert('✅ Saved Successfully!');
                        // Return-to-calendar navigation
                        let returnParams = new URLSearchParams(window.location.search);
                        let returnDate = returnParams.get('return_date');
                        if (returnDate) {
                            window.location.href = 'calendar.html?goto_date=' + returnDate;
                        } else {
                            window.location.href = 'mycloset.html';
                        }
                    } else {
                        alert(res.message);
                    }
                },
                error: function() {
                    btn.text('Save to Closet').prop('disabled', false);
                    alert('Network Error connecting to server.');
                }
            });
        });
    });

    // Session shield
    $.ajax({
        url: '../backend/get_session.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 200) {
                $('#userNameDisplay').text(response.userName);
                
                // Show Admin Report link if admin
                if (response.role === 'admin') {
                    const dropdownMenu = document.querySelector('.dropdown-menu');
                    if (dropdownMenu) {
                        const adminLink = document.createElement('li');
                        adminLink.innerHTML = '<a class="dropdown-item" href="admin_report.html"><i class="bi bi-file-earmark-bar-graph me-2"></i>Admin Report</a>';
                        dropdownMenu.prepend(adminLink);
                    }
                }
            } else {
                window.location.href = '../MarketingPage/login.html';
            }
        },
        error: function() {
            console.error('Failed to fetch user session.');
            window.location.href = '../MarketingPage/login.html';
        }
    });

    $('.filter-checkbox').change(function() {
        applyFilters();
    });

    $('#searchInput').on('input', function() {
        applyFilters();
    });

    $('#categoryFilters .filter-pill').click(function() {
        $('#categoryFilters .filter-pill').removeClass('active');
        $(this).addClass('active');
        applyFilters();
    });

    // The filter logic
    function applyFilters() {
        let search = $('#searchInput').val().toLowerCase();
        let activeCategory = $('#categoryFilters .filter-pill.active').data('filter');
        let checkedTypes = { status: [], season: [], occasion: [], color: [] };
        
        $('.filter-checkbox:checked').each(function() {
            let type = $(this).data('type');
            let val = $(this).data('val');
            if (type && val) {
                checkedTypes[type].push(val);
            }
        });

        if (activeCategory === 'all') {
            $('.section-title, .item-group').show();
        } else {
            $('.section-title, .item-group').hide();
            $(`.item-group[data-category="${activeCategory}"], .section-title[data-category="${activeCategory}"]`).show();
        }

        $('.filter-item').each(function() {
            let $el = $(this);
            
            let matchStatus = checkedTypes.status.length === 0 || checkedTypes.status.some(c => $el.hasClass(c) || (c === 'status-ready' && !$el.hasClass('status-laundry')));
            let matchSeason = checkedTypes.season.length === 0 || checkedTypes.season.some(c => $el.hasClass(c) || $el.hasClass('season-all-season'));
            let matchOccasion = checkedTypes.occasion.length === 0 || checkedTypes.occasion.some(c => $el.hasClass(c) || $el.hasClass('occasion-any-occasion'));
            let matchColor = checkedTypes.color.length === 0 || checkedTypes.color.some(c => $el.hasClass(c));
            
            let itemName = $el.data('name').toLowerCase();
            let matchSearch = itemName.includes(search);

            let matchCategoryFilter = (activeCategory === 'all' || $el.hasClass(activeCategory));

            if (matchStatus && matchSeason && matchOccasion && matchColor && matchSearch && matchCategoryFilter) {
                $el.show();
            } else {
                $el.hide();
            }
        });
    }

    // Equip item to canvas
    $(document).on('click', '.clickable-item', function() {
        let isLaundry = $(this).closest('.filter-item').hasClass('status-laundry');
        
        let category = $(this).data('category');    // "top", "bottom", or "shoes"
        let imgSrc = $(this).data('img');            // Image URL
        let clothId = $(this).data('id');            // Database ID
        
        // Shows a yellow
        let warningBadge = isLaundry ? `<div style="position: absolute; top: 10px; left: 10px; z-index: 10; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" title="Item is in laundry">⚠️</div>` : '';
        
        let slotId = '#slot-' + category;
        $(slotId).html(`
            ${warningBadge}
            <img src="${imgSrc}" class="equipped-img" data-img="${imgSrc}" data-id="${clothId}">
            <button class="remove-item-btn" onclick="removeEquipped('${category}', event)">&times;</button>
        `);
    });

    window.removeEquipped = function(category, event) {
        if (event) event.stopPropagation();
        let icons = { 
            top: '<i class="bi bi-person-fill-up"></i>Top', 
            bottom: '<i class="bi bi-person-fill-down"></i>Bottom', 
            shoes: '<i class="bi bi-person-walking"></i>Shoes' 
        };
        $('#slot-' + category).html(`<div class="placeholder-text">${icons[category]}</div>`);
    };

    // Smart Randomizer outfit (Recommendation Engine)
    $("#btn-randomize").click(function() {
        let btn = $(this);
        let originalText = btn.html();
        btn.html('<i class="bi bi-hourglass-split"></i> Picking...').prop('disabled', true);
        
        let fetches = ['top', 'bottom', 'shoes'].map(cat => {
            return fetch('../backend/smart_randomizer.php?category=' + cat)
                .then(res => {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                })
                .then(data => {
                    let slotId = '#slot-' + cat;
                    if (data.status === 200 && data.item) {
                        let clothId = data.item.id;
                        let imgSrc = data.item.image;
                        let warningBadge = data.item.status === 'laundry' ? `<div style="position: absolute; top: 10px; left: 10px; z-index: 10; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" title="Item is in laundry">⚠️</div>` : '';
                        $(slotId).html(`
                            ${warningBadge}
                            <img src="${imgSrc}" class="equipped-img" data-img="${imgSrc}" data-id="${clothId}">
                            <button class="remove-item-btn" onclick="removeEquipped('${cat}', event)">&times;</button>
                        `);
                    } else {
                        // Keep current if nothing found, or clear if slot was empty
                    }
                })
                .catch(err => console.error("Randomizer fetch error for " + cat, err));
        });

        Promise.all(fetches).finally(() => {
            btn.html(originalText).prop('disabled', false);
        });
    });

    // Load clothing inventory
    fetch('../backend/get_clothes.php')
    .then(res => res.json())
    .then(data => {
        if (data.status === 200) {
            const categoryMap = { 'top': 'topsRow', 'bottom': 'bottomsRow', 'shoes': 'shoesRow' };
            data.clothes.reverse().forEach(item => {
                let targetRow = document.getElementById(categoryMap[item.category]);
                if (!targetRow) return;
                
                let newItem = document.createElement('div');
                newItem.className = `scroll-item filter-item ${item.category} status-${item.status} season-${item.season} occasion-${item.occasion} color-${item.color}`;
                newItem.setAttribute('data-name', item.name);
                let lastWornText = item.last_worn ? item.last_worn : 'Never';
                newItem.innerHTML = `
                    <div class="item-card clickable-item" style="position: relative;" data-category="${item.category}" data-img="${item.image}" data-id="${item.id}">
                        ${item.status === 'laundry' ? '<span class="badge bg-danger position-absolute bottom-0 start-0 m-2">In Laundry</span>' : ''}
                        <div class="position-absolute top-0 start-0 m-2 bg-dark text-white rounded px-2 py-1" style="font-size: 10px; z-index: 5; opacity: 0.8; pointer-events: none;" title="Times Worn / Last Worn">
                            <i class="bi bi-arrow-repeat"></i> ${item.wear_count || 0} | <i class="bi bi-calendar-check"></i> ${lastWornText}
                        </div>
                        <button class="btn-delete-cloth" onclick="event.stopPropagation(); deleteClothItem(${item.id}, this, '${item.category}');" title="Delete item"
                            style="position: absolute; top: 6px; right: 6px; z-index: 10; width: 26px; height: 26px; border-radius: 50%; border: none; background: rgba(255,77,77,0.9); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.2s ease; line-height: 1; padding: 0;">
                            <i class="bi bi-trash3" style="font-size: 12px;"></i>
                        </button>
                        <img src="${item.image}" class="item-img" style="${item.status === 'laundry' ? 'opacity: 0.5;' : ''}; object-fit: contain;">
                        <div class="item-title ${item.status === 'laundry' ? 'text-muted' : ''}">${item.name}</div>
                    </div>
                `;
                targetRow.prepend(newItem);
                
                newItem.addEventListener('mouseenter', () => { newItem.querySelector('.btn-delete-cloth').style.opacity = '1'; });
                newItem.addEventListener('mouseleave', () => { newItem.querySelector('.btn-delete-cloth').style.opacity = '0'; });
            });
            applyFilters();
        }
    })
    .catch(err => console.error(err));

    // Delete clothing from builder
    window.deleteClothItem = function(clothId, btnEl, category) {
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
                const card = document.querySelector(`.clickable-item[data-id="${clothId}"]`).closest('.filter-item');
                if (card) {
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.remove();
                        let currentEqpId = $('#slot-' + category + ' .equipped-img').data('id');
                        if (currentEqpId == clothId) {
                            window.removeEquipped(category);
                        }
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
    };

    let urlParams = new URLSearchParams(window.location.search);
    let outfitId = urlParams.get('id');
    if (outfitId) {
        $('#saveOutfitBtn').html('Update Outfit <i class="bi bi-cloud-arrow-up ms-2 fs-5"></i>');
        $('.canvas-title').text('Edit Outfit');
        
        fetch('../backend/get_outfit.php?id=' + outfitId)
        .then(res => res.json())
        .then(data => {
            if (data.status === 200 && data.outfit) {
                let outfit = data.outfit;
                // Pre
                $('.name-input').val(outfit.name);
                // Live status
                let liveInLaundry = (outfit.top_status === 'laundry' || outfit.bottom_status === 'laundry' || outfit.shoes_status === 'laundry');
                $('#val-status').text(liveInLaundry ? 'In Laundry' : 'Available');
                $('#val-season').text(outfit.season === 'all-season' ? 'Any Season' : (outfit.season.charAt(0).toUpperCase() + outfit.season.slice(1)));
                $('#val-occasion').text(outfit.occasion === 'any-occasion' ? 'Any Occasion' : (outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1)));
                $('#val-color').text(outfit.color.charAt(0).toUpperCase() + outfit.color.slice(1));
                
                // Pre
                if (outfit.top_image) $('#slot-top').html(`<img src="${outfit.top_image}" class="equipped-img" data-img="${outfit.top_image}" data-id="${outfit.top_id}"><button class="remove-item-btn" onclick="removeEquipped('top', event)">&times;</button>`);
                if (outfit.bottom_image) $('#slot-bottom').html(`<img src="${outfit.bottom_image}" class="equipped-img" data-img="${outfit.bottom_image}" data-id="${outfit.bottom_id}"><button class="remove-item-btn" onclick="removeEquipped('bottom', event)">&times;</button>`);
                if (outfit.shoes_image) $('#slot-shoes').html(`<img src="${outfit.shoes_image}" class="equipped-img" data-img="${outfit.shoes_image}" data-id="${outfit.shoes_id}"><button class="remove-item-btn" onclick="removeEquipped('shoes', event)">&times;</button>`);
                
                // Pre
                if (outfit.scheduled_date) {
                    $('#scheduleDateInput').val(outfit.scheduled_date);
                    $('#scheduleDateInput').trigger('change');
                }
            }
        })
        .catch(err => console.error("Error loading outfit:", err));
    }

    // Delete outfit button
    $('#deleteOutfitBtn').click(function() {
        if (!confirm('Are you sure you want to delete this outfit? This action cannot be undone.')) return;
        
        let outfitName = $('.name-input').val().trim() || 'this outfit';
        let btn = $(this);
        btn.text('Deleting...').prop('disabled', true);
        
        let urlParams = new URLSearchParams(window.location.search);
        let outfitId = urlParams.get('id');
        
        if (outfitId) {
            // Edit mode
            $.ajax({
                url: '../backend/delete_outfit.php',
                type: 'POST',
                data: { outfit_id: outfitId },
                dataType: 'json',
                success: function(res) {
                    if (res.status === 200) {
                        alert('Outfit deleted successfully!');
                        window.location.href = 'mycloset.html';
                    } else {
                        alert(res.message);
                        btn.html('<i class="bi bi-trash3 me-2 fs-5"></i> Delete Outfit').prop('disabled', false);
                    }
                },
                error: function() {
                    alert('Network error while deleting.');
                    btn.html('<i class="bi bi-trash3 me-2 fs-5"></i> Delete Outfit').prop('disabled', false);
                }
            });
        } else {
            // Create mode
            ['top', 'bottom', 'shoes'].forEach(cat => window.removeEquipped(cat));
            $('.name-input').val('');
            alert('Canvas cleared!');
            btn.html('<i class="bi bi-trash3 me-2 fs-5"></i> Delete Outfit').prop('disabled', false);
        }
    });

});
