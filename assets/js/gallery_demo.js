

$(document).ready(function() {

    // Demo clothing data
    const demoClothes = [
        { id: 1,  name: 'Black Sweater',   category: 'top',    image: '../assets/images/Shirt1.jpg', status: 'ready',   season: 'fall',   occasion: 'casual', color: 'black' },
        { id: 2,  name: 'Graphic Tee',     category: 'top',    image: '../assets/images/Shirt2.jpg', status: 'laundry', season: 'summer', occasion: 'casual', color: 'white' },
        { id: 3,  name: 'White Polo',      category: 'top',    image: '../assets/images/Shirt1.jpg', status: 'ready',   season: 'spring', occasion: 'work',   color: 'white' },
        { id: 4,  name: 'Blue Denim',      category: 'bottom', image: '../assets/images/Pants1.jpg', status: 'ready',   season: 'spring', occasion: 'casual', color: 'blue' },
        { id: 5,  name: 'Black Trousers',  category: 'bottom', image: '../assets/images/Pants2.jpg', status: 'ready',   season: 'fall',   occasion: 'work',   color: 'black' },
        { id: 6,  name: 'Cargo Shorts',    category: 'bottom', image: '../assets/images/Pants1.jpg', status: 'laundry', season: 'summer', occasion: 'sports', color: 'blue' },
        { id: 7,  name: 'White Sneakers',  category: 'shoes',  image: '../assets/images/Shoes1.jpg', status: 'ready',   season: 'spring', occasion: 'casual', color: 'white' },
        { id: 8,  name: 'Black Boots',     category: 'shoes',  image: '../assets/images/Shoes2.jpg', status: 'ready',   season: 'fall',   occasion: 'work',   color: 'black' },
        { id: 9,  name: 'Running Shoes',   category: 'shoes',  image: '../assets/images/Shoes1.jpg', status: 'ready',   season: 'summer', occasion: 'sports', color: 'white' }
    ];

    // Render demo items
    const categoryMap = { 'top': 'topsRow', 'bottom': 'bottomsRow', 'shoes': 'shoesRow' };

    let tooltipMsg = "Our system automatically tracks your dirty clothes so you never plan a fit you can't wear.";

    demoClothes.forEach(item => {
        let targetRow = document.getElementById(categoryMap[item.category]);
        if (!targetRow) return;

        let newItem = document.createElement('div');
        newItem.className = `scroll-item filter-item ${item.category} status-${item.status} season-${item.season} occasion-${item.occasion} color-${item.color}`;
        newItem.setAttribute('data-name', item.name);
        newItem.innerHTML = `
            <div class="item-card clickable-item pb-2 shadow-sm" data-category="${item.category}" data-img="${item.image}" data-id="${item.id}">
                ${item.status === 'laundry' ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2" data-bs-toggle="tooltip" data-bs-placement="top" title="${tooltipMsg}">In Laundry</span>` : ''}
                <img src="${item.image}" class="item-img" style="${item.status === 'laundry' ? 'opacity: 0.5;' : ''} object-fit: contain;">
                <div class="item-title ${item.status === 'laundry' ? 'text-muted' : ''}">${item.name}</div>
            </div>
        `;
        targetRow.appendChild(newItem);
    });

    // Equip item to canvas
    $(document).on('click', '.clickable-item', function() {
        let isLaundry = $(this).closest('.filter-item').hasClass('status-laundry');
        let category = $(this).data('category');
        let imgSrc = $(this).data('img');
        let clothId = $(this).data('id');
        
        let warningBadge = isLaundry ? `<div style="position: absolute; top: 10px; left: 10px; z-index: 10; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5); cursor: help;" data-bs-toggle="tooltip" data-bs-placement="right" title="${tooltipMsg}">⚠️</div>` : '';
        
        let slotId = '#slot-' + category;
        $(slotId).html(`
            ${warningBadge}
            <img src="${imgSrc}" class="equipped-img" data-img="${imgSrc}" data-id="${clothId}">
            <button class="remove-item-btn" onclick="removeEquipped('${category}', event)">&times;</button>
        `);
        
        initTooltips();
    });

    // Remove equipped item
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
        let tooltipMsg = "Our system automatically tracks your dirty clothes so you never plan a fit you can't wear.";
        
        ['top', 'bottom', 'shoes'].forEach(cat => {
            let items = $(`.filter-item.${cat}:visible .clickable-item`);
            if (items.length > 0) {
                let randomIdx = Math.floor(Math.random() * items.length);
                let randomItem = $(items[randomIdx]);
                let imgSrc = randomItem.data('img');
                let clothId = randomItem.data('id');
                let isLaundry = randomItem.closest('.filter-item').hasClass('status-laundry');
                let warningBadge = isLaundry ? `<div style="position: absolute; top: 10px; left: 10px; z-index: 10; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5); cursor: help;" data-bs-toggle="tooltip" data-bs-placement="right" title="${tooltipMsg}">⚠️</div>` : '';
                
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
        
        initTooltips();
    });

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
            let matchSeason = checkedTypes.season.length === 0 || checkedTypes.season.some(c => $el.hasClass(c));
            let matchOccasion = checkedTypes.occasion.length === 0 || checkedTypes.occasion.some(c => $el.hasClass(c));
            let matchColor = checkedTypes.color.length === 0 || checkedTypes.color.some(c => $el.hasClass(c));
            
            let itemName = ($el.data('name') || '').toLowerCase();
            let matchSearch = itemName.includes(search);

            let matchCategoryFilter = (activeCategory === 'all' || $el.hasClass(activeCategory));

            if (matchStatus && matchSeason && matchOccasion && matchColor && matchSearch && matchCategoryFilter) {
                $el.show();
            } else {
                $el.hide();
            }
        });
    }

    // Auto-equip first items & tooltips
    // Pre
    if($('.filter-item.top').length > 0) {
        let firstTop = $('.filter-item.top .clickable-item').first();
        $('#slot-top').html(`<img src="${firstTop.data('img')}" class="equipped-img" data-img="${firstTop.data('img')}" data-id="${firstTop.data('id')}"><button class="remove-item-btn" onclick="removeEquipped('top', event)">&times;</button>`);
    }
    if($('.filter-item.bottom').length > 0) {
        let firstBottom = $('.filter-item.bottom .clickable-item').first();
        $('#slot-bottom').html(`<img src="${firstBottom.data('img')}" class="equipped-img" data-img="${firstBottom.data('img')}" data-id="${firstBottom.data('id')}"><button class="remove-item-btn" onclick="removeEquipped('bottom', event)">&times;</button>`);
    }

    // Utility function to re
    function initTooltips() {
        $('[data-bs-toggle="tooltip"]').tooltip('dispose').tooltip();
    }
    
    initTooltips();

});
