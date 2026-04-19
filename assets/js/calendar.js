


// Global state variables
const today = new Date();
today.setHours(0, 0, 0, 0);

let currentWeekStart = getMonday(new Date(today));
let currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);

let allOutfits = [];
let weekSchedules = {};
let monthSchedules = {};

// Modal state
let modalDate = null;
let modalExistingScheduleId = null;
let modalSelectedOutfitId = null;
let modalIsRecurring = false;

// Date helper functions
function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function formatDateISO(d) {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
}

function formatDateDisplay(d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatDateShort(d) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
}

const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Weekly view — navigation
function changeWeek(dir) {
    currentWeekStart.setDate(currentWeekStart.getDate() + (dir * 7));
    renderWeekView();
}

function goToToday() {
    currentWeekStart = getMonday(new Date(today));
    renderWeekView();
}

function renderWeekView() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    document.getElementById('weekDateRange').textContent =
        `${formatDateShort(currentWeekStart)} - ${formatDateShort(weekEnd)}`;

    fetch(`../backend/get_schedules.php?start_date=${formatDateISO(currentWeekStart)}&end_date=${formatDateISO(weekEnd)}`)
        .then(r => r.json())
        .then(data => {
            weekSchedules = {};
            if (data.status === 200) {
                data.schedules.forEach(s => {
                    weekSchedules[s.scheduled_date] = s;
                });
            }
            buildWeekCards();
        })
        .catch(err => {
            console.error('Error loading schedules:', err);
            weekSchedules = {};
            buildWeekCards();
        });
}

