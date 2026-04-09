

let currentCategory = 'all';

function filterCategory(category, buttonElement) {
    currentCategory = category;

    document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active', 'bg-black', 'text-white'));
    buttonElement.classList.add('active', 'bg-black', 'text-white');

    const titles = document.querySelectorAll('.section-title');
    if (category === 'all') {
        titles.forEach(t => t.style.display = 'block');
    } else {
        titles.forEach(t => t.style.display = 'none');
    }

    applyFilters();
}

let currentGallerySearch = '';

function handleGallerySearch() {
    const searchInput = document.getElementById('gallerySearchInput');
    currentGallerySearch = searchInput ? searchInput.value.trim().toLowerCase() : '';
    applyFilters();
}

function applyFilters() {
    const availNode = document.getElementById('filter-status-availability');
    const readyNode = document.getElementById('filter-ready');
    const ready = readyNode ? readyNode.checked : (availNode ? availNode.checked : false);
    
    const laundryNode = document.getElementById('filter-laundry');
    const laundryStatNode = document.getElementById('filter-status-laundry');
    const laundry = laundryNode ? laundryNode.checked : (laundryStatNode ? laundryStatNode.checked : false);
    
    const hasStatusChecked = ready || laundry;

    const springNode = document.getElementById('filter-season-spring');
    const spring = springNode ? springNode.checked : false;
    const summerNode = document.getElementById('filter-season-summer');
    const summer = summerNode ? summerNode.checked : false;
    const fallNode = document.getElementById('filter-season-fall');
    const fall = fallNode ? fallNode.checked : false;
    const winterNode = document.getElementById('filter-season-winter');
    const winter = winterNode ? winterNode.checked : false;
    const hasSeasonChecked = spring || summer || fall || winter;

    const workNode = document.getElementById('filter-occasion-work');
    const work = workNode ? workNode.checked : false;
    const casualNode = document.getElementById('filter-occasion-casual');
    const casual = casualNode ? casualNode.checked : false;
    const dateNode = document.getElementById('filter-occasion-date');
    const date = dateNode ? dateNode.checked : false;
    const sportsNode = document.getElementById('filter-occasion-sports');
    const sports = sportsNode ? sportsNode.checked : false;
    const formalNode = document.getElementById('filter-occasion-formal');
    const formal = formalNode ? formalNode.checked : false;
    const homeNode = document.getElementById('filter-occasion-home');
    const home = homeNode ? homeNode.checked : false;
    const hasOccasionChecked = work || casual || date || sports || formal || home;

    const blackNode = document.getElementById('filter-color-black');
    const black = blackNode ? blackNode.checked : false;
    const whiteNode = document.getElementById('filter-color-white');
    const white = whiteNode ? whiteNode.checked : false;
    const blueNode = document.getElementById('filter-color-blue');
    const blue = blueNode ? blueNode.checked : false;
    const grayNode = document.getElementById('filter-color-gray');
    const gray = grayNode ? grayNode.checked : false;
    const brownNode = document.getElementById('filter-color-brown');
    const brown = brownNode ? brownNode.checked : false;
    const redNode = document.getElementById('filter-color-red');
    const red = redNode ? redNode.checked : false;
    const greenNode = document.getElementById('filter-color-green');
    const green = greenNode ? greenNode.checked : false;
    const khakiNode = document.getElementById('filter-color-khaki');
    const khaki = khakiNode ? khakiNode.checked : false;
    const yellowNode = document.getElementById('filter-color-yellow');
    const yellow = yellowNode ? yellowNode.checked : false;
    const hasColorChecked = black || white || blue || gray || brown || red || green || khaki || yellow;

    const items = document.querySelectorAll('.filter-item');
    
    items.forEach(item => {
        const matchCategory = (currentCategory === 'all' || item.classList.contains(currentCategory));

        let matchStatus = !hasStatusChecked;
        if (hasStatusChecked) {
            if (ready && (item.classList.contains('status-ready') || item.classList.contains('status-availability'))) matchStatus = true;
            if (laundry && item.classList.contains('status-laundry')) matchStatus = true;
        }

        // Checks SEASON match
        let matchSeason = !hasSeasonChecked;
        if (hasSeasonChecked) {
            if (spring && item.classList.contains('season-spring')) matchSeason = true;
            if (summer && item.classList.contains('season-summer')) matchSeason = true;
            if (fall && item.classList.contains('season-fall')) matchSeason = true;
            if (winter && item.classList.contains('season-winter')) matchSeason = true;
        }

        // Checks OCCASION match
        let matchOccasion = !hasOccasionChecked;
        if (hasOccasionChecked) {
            if (work && item.classList.contains('occasion-work')) matchOccasion = true;
            if (casual && item.classList.contains('occasion-casual')) matchOccasion = true;
            if (date && item.classList.contains('occasion-date')) matchOccasion = true;
            if (sports && item.classList.contains('occasion-sports')) matchOccasion = true;
            if (formal && item.classList.contains('occasion-formal')) matchOccasion = true;
            if (home && item.classList.contains('occasion-home')) matchOccasion = true;
        }

        // Checks COLOR match
        let matchColor = !hasColorChecked;
        if (hasColorChecked) {
            if (black && item.classList.contains('color-black')) matchColor = true;
            if (white && item.classList.contains('color-white')) matchColor = true;
            if (blue && item.classList.contains('color-blue')) matchColor = true;
            if (gray && item.classList.contains('color-gray')) matchColor = true;
            if (brown && item.classList.contains('color-brown')) matchColor = true;
            if (red && item.classList.contains('color-red')) matchColor = true;
            if (green && item.classList.contains('color-green')) matchColor = true;
            if (khaki && item.classList.contains('color-khaki')) matchColor = true;
            if (yellow && item.classList.contains('color-yellow')) matchColor = true;
        }

        // Checks SEARCH match
        let matchSearch = true;
        if (currentGallerySearch) {
            const titleEl = item.querySelector('.item-title');
            const itemName = titleEl ? titleEl.textContent.trim().toLowerCase() : '';
            matchSearch = itemName.includes(currentGallerySearch);
        }

        if (matchCategory && matchStatus && matchSeason && matchOccasion && matchColor && matchSearch) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    // Adjusts the scroll
    document.querySelectorAll('.filter-grid, .scroll-row').forEach(grid => {
        let hasVisible = false;
        grid.querySelectorAll('.filter-item').forEach(item => {
            if (item.style.display !== 'none') hasVisible = true;
        });
        
        if (currentCategory === 'all') {
            // Horizontal scroll mode
            grid.style.display = 'flex';
            grid.style.flexWrap = 'nowrap';
            grid.style.overflowX = 'auto';
        } else {
            // Grid wrap mode
            grid.style.display = hasVisible ? 'flex' : 'none';
            grid.style.flexWrap = 'wrap';
            grid.style.overflowX = 'visible';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    applyFilters();
});
