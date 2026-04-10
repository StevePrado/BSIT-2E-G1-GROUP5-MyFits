


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
        var category = $('#val-category').text();
        var status = $('#val-status').text();
        var season = $('#val-season').text();
        var occasion = $('#val-occasion').text();
        var color = $('#val-color').text();
        var scheduleDate = $('#scheduleDateInput').val();
        var repeatWeekly = $('#repeatWeeklyToggle').is(':checked');
        let displayDate = scheduleDate ? scheduleDate + (repeatWeekly ? ' (Weekly)' : '') : 'Unscheduled';

        // Displays tags as emoji
        $('#previewInfo').html(
            '<h5 class="fw-bold mb-3">' + outfitName + '</h5>' +
            '<span class="badge bg-dark rounded-pill me-1 px-3 py-2 fw-medium text-white mb-2"><span class="me-1">👕</span> ' + category + '</span>' +
            '<span class="badge bg-dark rounded-pill me-1 px-3 py-2 fw-medium text-white mb-2"><span class="me-1">✅</span> ' + status + '</span>' +
            '<span class="badge bg-dark rounded-pill me-1 px-3 py-2 fw-medium text-white mb-2"><span class="me-1">🌸</span> ' + season + '</span>' +
            '<span class="badge bg-dark rounded-pill me-1 px-3 py-2 fw-medium text-white mb-2"><span class="me-1">💼</span> ' + occasion + '</span>' +
            '<span class="badge bg-dark rounded-pill me-1 px-3 py-2 fw-medium text-white mb-2"><span class="me-1">🎨</span> ' + color + '</span>' +
            '<span class="badge bg-dark rounded-pill me-1 px-3 py-2 fw-medium text-white mb-2"><i class="bi bi-calendar-event me-2"></i>' + displayDate + '</span>'
        );

        var modal = new bootstrap.Modal(document.getElementById('previewModal'));
        modal.show();
    });

    $('#confirmSaveBtn').click(function() {
        let topId = $('#slot-top .equipped-img').data('id') || null;
        let bottomId = $('#slot-bottom .equipped-img').data('id') || null;
        let shoesId = $('#slot-shoes .equipped-img').data('id') || null;
        let name = $('.name-input').val().trim() || 'Untitled Outfit';
        
        let rawStatus = $('#val-status').text().trim();
        let status = rawStatus === 'In Laundry' ? 'laundry' : 'ready';
        
        let rawSeason = $('#val-season').text().trim();
        let season = rawSeason === 'Any Season' ? 'all-season' : rawSeason.toLowerCase();
        
        let rawOccasion = $('#val-occasion').text().trim();
        let occasion = rawOccasion === 'Any Occasion' ? 'any-occasion' : rawOccasion.toLowerCase();
        
        let color = $('#val-color').text().trim().toLowerCase();
        let scheduleDate = $('#scheduleDateInput').val() || null;
        let repeatWeekly = $('#repeatWeeklyToggle').is(':checked') ? 1 : 0;
        
        let outfitData = { id: outfitId, top_id: topId, bottom_id: bottomId, shoes_id: shoesId, name: name, season: season, occasion: occasion, color: color, status: status, scheduleDate: scheduleDate, repeatWeekly: repeatWeekly };
        
        let btn = $(this);
        btn.text('Updating...').prop('disabled', true);
        
        $.ajax({
            url: '../backend/save_outfit.php',
            type: 'POST',
            data: { outfitData: JSON.stringify(outfitData) },
            dataType: 'json',
            success: function(res) {
                btn.text('Confirm Update').prop('disabled', false);
                if(res.status === 200) {
                    bootstrap.Modal.getInstance(document.getElementById('previewModal')).hide();
                    alert('Outfit updated successfully!');
                    window.location.href = 'mycloset.html';
                } else {
                    alert(res.message);
                }
            },
            error: function() {
                btn.text('Confirm Update').prop('disabled', false);
                alert('Network Error connecting to server.');
            }
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
            } else {
                window.location.href = '../MarketingPage/login.html';
            }
        },
        error: function() {
            console.error('Failed to fetch user session.');
            window.location.href = '../MarketingPage/login.html';
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const outfitId = urlParams.get('id');

    if (outfitId) {
        $.ajax({
            url: '../backend/get_outfit.php',
            type: 'GET',
            data: { id: outfitId },
            dataType: 'json',
            success: function(res) {
                if (res.status === 200) {
                    const outfit = res.outfit;
                    
                    $('.name-input').val(outfit.name);
                    
                    // Live status
                    let liveInLaundry = (outfit.top_status === 'laundry' || outfit.bottom_status === 'laundry' || outfit.shoes_status === 'laundry');
                    $('#val-status').text(liveInLaundry ? 'In Laundry' : 'Available');
                    $('#val-season').text(outfit.season === 'all-season' ? 'Any Season' : (outfit.season.charAt(0).toUpperCase() + outfit.season.slice(1)));
                    $('#val-occasion').text(outfit.occasion === 'any-occasion' ? 'Any Occasion' : (outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1)));
                    $('#val-color').text(outfit.color.charAt(0).toUpperCase() + outfit.color.slice(1));
                    
                    if (outfit.scheduled_date) {
                        $('#scheduleDateInput').val(outfit.scheduled_date);
                    }
                    $('#repeatWeeklyToggle').prop('checked', outfit.is_recurring == 1);
                    
                    // Pre-populate canvas slots with laundry badges
                    if (outfit.top_id) {
                        let topLaundryBadge = outfit.top_status === 'laundry' ? `<div style="position: absolute; top: 10px; left: 10px; z-index: 10; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" title="Item is in laundry">⚠️</div>` : '';
                        $('#slot-top').html(`
                            ${topLaundryBadge}
                            <img src="${outfit.top_image}" class="equipped-img" data-img="${outfit.top_image}" data-id="${outfit.top_id}">
                            <button class="remove-item-btn" onclick="removeEquipped('top', event)">&times;</button>
                        `);
                    }
                    if (outfit.bottom_id) {
                        let bottomLaundryBadge = outfit.bottom_status === 'laundry' ? `<div style="position: absolute; top: 10px; left: 10px; z-index: 10; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" title="Item is in laundry">⚠️</div>` : '';
                        $('#slot-bottom').html(`
                            ${bottomLaundryBadge}
                            <img src="${outfit.bottom_image}" class="equipped-img" data-img="${outfit.bottom_image}" data-id="${outfit.bottom_id}">
                            <button class="remove-item-btn" onclick="removeEquipped('bottom', event)">&times;</button>
                        `);
                    }
                    if (outfit.shoes_id) {
                        let shoesLaundryBadge = outfit.shoes_status === 'laundry' ? `<div style="position: absolute; top: 10px; left: 10px; z-index: 10; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" title="Item is in laundry">⚠️</div>` : '';
                        $('#slot-shoes').html(`
                            ${shoesLaundryBadge}
                            <img src="${outfit.shoes_image}" class="equipped-img" data-img="${outfit.shoes_image}" data-id="${outfit.shoes_id}">
                            <button class="remove-item-btn" onclick="removeEquipped('shoes', event)">&times;</button>
                        `);
                    }
                } else {
                    console.error('Outfit not found:', res.message);
                }
            },
            error: function() {
                console.error('Failed to fetch outfit details.');
            }
        });
    }

    // Sidebar filter engine
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
        
        let category = $(this).data('category');
        let imgSrc = $(this).data('img');
        let clothId = $(this).data('id');
        
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

    // Randomize outfit
    $("#btn-randomize").click(function() {
        ['top', 'bottom', 'shoes'].forEach(cat => {
            let items = $(`.filter-item.${cat}:visible .clickable-item`);
            if (items.length > 0) {
                let randomIdx = Math.floor(Math.random() * items.length);
                let randomItem = $(items[randomIdx]);
                let imgSrc = randomItem.data('img');
                let clothId = randomItem.data('id');
                let isLaundry = randomItem.closest('.filter-item').hasClass('status-laundry');
                let warningBadge = isLaundry ? `<div style="position: absolute; top: 10px; left: 10px; z-index: 10; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" title="Item is in laundry">⚠️</div>` : '';
                
                let slotId = '#slot-' + cat;
                $(slotId).html(`
                    ${warningBadge}
                    <img src="${imgSrc}" class="equipped-img" data-img="${imgSrc}" data-id="${clothId}">
                    <button class="remove-item-btn" onclick="removeEquipped('${cat}', event)">&times;</button>
                `);
            } else {
                window.removeEquipped(cat);
            }
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
                newItem.innerHTML = `
                    <div class="item-card clickable-item pb-2 shadow-sm" data-category="${item.category}" data-img="${item.image}" data-id="${item.id}">
                        ${item.status === 'laundry' ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2">In Laundry</span>' : ''}
                        <img src="${item.image}" class="item-img" style="${item.status === 'laundry' ? 'opacity: 0.5;' : ''} object-fit: contain;">
                        <div class="item-title ${item.status === 'laundry' ? 'text-muted' : ''}">${item.name}</div>
                    </div>
                `;
                targetRow.prepend(newItem);
            });
            applyFilters();

            // Auto
            if($('.filter-item.top').length > 0) {
                let firstTop = $('.filter-item.top .clickable-item').first();
                $('#slot-top').html(`<img src="${firstTop.data('img')}" class="equipped-img" data-img="${firstTop.data('img')}" data-id="${firstTop.data('id')}"><button class="remove-item-btn" onclick="removeEquipped('top', event)">&times;</button>`);
            }
            if($('.filter-item.bottom').length > 0) {
                let firstBottom = $('.filter-item.bottom .clickable-item').first();
                $('#slot-bottom').html(`<img src="${firstBottom.data('img')}" class="equipped-img" data-img="${firstBottom.data('img')}" data-id="${firstBottom.data('id')}"><button class="remove-item-btn" onclick="removeEquipped('bottom', event)">&times;</button>`);
            }
        }
    })
    .catch(err => console.error(err));

    // Delete outfit button
    $('#deleteOutfitBtn').click(function() {
        if (!confirm('Are you sure you want to delete this outfit? This action cannot be undone.')) return;
        
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