// Weekly view — card builder
// Builds 7 day
function buildWeekCards() {
    const row1 = document.getElementById('weekRow1');
    const row2 = document.getElementById('weekRow2');
    row1.innerHTML = '';
    row2.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        const dateISO = formatDateISO(d);
        const schedule = weekSchedules[dateISO] || null;
        const isToday = isSameDay(d, today);

        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = `day-card${isToday ? ' today-card' : ''}`;
        card.onclick = () => openScheduleModal(d, schedule);

        const header = document.createElement('div');
        header.innerHTML = `
                    <div class="day-name">${dayNames[d.getDay()]}${isToday ? ' <span class="badge bg-dark ms-1" style="font-size:0.65rem;">TODAY</span>' : ''}</div>
                    <span class="day-date">${formatDateDisplay(d)}</span>
                `;

        const slotWrapper = document.createElement('div');
        slotWrapper.className = 'slot-wrapper';

        if (schedule) {
            const filled = document.createElement('div');
            filled.className = 'filled-slot';

            let imagesHtml = '<div class="outfit-preview-stack">';
            if (schedule.top_image) imagesHtml += `<img src="${schedule.top_image}" style="height: 130px; z-index:3; position:relative; mix-blend-mode: multiply;">`;
            if (schedule.bottom_image) imagesHtml += `<img src="${schedule.bottom_image}" style="height: 175px; z-index:2; position:relative; margin-top:${schedule.top_image ? '-60px' : '0'}; mix-blend-mode: multiply;">`;
            if (schedule.shoes_image) imagesHtml += `<img src="${schedule.shoes_image}" style="height: 75px; z-index:4; position:relative; margin-top:-30px; mix-blend-mode: multiply;">`;
            if (!schedule.top_image && !schedule.bottom_image && !schedule.shoes_image) {
                imagesHtml += '<div style="height: 220px; display:flex; align-items:center; justify-content:center; color:#999; font-weight:600;"><i class="bi bi-hanger" style="font-size:3rem"></i></div>';
            }
            imagesHtml += '</div>';
            filled.innerHTML = imagesHtml;

            const nameTag = document.createElement('div');
            nameTag.className = 'text-center fw-bold small text-uppercase mt-2 mb-1';
            nameTag.textContent = schedule.outfit_name;

            slotWrapper.appendChild(filled);
            slotWrapper.appendChild(nameTag);

            const actionDiv = document.createElement('div');
            actionDiv.className = 'mt-auto pt-2';
            actionDiv.onclick = (e) => e.stopPropagation();

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (d < now) {
                if (schedule.is_worn >= 1) {
                    actionDiv.innerHTML = `<button class="btn btn-sm btn-outline-secondary w-100 fw-bold disabled" style="font-size:0.75rem; border:none; opacity:1;"><i class="bi bi-clock-history me-1"></i>Worn</button>`;
                } else {
                    actionDiv.innerHTML = `<button class="btn btn-sm btn-outline-secondary w-100 fw-bold disabled" style="font-size:0.75rem; border:none; opacity:1;"><i class="bi bi-calendar-event me-1"></i>Past</button>`;
                }
            } else if (d > now) {
                if (schedule.in_laundry) {
                    actionDiv.innerHTML = `<button class="btn btn-sm w-100 fw-bold disabled" style="font-size:0.75rem; background-color: #ffc107; color: #000; border: none; opacity: 1;"><i class="bi bi-exclamation-triangle-fill me-1"></i>In Laundry</button>`;
                } else {
                    actionDiv.innerHTML = `<button class="btn btn-sm btn-outline-primary w-100 fw-bold disabled" style="font-size:0.75rem;"><i class="bi bi-calendar-event me-1"></i>Upcoming</button>`;
                }
            } else {

                if (schedule.is_worn == 0) {
                    if (schedule.in_laundry) {
                        actionDiv.innerHTML = `<button class="btn btn-sm w-100 fw-bold disabled" style="font-size:0.75rem; background-color: #ffc107; color: #000; border: none; opacity: 1;"><i class="bi bi-exclamation-triangle-fill me-1"></i>In Laundry</button>`;
                    } else {
                        actionDiv.innerHTML = `<button class="btn btn-sm btn-outline-success w-100 fw-bold" style="font-size:0.75rem;" data-schedule-id="${schedule.id}" data-date="${schedule.scheduled_date}" onclick="handleOutfitAction(this, 'wear')"><i class="bi bi-play-circle me-1"></i>Wear</button>`;
                    }
                } else if (schedule.is_worn == 1) {
                    actionDiv.innerHTML = `
                                <div class="d-flex flex-column gap-1">
                                    <button class="btn btn-sm btn-warning w-100 fw-bold" style="font-size:0.7rem; padding: 4px 5px;" data-schedule-id="${schedule.id}" data-date="${schedule.scheduled_date}" onclick="handleOutfitAction(this, 'laundry')"><i class="bi bi-basket me-1"></i>Put in Laundry</button>
                                    <button class="btn btn-sm btn-outline-danger w-100 fw-bold" style="font-size:0.7rem; padding: 2px 5px;" data-schedule-id="${schedule.id}" onclick="undoOutfitAction(this)">Undo</button>
                                </div>`;
                } else if (schedule.is_worn == 2) {
                    actionDiv.innerHTML = `
                                <div class="d-flex flex-column gap-1">
                                    <span class="text-success fw-bold text-center" style="font-size:0.7rem;"><i class="bi bi-check-circle-fill"></i> Finished Wearing</span>
                                    <button class="btn btn-sm btn-outline-danger w-100 fw-bold" style="font-size:0.7rem; padding: 2px 5px;" data-schedule-id="${schedule.id}" onclick="undoOutfitAction(this)">Undo</button>
                                </div>`;
                }
            }
            slotWrapper.appendChild(actionDiv);
        } else {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'empty-slot';
            emptySlot.innerHTML = `
                        <i class="bi bi-calendar-plus fs-3 mb-2"></i>
                        <span class="small fw-semibold">No outfit planned</span>
                        <button class="btn-plan-fit">+ Plan Fit</button>
                    `;
            slotWrapper.appendChild(emptySlot);
        }

        card.appendChild(header);
        card.appendChild(slotWrapper);
        col.appendChild(card);

        if (i < 4) row1.appendChild(col);
        else row2.appendChild(col);
    }
}

// Monthly view — navigation
function changeMonth(dir) {
    currentMonthDate.setMonth(currentMonthDate.getMonth() + dir);
    renderMonthView();
}

function goToTodayMonth() {
    currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    renderMonthView();
}

