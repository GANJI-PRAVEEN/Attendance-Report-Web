/* script.js — improved, animated, and resilient */

// ---- Utilities ----
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// animate number counting in element
function animateNumber(el, from, to, ms = 700) {
  const start = performance.now();
  const diff = to - from;
  function step(now) {
    const t = clamp((now - start) / ms, 0, 1);
    const cur = Math.round(from + diff * easeOutCubic(t));
    el.textContent = cur + (el.dataset.suffix || '');
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

// set meter value (0–100) smoothly
function setMeterValue(meterEl, value) {
  value = clamp(Math.round(value), 0, 100);
  meterEl.style.setProperty('--value', value);
  // update conic gradient via inline style for better transitions
  meterEl.style.background = `conic-gradient(var(--accent-2) ${value}%, rgba(255,255,255,0.06) ${value}%)`;
  const label = meterEl.querySelector('.meter-value') || document.getElementById('meterValue');
  if (label) {
    animateNumber(label, parseInt(label.textContent) || 0, value, 900);
  }
  // add float while updating then remove after a short time
  meterEl.classList.add('float');
  clearTimeout(meterEl._floatTimeout);
  meterEl._floatTimeout = setTimeout(()=> meterEl.classList.remove('float'), 2400);
}

// ---- Attendance logic (kept same semantics, rewritten cleanly) ----
function classesNeededToReach75(attended, total, classesPerDay /*unused*/, targetDateStr) {
  // Solve for x such that (attended + x) / (total + x) >= 0.75
  // (attended + x) >= 0.75(total + x) => attended + x >= 0.75 total + 0.75 x
  // x - 0.75 x >= 0.75 total - attended => 0.25 x >= 0.75 total - attended
  const required = (0.75 * total - attended) / 0.25;
  return Math.max(0, Math.ceil(required));
}

function getWorkingDaysUntilToday(targetDateString) {
  if (!targetDateString) return 0;
  const today = new Date();
  const target = new Date(targetDateString);
  if (target <= today) return 0;
  let count = 0;
  for (let d = new Date(today); d <= target; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0) continue; // Sunday
    if (day === 6) {
      const dateNum = d.getDate();
      // second saturday heuristic (if between 8 and 14)
      if (dateNum >= 8 && dateNum <= 14) continue;
    }
    count++;
  }
  return count;
}

function applyDetails(classesAttended, TotalClasses, classesPerDay, attendancePercentage, targetDateString, availableClasses, xClasses) {
  // DOM refs
  const elClassesAttended = document.getElementById('fetchClassesAttended');
  const elTotal = document.getElementById('fetchTotalClasses');
  const elNeeded = document.getElementById('fetchClassesNeeded');
  const elDays = document.getElementById('fetchnumberOfDaysToGo');
  const elTarget = document.getElementById('fetchTargetDate');
  const elWorking = document.getElementById('fetchRemainingWorkingDays');
  const currentTag = document.getElementById('currentAttendace');

  // simulate scenario
  let simAttended = classesAttended;
  let simTotal = TotalClasses;
  if (Number.isFinite(xClasses) && xClasses > 0) {
    simAttended += xClasses;
  }
  if (Number.isFinite(availableClasses) && availableClasses > 0) {
    simTotal += availableClasses;
    // If availableClasses imply attending these, adjust attendancePercentage for display
    attendancePercentage = (simAttended / simTotal) * 100;
  }

  // update display fields
  elClassesAttended.value = simAttended;
  elTotal.value = simTotal;

  const classesMust = classesNeededToReach75(simAttended, simTotal, classesPerDay, targetDateString);
  elNeeded.value = classesMust;

  const daysNeeded = Math.ceil((classesMust) / Math.max(1, classesPerDay || 1));
  elDays.value = daysNeeded;

  elTarget.value = targetDateString || '';
  elWorking.value = getWorkingDaysUntilToday(targetDateString);

  // color-coding for days left vs required
  const daysInputElement = elDays;
  if (Number(elWorking.value) > 0 && daysNeeded > Number(elWorking.value)) {
    daysInputElement.classList.add('danger');
    daysInputElement.classList.remove('safe');
  } else {
    daysInputElement.classList.remove('danger');
    daysInputElement.classList.add('safe');
  }

  // update meter & current attendance text
  const meter = document.querySelector('.meterCircle');
  setMeterValue(meter, attendancePercentage);
  const currentRounded = (Number.isFinite(attendancePercentage) && !Number.isNaN(attendancePercentage)) ? attendancePercentage.toFixed(2) : '—';
  // update accessible text and label
  currentTag.textContent = `Your current attendance: ${currentRounded}%`;
  currentTag.setAttribute('aria-label', `Current attendance ${currentRounded} percent`);
}

// ---- Main calculate handler ----
function calculateAttendance() {
  // read inputs (robust parsing)
  const classesAttended = Number(document.getElementById('classesAttended').value) || 0;
  const TotalClasses = Number(document.getElementById('TotalClasses').value) || 0;
  const classesPerDay = Number(document.getElementById('classesPerDay').value) || 1;
  const xClasses = Number(document.getElementById('xClasses').value) || 0;
  const availableClasses = Number(document.getElementById('availableClasses').value) || 0;
  const targetDateString = document.getElementById('targetDate').value || '';

  // basic validation
  if (TotalClasses <= 0) {
    alert('Please enter a valid Total Classes value (> 0).');
    return;
  }
  if (classesAttended < 0) {
    alert('Classes attended cannot be negative.');
    return;
  }

  const attendancePercentage = (TotalClasses > 0) ? (classesAttended / TotalClasses) * 100 : 0;

  applyDetails(classesAttended, TotalClasses, classesPerDay, attendancePercentage, targetDateString, availableClasses, xClasses);

  // scroll report into view with smooth behavior
  const report = document.getElementById('reportSection');
  if (report) {
    report.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---- Reset ----
function resetForm() {
  const ids = ['classesAttended','TotalClasses','classesPerDay','xClasses','availableClasses','targetDate'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  // reset outputs
  const outs = ['fetchClassesAttended','fetchTotalClasses','fetchClassesNeeded','fetchnumberOfDaysToGo','fetchTargetDate','fetchRemainingWorkingDays'];
  outs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  // reset meter
  const meter = document.querySelector('.meterCircle');
  setMeterValue(meter, 0);
  const current = document.getElementById('currentAttendace');
  current.textContent = 'Your current attendance: —';
}

// ---- Scroll reveal using IntersectionObserver ----
function setupRevealOnScroll() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ---- Wire up events ----
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn');
  const resetBtn = document.getElementById('resetBtn');

  btn.addEventListener('click', calculateAttendance);
  resetBtn.addEventListener('click', resetForm);

  // initialize meter element and label
  const meter = document.querySelector('.meterCircle');
  if (meter && !meter.querySelector('.meter-value')) {
    const span = document.createElement('span');
    span.className = 'meter-value';
    span.id = 'meterValue';
    span.textContent = '0';
    meter.appendChild(span);
  }

  // reveal
  setupRevealOnScroll();

  // allow pressing Enter in inputs to calculate
  document.querySelectorAll('.inputs input').forEach(inp => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        calculateAttendance();
      }
    });
  });
});