function renderMonthView() {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    document.getElementById('monthTitle').textContent = `${monthNames[month]} ${year}`;

    // Calculates grid boundaries
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const gridStart = getMonday(firstDay);
    const gridEnd = new Date(lastDay);
    const gridEndDay = gridEnd.getDay();
    if (gridEndDay !== 0) gridEnd.setDate(gridEnd.getDate() + (7 - gridEndDay));

    fetch(`../backend/get_schedules.php?start_date=${formatDateISO(gridStart)}&end_date=${formatDateISO(gridEnd)}`)
        .then(r => r.json())
        .then(data => {
            monthSchedules = {};
            if (data.status === 200) {
                data.schedules.forEach(s => {
                    monthSchedules[s.scheduled_date] = s;
                });
            }
            buildMonthGrid(year, month, gridStart, gridEnd);
        })
        .catch(err => {
            console.error('Error loading month schedules:', err);
            monthSchedules = {};
            buildMonthGrid(year, month, gridStart, gridEnd);
        });
}

// Monthly view — grid builder
function buildMonthGrid(year, month, gridStart, gridEnd) {
    const grid = document.getElementById('monthGrid');
    const headers = grid.querySelectorAll('.month-header-cell');
    grid.innerHTML = '';
    headers.forEach(h => grid.appendChild(h));

    const d = new Date(gridStart);
    while (d <= gridEnd) {
        const dateISO = formatDateISO(d);
        const isCurrentMonth = d.getMonth() === month;     // Gray out if not current month
        const isToday2 = isSameDay(d, today);              // Highlight if today
        const schedule = monthSchedules[dateISO] || null;

        const cell = document.createElement('div');
        cell.className = `month-cell${!isCurrentMonth ? ' other-month' : ''}${isToday2 ? ' today-cell' : ''}`;

        const cellDate = new Date(d);
        cell.onclick = () => openScheduleModal(cellDate, monthSchedules[formatDateISO(cellDate)] || null);

        let cellContent = `<div class="cell-date">${d.getDate()}</div>`;

        if (schedule) {
            const wornOpacity = schedule.is_worn >= 1 ? 'opacity:0.5;' : (schedule.in_laundry ? 'opacity:0.3;' : '');
            const wornIcon = schedule.is_worn >= 1 ? '<i class="bi bi-check-circle-fill text-success" style="font-size:0.45rem"></i> ' : '';

            if (schedule.top_image || schedule.bottom_image || schedule.shoes_image) {
                let sImgs = '';
                if (schedule.top_image) sImgs += `<img src="${schedule.top_image}" class="cal-top">`;
                if (schedule.bottom_image) sImgs += `<img src="${schedule.bottom_image}" class="cal-bottom">`;
                if (schedule.shoes_image) sImgs += `<img src="${schedule.shoes_image}" class="cal-shoes">`;

                cellContent += `<div class="calendar-outfit-stack">
                                            <div class="outfit-images" style="${wornOpacity}">
                                                ${sImgs}
                                            </div>
                                            <div class="calendar-outfit-name">${wornIcon}${schedule.outfit_name}</div>
                                        </div>`;
            } else if (schedule.preview_image) {
                cellContent += `<div class="calendar-outfit-stack">
                                            <div class="calendar-thumb-container" style="${wornOpacity}">
                                                <img src="../${schedule.preview_image}" class="calendar-thumb-img">
                                            </div>
                                            <div class="calendar-outfit-name">${wornIcon}${schedule.outfit_name}</div>
                                        </div>`;
            } else {
                cellContent += `<div class="calendar-outfit-stack">
                                            <div style="height:60px; display:flex; align-items:center; justify-content:center; color:#ccc;"><i class="bi bi-hanger" style="font-size:1.5rem"></i></div>
                                            <div class="calendar-outfit-name">${wornIcon}${schedule.outfit_name}</div>
                                        </div>`;
            }
        }

        cellContent += `<div class="cell-add" onclick="event.stopPropagation(); openScheduleModal(new Date('${dateISO}T00:00:00'), ${schedule ? 'monthSchedules[\'' + dateISO + '\']' : 'null'});"><i class="bi bi-plus"></i></div>`;

        cell.innerHTML = cellContent;
        grid.appendChild(cell);

        d.setDate(d.getDate() + 1);
    }
}

// View toggle (week ↔ month)
function toggleCalendarView() {
    const weekView = document.getElementById('week-view');
    const monthView = document.getElementById('month-view');

    if (weekView.style.display === 'none') {
        weekView.style.display = 'block';
        monthView.style.display = 'none';
    } else {
        weekView.style.display = 'none';
        monthView.style.display = 'block';
        renderMonthView();
    }
}

// Schedule modal — open & populate
function openScheduleModal(date, existingSchedule) {
    modalDate = date;
    modalExistingScheduleId = existingSchedule ? existingSchedule.id : null;
    modalSelectedOutfitId = existingSchedule ? existingSchedule.outfit_id : null;
    modalIsRecurring = existingSchedule ? (existingSchedule.is_recurring == 1) : false;

    document.getElementById('scheduleModalTitle').textContent = existingSchedule ? 'Edit Schedule' : 'Plan Outfit';
    document.getElementById('scheduleModalDate').textContent = `${dayNames[date.getDay()]} — ${formatDateDisplay(date)}`;

    document.getElementById('deleteScheduleBtn').style.display = existingSchedule ? 'inline-block' : 'none';
    document.getElementById('saveScheduleBtn').disabled = !modalSelectedOutfitId;

    // Dynamic return-to-calendar links
    const returnDate = formatDateISO(date);
    const createUrl = 'create.html?return_date=' + returnDate;
    const linkEmpty = document.getElementById('createOutfitLinkEmpty');
    const linkBottom = document.getElementById('createOutfitLinkBottom');
    if (linkEmpty) linkEmpty.href = createUrl;
    if (linkBottom) linkBottom.href = createUrl;

    renderOutfitPicker();
    new bootstrap.Modal(document.getElementById('scheduleModal')).show();
}

// Outfit picker grid
function renderOutfitPicker() {
    const grid = document.getElementById('outfitPickerGrid');
    const noMsg = document.getElementById('noOutfitsMsg');
    grid.innerHTML = '';

    if (allOutfits.length === 0) {
        noMsg.style.display = 'block';
        return;
    }
    noMsg.style.display = 'none';

    allOutfits.forEach(outfit => {
        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = `outfit-pick-card${modalSelectedOutfitId == outfit.id ? ' selected' : ''}`;
        card.onclick = () => selectOutfit(outfit.id);

        let imgs = '';
        if (outfit.top_image) imgs += `<img src="${outfit.top_image}" style="height:50px;">`;
        if (outfit.bottom_image) imgs += `<img src="${outfit.bottom_image}" style="height:60px; margin-top:-10px;">`;
        if (outfit.shoes_image) imgs += `<img src="${outfit.shoes_image}" style="height:30px; margin-top:-8px;">`;
        if (!imgs) imgs = '<div style="height:80px; display:flex; align-items:center; justify-content:center; color:#999;"><i class="bi bi-hanger fs-3"></i></div>';

        card.innerHTML = `
                    <div class="d-flex flex-column align-items-center" style="mix-blend-mode:multiply; ${outfit.in_laundry ? 'opacity: 0.5;' : ''}">${imgs}</div>
                    <div class="outfit-pick-name ${outfit.in_laundry ? 'text-muted' : ''}">${outfit.name}</div>
                    ${outfit.in_laundry ? '<div style="font-size: 0.6rem; color: #dc3545; font-weight: bold; text-transform: uppercase;">In Laundry</div>' : ''}
                    ${modalSelectedOutfitId == outfit.id ? '<i class="bi bi-check-circle-fill text-dark mt-1"></i>' : ''}
                `;

        col.appendChild(card);
        grid.appendChild(col);
    });
}

// Outfit selection — laundry guard
function selectOutfit(outfitId) {
    let outfit = allOutfits.find(o => o.id == outfitId);

    let todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);
    if (outfit && outfit.in_laundry && modalDate <= todayCheck) {
        alert("This outfit contains items in the laundry! You can only schedule it for tomorrow or a future date.");
        modalSelectedOutfitId = null;
        document.getElementById('saveScheduleBtn').disabled = true;
        renderOutfitPicker();
        return;
    }

    modalSelectedOutfitId = outfitId;
    document.getElementById('saveScheduleBtn').disabled = false;
    renderOutfitPicker();
}

// Save schedule
function saveSchedule() {
    if (!modalSelectedOutfitId || !modalDate) return;

    // Check for date conflict
    const dateISO = formatDateISO(modalDate);
    const existing = weekSchedules[dateISO] || monthSchedules[dateISO] || null;

    if (existing && existing.outfit_id != modalSelectedOutfitId) {
        // Populate and show override warning modal
        document.getElementById('overrideExistingName').textContent = existing.outfit_name || 'Unknown Outfit';
        document.getElementById('overrideExistingDate').textContent =
            `${dayNames[modalDate.getDay()]} — ${formatDateDisplay(modalDate)}`;

        // Try to show the outfit's preview image
        const imgEl = document.getElementById('overrideExistingImg');
        imgEl.style.display = 'block';
        imgEl.src = existing.preview_image
            ? '../' + existing.preview_image
            : (existing.top_image ? '../' + existing.top_image : '');

        bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
        setTimeout(() => {
            new bootstrap.Modal(document.getElementById('overrideWarningModal')).show();
        }, 300);
        return;
    }

    // No conflict — save directly
    executeSaveSchedule(dateISO);
}

// Called when user clicks "Replace" in the override warning modal
function confirmOverride() {
    bootstrap.Modal.getInstance(document.getElementById('overrideWarningModal')).hide();
    executeSaveSchedule(formatDateISO(modalDate));
}

// Executes the actual fetch to save the schedule
function executeSaveSchedule(dateISO) {
    const btn = document.getElementById('saveScheduleBtn');
    if (btn) { btn.innerHTML = 'Saving...'; btn.disabled = true; }

    const formData = new FormData();
    formData.append('outfit_id', modalSelectedOutfitId);
    formData.append('scheduled_date', dateISO);

    fetch('../backend/save_schedule.php', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
            if (btn) { btn.innerHTML = 'Save Schedule'; btn.disabled = false; }
            if (data.status === 200) {
                const schedMod = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
                if (schedMod) schedMod.hide();
                renderWeekView();
                if (document.getElementById('month-view').style.display === 'block') renderMonthView();
            } else {
                alert(data.message || 'Error saving schedule.');
            }
        })
        .catch(err => {
            if (btn) { btn.innerHTML = 'Save Schedule'; btn.disabled = false; }
            console.error(err);
            alert('Network error.');
        });
}

// Delete schedule
function deleteCurrentSchedule() {
    if (!modalExistingScheduleId) return;

    // Hide the schedule modal first
    const scheduleModalEl = document.getElementById('scheduleModal');
    const scheduleModalInstance = bootstrap.Modal.getInstance(scheduleModalEl);
    if (scheduleModalInstance) scheduleModalInstance.hide();

    const dateDisplay = `${dayNames[modalDate.getDay()]} — ${formatDateDisplay(modalDate)}`;

    if (modalIsRecurring) {
        // Show recurring delete options modal
        document.getElementById('deleteOptionsDate').textContent = dateDisplay;
        setTimeout(() => {
            new bootstrap.Modal(document.getElementById('deleteOptionsModal')).show();
        }, 300);
    } else {
        // Show simple confirm modal
        document.getElementById('deleteConfirmDate').textContent = dateDisplay;
        setTimeout(() => {
            new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show();
        }, 300);
    }
}

// Execute the actual delete with the chosen mode
function executeDelete(mode) {
    // Close whichever delete modal is open
    const optionsModal = bootstrap.Modal.getInstance(document.getElementById('deleteOptionsModal'));
    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    if (optionsModal) optionsModal.hide();
    if (confirmModal) confirmModal.hide();

    const formData = new FormData();
    formData.append('schedule_id', modalExistingScheduleId);
    formData.append('mode', mode);
    formData.append('date', formatDateISO(modalDate));

    fetch('../backend/delete_schedule.php', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
            if (data.status === 200) {
                renderWeekView();
                if (document.getElementById('month-view').style.display === 'block') renderMonthView();
            } else {
                alert(data.message);
            }
        })
        .catch(err => { console.error(err); alert('Network error.'); });
}

function handleOutfitAction(btn, action) {
    const scheduleId = btn.getAttribute('data-schedule-id');
    const schedDate = btn.getAttribute('data-date');
    if (!scheduleId) return;

    btn.disabled = true;

    if (action === 'wear') {
        const formData = new FormData();
        formData.append('schedule_id', scheduleId);
        formData.append('scheduled_date', schedDate);
        formData.append('action', 'wear');

        fetch('../backend/wear_outfit.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.status === 200) {
                    renderWeekView();    // Re-render to show "Put in Laundry" button
                    if (document.getElementById('month-view').style.display === 'block') renderMonthView();
                } else {
                    alert(data.message);
                    btn.disabled = false;
                }
            })
            .catch(err => { console.error(err); alert('Network error.'); btn.disabled = false; });

    } else if (action === 'laundry') {
        if (!confirm("Mark these items as 'In Laundry'?")) {
            btn.disabled = false;
            return;
        }

        const formData = new FormData();
        formData.append('schedule_id', scheduleId);
        formData.append('scheduled_date', schedDate);
        formData.append('action', 'laundry');

        fetch('../backend/wear_outfit.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.status === 200) {
                    renderWeekView();    // Re-render to show "Finished Wearing" state
                    if (document.getElementById('month-view').style.display === 'block') renderMonthView();
                } else {
                    alert(data.message);
                    btn.disabled = false;
                }
            })
            .catch(err => { console.error(err); alert('Network error.'); btn.disabled = false; });
    }
}

function undoOutfitAction(btn) {
    const scheduleId = btn.getAttribute('data-schedule-id');
    if (!scheduleId) return;

    btn.disabled = true;

    const formData = new FormData();
    formData.append('schedule_id', scheduleId);
    formData.append('action', 'undo');

    fetch('../backend/wear_outfit.php', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
            if (data.status === 200) {
                renderWeekView();    // Re-render to show the previous state's button
                if (document.getElementById('month-view').style.display === 'block') renderMonthView();
            } else {
                alert(data.message);
                btn.disabled = false;
            }
        })
        .catch(err => { console.error(err); alert('Network error.'); btn.disabled = false; });
}

// Page initialization
document.addEventListener('DOMContentLoaded', () => {
    // Session shield
    fetch('../backend/get_session.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 200) {
                const userNameEl = document.getElementById('userNameDisplay');
                if (userNameEl) userNameEl.textContent = data.userName;

                // Show Admin Report link if admin
                if (data.role === 'admin') {
                    const dropdownMenu = document.querySelector('.dropdown-menu');
                    if (dropdownMenu) {
                        const adminLink = document.createElement('li');
                        adminLink.innerHTML = '<a class="dropdown-item" href="admin_report.html"><i class="bi bi-file-earmark-bar-graph me-2"></i>Admin Report</a>';
                        dropdownMenu.prepend(adminLink);
                    }
                }
            } else {
                window.location.href = '../MarketingPage/login.html';
                return;
            }
        })
        .catch(err => {
            console.error('Failed to fetch user session:', err);
            window.location.href = '../MarketingPage/login.html';
        });

    // Return-to-calendar: jump to specific date
    const urlParams = new URLSearchParams(window.location.search);
    const gotoDate = urlParams.get('goto_date');
    if (gotoDate) {
        const parts = gotoDate.split('-');
        if (parts.length === 3) {
            const targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            currentWeekStart = getMonday(targetDate);
            currentMonthDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        }
    }

    fetch('../backend/get_outfits.php')
        .then(r => r.json())
        .then(data => {
            if (data.status === 200) allOutfits = data.outfits;
        })
        .catch(err => console.error('Could not load outfits:', err));

    renderWeekView();
});
