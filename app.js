// ============================================================
// STORAGE KEYS
// ============================================================
const STORAGE = {
  study: 'pp_study',
  tasks: 'pp_tasks',
  workout: 'pp_workout',
  wstreak: 'pp_wstreak',
  saving: 'pp_saving',
  theme: 'pp_theme',
  mode: 'pp_mode',
  customTheme: 'pp_custom_theme',
  notes: 'pp_study_notes',
  muscle: 'pp_muscle_groups',
  subjects: 'pp_subjects',
  donghua: 'pp_donghua',
  budget: 'pp_budget'
};

// ============================================================
// CONSTANTS
// ============================================================
const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];
const JAM_SLOTS = [
  '07:00-07:45', '07:45-08:30', '08:30-09:15', '09:15-10:00',
  '10:15-11:00', '11:00-11:45', '11:45-12:30', '12:30-13:15'
];
const DEFAULT_CUSTOM_THEME = {
  mode: 'light',
  bgColor: '#f5f5f7',
  bodyColor: '#ffffff',
  gradient: { enabled: false, colors: ['#ff6b6b', '#feca57', '#48dbfb'], direction: 'to right' },
  image: null
};

const THEMES = ['light', 'dark', 'blue-light', 'blue-dark'];
const THEME_ICONS = {
  'light': '<i class="fas fa-sun"></i>',
  'dark': '<i class="fas fa-moon"></i>',
  'blue-light': '<i class="fas fa-cloud-sun"></i>',
  'blue-dark': '<i class="fas fa-cloud-moon"></i>'
};

// ============================================================
// STATE
// ============================================================
let currentMode = 'dashboard';
let studyData = [];
let studyTasks = [];
let studyNotes = [];
let workoutData = [];
let workoutFilter = 'SENIN';
let wStreak = { count: 0, last: null };
let savingData = [];
let muscleGroups = [];
let taskFilter = 'all';
let customTheme = {};
let chartInstance = null;
let currentChartTab = 'study-tasks';

let donghuaData = [];
let donghuaFilter = 'all';
let donghuaSearchQuery = '';
let donghuaSort = 'title';
let hideFinished = false;

let budgetData = [];

// ============================================================
// DOM HELPERS
// ============================================================
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ============================================================
// LOADING ANIMATION
// ============================================================
function startLoadingAnimation() {
  const logo = $('#loaderLogo');
  const name = $('#loaderName');
  const subtitle = $('#loaderSubtitle');
  const wrap = $('.loader-progress-wrap');
  const bar = $('#loaderProgressBar');
  const txt = $('#loaderProgressText');
  const tips = $('.loader-tips');
  const tipSpan = $('#loaderTip');

  if (!logo || !wrap || !bar) {
    setTimeout(() => {
      $('#loadingOverlay')?.classList.add('hidden');
      document.getElementById('mainWrapper').style.opacity = '1';
      document.body.style.overflow = '';
    }, 300);
    return;
  }

  const tipList = [
    '<i class="fas fa-wand-magic-sparkles"></i> Siapkan semangat belajarmu!',
    '<i class="fas fa-book"></i> Organize your tasks now!',
    '<i class="fas fa-dumbbell"></i> Stay consistent, stay fit!',
    '<i class="fas fa-film"></i> Donghua waiting for you!',
    '<i class="fas fa-coins"></i> Save your money wisely!',
    '<i class="fas fa-chart-line"></i> Track your progress daily!',
    '<i class="fas fa-fire"></i> Keep the streak alive!'
  ];

  const subtitleTexts = ['Memuat data...', 'Menyiapkan dashboard...', 'Hampir selesai...', 'Siap digunakan!'];

  let tipIndex = 0;
  let subIndex = 0;
  let tipInterval = null;
  let subInterval = null;

  setTimeout(() => {
    if (logo) logo.className = 'loader-logo show';
    if (subtitle) {
      subtitle.className = 'loader-subtitle visible';
      subtitle.textContent = 'Memuat data...';
    }
  }, 400);

  setTimeout(() => {
    if (subInterval) clearInterval(subInterval);
    subInterval = setInterval(() => {
      subIndex = (subIndex + 1) % subtitleTexts.length;
      if (subtitle) {
        subtitle.classList.add('typing');
        setTimeout(() => { subtitle.textContent = subtitleTexts[subIndex]; }, 200);
      }
    }, 1800);
  }, 2000);

  setTimeout(() => {
    if (logo) logo.className = 'loader-logo slide';
    if (name) name.className = 'loader-name visible';
  }, 2500);

  setTimeout(() => {
    if (wrap) wrap.className = 'loader-progress-wrap visible';
    if (txt) txt.className = 'loader-progress-text visible';
    if (tips) tips.className = 'loader-tips visible';

    if (tipSpan) {
      tipSpan.innerHTML = tipList[0];
      tipSpan.className = 'show';
    }

    if (tipSpan) {
      tipInterval = setInterval(() => {
        tipIndex = (tipIndex + 1) % tipList.length;
        tipSpan.className = 'fade';
        setTimeout(() => {
          tipSpan.innerHTML = tipList[tipIndex];
          tipSpan.className = 'show';
        }, 350);
      }, 2200);
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 3 + 1.5;
      if (progress > 100) progress = 100;
      if (bar) bar.style.width = progress + '%';
      if (txt) txt.textContent = Math.round(progress) + '%';

      if (progress >= 100) {
        clearInterval(interval);
        if (tipInterval) clearInterval(tipInterval);
        if (subInterval) clearInterval(subInterval);
        if (logo) logo.className = 'loader-logo hide';
        if (name) name.className = 'loader-name fade-out';
        setTimeout(() => {
          const overlay = $('#loadingOverlay');
          if (overlay) {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
          }
          document.getElementById('mainWrapper').style.opacity = '1';
        }, 500);
      }
    }, 120);
  }, 3000);
}

// ============================================================
// THEME FUNCTIONS
// ============================================================
function loadTheme() {
  try {
    const t = localStorage.getItem(STORAGE.theme) || 'light';
    document.documentElement.setAttribute('data-theme', t);
    customTheme = JSON.parse(localStorage.getItem(STORAGE.customTheme)) || JSON.parse(JSON.stringify(DEFAULT_CUSTOM_THEME));
    applyCustomTheme();
    const tog = $('#themeToggle');
    if (tog) tog.innerHTML = THEME_ICONS[t] || THEME_ICONS['light'];
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
    customTheme = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_THEME));
    applyCustomTheme();
  }
}

function applyCustomTheme() {
  const root = document.documentElement;
  const body = document.body;
  body.style.background = '';
  body.style.backgroundColor = '';
  body.style.backgroundImage = '';
  if (customTheme.mode === 'custom') {
    root.style.setProperty('--bg', customTheme.bgColor || '#f5f5f7');
    root.style.setProperty('--surface', customTheme.bodyColor || '#ffffff');
    if (customTheme.gradient && customTheme.gradient.enabled) {
      const cols = customTheme.gradient.colors || ['#ff6b6b', '#feca57', '#48dbfb'];
      body.style.background = `linear-gradient(${customTheme.gradient.direction || 'to right'}, ${cols.join(', ')})`;
      body.style.backgroundColor = 'transparent';
    }
    if (customTheme.image) {
      body.style.backgroundImage = `url(${customTheme.image})`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundRepeat = 'no-repeat';
      body.style.backgroundColor = 'transparent';
    }
  } else {
    root.style.removeProperty('--bg');
    root.style.removeProperty('--surface');
    body.style.background = '';
    body.style.backgroundColor = '';
    body.style.backgroundImage = '';
  }
}

function cycleTheme() {
  let cur = document.documentElement.getAttribute('data-theme');
  let idx = THEMES.indexOf(cur);
  if (idx === -1) idx = 0;
  let next = THEMES[(idx + 1) % THEMES.length];
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE.theme, next);
  customTheme.mode = next;
  localStorage.setItem(STORAGE.customTheme, JSON.stringify(customTheme));
  applyCustomTheme();
  const tog = $('#themeToggle');
  if (tog) tog.innerHTML = THEME_ICONS[next] || THEME_ICONS['light'];
  const names = { light: 'Terang', dark: 'Gelap', 'blue-light': 'Biru Terang', 'blue-dark': 'Biru Gelap' };
  toast(`<i class="fas fa-palette"></i> Tema: ${names[next]}`, 'success');
}

// ============================================================
// SUBJECTS
// ============================================================
function getSubjects() { return JSON.parse(localStorage.getItem(STORAGE.subjects) || '[]'); }
function addSubject(s) {
  if (!s) return;
  let subs = getSubjects();
  if (!subs.includes(s)) { subs.push(s); localStorage.setItem(STORAGE.subjects, JSON.stringify(subs)); }
  updateSubjectDatalist();
}
function updateSubjectDatalist() {
  const dl = $('#subjectList');
  if (!dl) return;
  const subs = getSubjects();
  const fromStudy = studyData.map(s => s.mapel).filter(Boolean);
  const all = [...new Set([...subs, ...fromStudy])];
  dl.innerHTML = all.map(s => `<option value="${esc(s)}">`).join('');
}

// ============================================================
// LOAD DATA
// ============================================================
function loadAllData() {
  studyData = JSON.parse(localStorage.getItem(STORAGE.study) || '[]');
  studyTasks = JSON.parse(localStorage.getItem(STORAGE.tasks) || '[]');
  studyNotes = JSON.parse(localStorage.getItem(STORAGE.notes) || '[]');
  workoutData = JSON.parse(localStorage.getItem(STORAGE.workout) || '[]');
  wStreak = JSON.parse(localStorage.getItem(STORAGE.wstreak) || '{"count":0,"last":null}');
  savingData = JSON.parse(localStorage.getItem(STORAGE.saving) || '[]');
  muscleGroups = JSON.parse(localStorage.getItem(STORAGE.muscle) || '[]');
  donghuaData = JSON.parse(localStorage.getItem(STORAGE.donghua) || '[]');
  budgetData = JSON.parse(localStorage.getItem(STORAGE.budget) || '[]');
}

// ============================================================
// SIDEBAR
// ============================================================
function toggleSidebar() {
  $('#sidebar')?.classList.toggle('active');
  $('#sidebarOverlay')?.classList.toggle('active');
}
function closeSidebar() {
  $('#sidebar')?.classList.remove('active');
  $('#sidebarOverlay')?.classList.remove('active');
}

function setActiveMode(mode, isPopState = false) {
  $$('.sidebar-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  $$('.mode-panel').forEach(p => p.classList.toggle('active', p.id === 'panel' + mode.charAt(0).toUpperCase() + mode.slice(1)));
  const titles = {
    dashboard: '<i class="fas fa-chart-pie"></i> Dashboard',
    study: '<i class="fas fa-book"></i> Belajar & Tugas',
    workout: '<i class="fas fa-dumbbell"></i> Workout',
    saving: '<i class="fas fa-coins"></i> Nabung',
    donghua: '<i class="fas fa-film"></i> Donghua',
    chart: '<i class="fas fa-chart-bar"></i> Grafik',
    budget: '<i class="fas fa-wallet"></i> Budget'
  };
  const te = $('#modeTitle');
  if (te) te.innerHTML = titles[mode] || '';
  if (!isPopState) history.pushState({ mode }, '', `#${mode}`);
  else history.replaceState({ mode }, '', `#${mode}`);

  setTimeout(() => animatePanelElements(document.querySelector('.mode-panel.active')), 10);
}

// ============================================================
// RENDER ALL
// ============================================================
function renderAll() {
  renderDashboard();
  renderStudy();
  renderWorkout();
  renderSaving();
  renderDonghua();
  renderBudget();
  updateStudyStats();
  updateSubjectDatalist();
  renderNotes();
  updateWorkoutStats();
  renderMuscleGroups();
  renderWorkoutHistory();
  if (document.querySelector('#panelChart.active')) renderChart(currentChartTab);
  animatePanelElements(document.querySelector('.mode-panel.active'));
}

function animatePanelElements(panel) {
  if (!panel) return;
  const elements = panel.querySelectorAll(
    '.card, .stat-card, .donghua-card, .workout-card, .note-card, .muscle-card, .history-item, .saving-item, .stat-card-premium, .target-card-premium, .quote-card, .budget-summary, #budgetTableBody tr'
  );
  elements.forEach((el, index) => {
    el.style.animation = 'elementFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    el.style.animationDelay = (index * 0.03) + 's';
    el.style.opacity = '0';
  });
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const grid = $('#dashboardGrid');
  if (!grid) return;
  const totalSubjects = studyData.length;
  const totalTasks = studyTasks.length;
  const doneTasks = studyTasks.filter(t => t.done).length;
  const totalWorkouts = workoutData.length;
  const doneWorkouts = workoutData.filter(w => w.done).length;
  const totalDonghua = donghuaData.length;
  const donghuaFinished = donghuaData.filter(d => d.status === 'finished').length;
  const donghuaWatching = donghuaData.filter(d => d.status === 'watching').length;
  const totalSaving = savingData.length;
  const savingAmount = savingData.reduce((s, i) => s + i.current, 0);
  const savingTarget = savingData.reduce((s, i) => s + i.target, 0);
  const savingProgress = savingTarget > 0 ? Math.round((savingAmount / savingTarget) * 100) : 0;
  const studyHours = Math.round(studyData.length * 0.75 * 10) / 10;
  const workoutStreak = wStreak.count || 0;
  const totalNotes = studyNotes.length;
  const tasksCompletion = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const workoutCompletion = totalWorkouts > 0 ? Math.round((doneWorkouts / totalWorkouts) * 100) : 0;

  const hour = new Date().getHours();
  let greetingText = 'Selamat Malam', greetingIcon = '<i class="fas fa-moon"></i>';
  if (hour >= 4 && hour < 11) { greetingText = 'Selamat Pagi'; greetingIcon = '<i class="fas fa-sun"></i>'; }
  else if (hour >= 11 && hour < 15) { greetingText = 'Selamat Siang'; greetingIcon = '<i class="fas fa-cloud-sun"></i>'; }
  else if (hour >= 15 && hour < 19) { greetingText = 'Selamat Sore'; greetingIcon = '<i class="fas fa-cloud-sun"></i>'; }
  const userName = localStorage.getItem('pp_username') || 'Planner';
  const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const quotes = [
    { text: "Satu langkah kecil tetap lebih baik daripada tidak sama sekali.", icon: "fa-shoe-prints" },
    { text: "Kesuksesan adalah akumulasi dari usaha kecil yang dilakukan setiap hari.", icon: "fa-chart-line" },
    { text: "Jangan bandingkan dirimu dengan orang lain, bandingkan dengan dirimu kemarin.", icon: "fa-user-check" },
    { text: "Disiplin adalah jembatan antara tujuan dan pencapaian.", icon: "fa-link" },
    { text: "Lakukan sekarang juga, besok mungkin terlambat.", icon: "fa-clock" }
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  grid.innerHTML = `
    <div class="dashboard-premium">
      <div class="dashboard-greeting" style="margin-bottom:20px;">
        <div><div class="greeting-text">${greetingIcon} ${greetingText}, <strong>${userName}</strong>!</div><div style="font-size:0.9rem;opacity:0.85;margin-top:2px;"><i class="fas fa-rocket"></i> Ayo produktif hari ini</div></div>
        <div class="greeting-date">${todayDate}</div>
      </div>
      <div class="dashboard-quick-actions" style="margin-bottom:20px;">
        <button class="quick-btn primary" onclick="switchMode('study')"><i class="fas fa-plus"></i> Tugas Baru</button>
        <button class="quick-btn" onclick="switchMode('workout')"><i class="fas fa-dumbbell"></i> Workout</button>
        <button class="quick-btn" onclick="switchMode('donghua')"><i class="fas fa-film"></i> Donghua</button>
        <button class="quick-btn" onclick="switchMode('saving')"><i class="fas fa-piggy-bank"></i> Nabung</button>
        <button class="quick-btn" onclick="resetDashboard()" style="background:var(--danger);color:#fff;border-color:var(--danger);"><i class="fas fa-trash"></i> Reset</button>
      </div>
      <div class="dash-grid">
        <div class="stat-card-premium"><div class="stat-icon-badge" style="background:linear-gradient(135deg,var(--primary),#6366f1);"><i class="fas fa-book"></i></div><div class="stat-content"><div class="stat-label">Mata Pelajaran</div><div class="stat-value">${totalSubjects}</div><div class="stat-sub">${studyHours} jam/minggu</div></div></div>
        <div class="stat-card-premium"><div class="stat-icon-badge" style="background:linear-gradient(135deg,#3b82f6,#2563eb);"><i class="fas fa-tasks"></i></div><div class="stat-content"><div class="stat-label">Total Tugas</div><div class="stat-value">${totalTasks}</div><div class="stat-sub">${doneTasks} selesai (${tasksCompletion}%)</div></div></div>
        <div class="stat-card-premium"><div class="stat-icon-badge" style="background:linear-gradient(135deg,var(--success),#4ade80);"><i class="fas fa-dumbbell"></i></div><div class="stat-content"><div class="stat-label">Workout</div><div class="stat-value">${totalWorkouts}</div><div class="stat-sub"><i class="fas fa-fire"></i> Streak ${workoutStreak} hari</div></div></div>
        <div class="stat-card-premium"><div class="stat-icon-badge" style="background:linear-gradient(135deg,#f59e0b,#d97706);"><i class="fas fa-film"></i></div><div class="stat-content"><div class="stat-label">Donghua</div><div class="stat-value">${totalDonghua}</div><div class="stat-sub">${donghuaWatching} watching · ${donghuaFinished} selesai</div></div></div>
        <div class="stat-card-premium"><div class="stat-icon-badge" style="background:linear-gradient(135deg,#ec4899,#db2777);"><i class="fas fa-piggy-bank"></i></div><div class="stat-content"><div class="stat-label">Tabungan</div><div class="stat-value">Rp${savingAmount.toLocaleString('id-ID')}</div><div class="stat-sub">${savingProgress}% dari target</div></div></div>
        <div class="stat-card-premium"><div class="stat-icon-badge" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);"><i class="fas fa-sticky-note"></i></div><div class="stat-content"><div class="stat-label">Catatan</div><div class="stat-value">${totalNotes}</div><div class="stat-sub">dibuat sejauh ini</div></div></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:20px;">
        <div class="target-card-premium"><div class="target-header"><span class="label"><i class="fas fa-book"></i> Belajar</span><span class="percent">${Math.min(100,Math.round(studyHours/10*100))}%</span></div><div class="target-bar-premium"><div class="target-fill-premium study" style="width:${Math.min(100,studyHours/10*100)}%"></div></div><div style="font-size:0.8rem;color:var(--text2);">${studyHours} / 10 jam per minggu</div></div>
        <div class="target-card-premium"><div class="target-header"><span class="label"><i class="fas fa-dumbbell"></i> Workout</span><span class="percent">${workoutCompletion}%</span></div><div class="target-bar-premium"><div class="target-fill-premium workout" style="width:${workoutCompletion}%"></div></div><div style="font-size:0.8rem;color:var(--text2);">${doneWorkouts} dari ${totalWorkouts} latihan</div></div>
        <div class="target-card-premium"><div class="target-header"><span class="label"><i class="fas fa-piggy-bank"></i> Nabung</span><span class="percent">${savingProgress}%</span></div><div class="target-bar-premium"><div class="target-fill-premium saving" style="width:${savingProgress}%"></div></div><div style="font-size:0.8rem;color:var(--text2);">Rp${savingAmount.toLocaleString('id-ID')} dari Rp${savingTarget.toLocaleString('id-ID')}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr;gap:20px;margin-top:20px;">
        <div class="quote-card"><i class="fas ${quote.icon}"></i> “${quote.text}”</div>
        <div class="dashboard-recent" style="margin-top:0;"><div class="recent-title"><i class="fas fa-clock"></i> Aktivitas Terbaru</div><ul class="recent-list" id="recentList"><li style="color:var(--text3);">Belum ada aktivitas</li></ul></div>
      </div>
    </div>`;

  setTimeout(() => {
    const recentList = document.querySelector('#recentList');
    if (!recentList) return;
    const activities = [];
    studyTasks.slice(-3).forEach(t => activities.push({ type:'study', icon:'<i class="fas fa-tasks"></i>', text:`Tugas: ${t.text}`, time: t.createdAt?new Date(t.createdAt):new Date(), done: t.done }));
    workoutData.slice(-3).forEach(w => activities.push({ type:'workout', icon:'<i class="fas fa-dumbbell"></i>', text:`Workout: ${w.name}`, time:new Date(), done: w.done }));
    donghuaData.filter(d=>d.status==='watching').slice(-2).forEach(d => activities.push({ type:'donghua', icon:'<i class="fas fa-film"></i>', text:`Donghua: ${d.title} (${d.current}/${d.total})`, time: d.updatedAt?new Date(d.updatedAt):new Date(), done:false }));
    activities.sort((a,b)=>b.time-a.time);
    const recent = activities.slice(0,6);
    if(recent.length===0) recentList.innerHTML = '<li style="color:var(--text3);">Belum ada aktivitas</li>';
    else recentList.innerHTML = recent.map(a=>`<li><span class="recent-icon ${a.type}">${a.icon}</span><span>${a.text}</span><span class="recent-time">${timeSince(a.time)} ${a.done?'<i class="fas fa-check-circle" style="color:var(--success)"></i>':'<i class="fas fa-hourglass-half" style="color:var(--warning)"></i>'}</span></li>`).join('');
  }, 50);
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000); if (interval > 1) return interval + ' tahun lalu';
  interval = Math.floor(seconds / 2592000); if (interval > 1) return interval + ' bulan lalu';
  interval = Math.floor(seconds / 86400); if (interval > 1) return interval + ' hari lalu';
  interval = Math.floor(seconds / 3600); if (interval > 1) return interval + ' jam lalu';
  interval = Math.floor(seconds / 60); if (interval > 1) return interval + ' menit lalu';
  return 'baru saja';
}

// ============================================================
// STUDY FUNCTIONS
// ============================================================
function renderStudy() {
  const tbody = $('#studyTableBody'); if (!tbody) return;
  tbody.innerHTML = '';
  JAM_SLOTS.forEach(jam => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="font-weight:600;background:var(--surface2)">${jam}</td>`;
    DAYS.slice(0,5).forEach(hari => {
      const found = studyData.find(s => s.hari===hari && s.jam===jam);
      const td = document.createElement('td');
      if(found) td.innerHTML = `<span class="subject-tag" style="background:${found.warna||'#4f46e5'}">${esc(found.mapel)}${found.guru?' | '+esc(found.guru):''}</span>`;
      else td.innerHTML = '<span style="color:var(--text3)">-</span>';
      td.onclick = () => openStudyForm(hari, jam, found||null);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  renderStudyTasks(); updateSubjectDatalist();
}

function renderStudyTasks() {
  const list = $('#studyTaskList'); if (!list) return;
  let filtered = studyTasks;
  if(taskFilter==='pending') filtered = studyTasks.filter(t=>!t.done);
  else if(taskFilter==='done') filtered = studyTasks.filter(t=>t.done);
  if(!filtered.length) { list.innerHTML = '<li style="color:var(--text3);padding:12px;text-align:center;"><i class="fas fa-star"></i> Belum ada tugas. Santai dulu~</li>'; return; }
  list.innerHTML = filtered.map((t,i)=>{
    const realIdx = studyTasks.indexOf(t);
    const dl = t.deadline ? `<i class="fas fa-calendar-alt"></i> ${new Date(t.deadline).toLocaleDateString('id-ID')}` : '';
    const sb = t.subject ? `<i class="fas fa-book"></i> ${t.subject}` : '';
    return `<li style="${t.done?'opacity:0.6;':''}"><input type="checkbox" ${t.done?'checked':''} onchange="toggleStudyTask(${realIdx})"><span style="flex:1;text-decoration:${t.done?'line-through':'none'}">${esc(t.text)} ${sb?`<small style="color:var(--text2);font-size:0.7rem;margin-left:6px;">${sb}</small>`:''} ${dl?`<small style="color:var(--text3);font-size:0.7rem;margin-left:6px;">${dl}</small>`:''}</span><button class="btn btn-ghost" style="padding:2px 8px;font-size:0.7rem" onclick="deleteStudyTask(${realIdx})">✕</button></li>`;
  }).join('');
}

function updateStudyStats() {
  const total = studyData.length, tasks = studyTasks.length, done = studyTasks.filter(t=>t.done).length, hours = Math.round(studyData.length*0.75*10)/10;
  if($('#totalSubjects')) $('#totalSubjects').textContent = total;
  if($('#totalTasks')) $('#totalTasks').textContent = tasks;
  if($('#doneTasks')) $('#doneTasks').textContent = done;
  if($('#studyHours')) $('#studyHours').textContent = hours;
}

function filterTasks(f) { taskFilter = f; $$('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter===f)); renderStudyTasks(); }

function openStudyForm(hari='SENIN',jam='07:00-07:45',edit=null){
  const modal = $('#modalContent');
  modal.innerHTML = `<h3>${edit?'Edit':'Tambah'} Pelajaran</h3>
    <select id="fHari">${DAYS.slice(0,5).map(d=>`<option ${hari===d?'selected':''}>${d}</option>`).join('')}</select>
    <select id="fJam">${JAM_SLOTS.map(j=>`<option ${jam===j?'selected':''}>${j}</option>`).join('')}</select>
    <input id="fMapel" placeholder="Mata Pelajaran" value="${edit?esc(edit.mapel):''}">
    <input id="fGuru" placeholder="Guru" value="${edit?esc(edit.guru||''):''}">
    <input id="fRuangan" placeholder="Ruangan" value="${edit?esc(edit.ruangan||''):''}">
    <input type="color" id="fWarna" value="${edit?edit.warna:'#4f46e5'}" style="height:38px;border-radius:8px;padding:2px;">
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>${edit?'<button class="btn btn-danger" id="deleteStudyBtn">Hapus</button>':''}<button class="btn btn-primary" id="saveStudyBtn">Simpan</button></div>`;
  $('#modalOverlay').classList.add('active');
  $('#saveStudyBtn').onclick = ()=>{
    const mapel = $('#fMapel').value.trim();
    if(!mapel) return toast('<i class="fas fa-exclamation-circle"></i> Mapel wajib diisi','error');
    const data = { hari:$('#fHari').value, jam:$('#fJam').value, mapel, guru:$('#fGuru').value.trim(), ruangan:$('#fRuangan').value.trim(), warna:$('#fWarna').value };
    if(edit) Object.assign(edit,data); else studyData.push(data);
    localStorage.setItem(STORAGE.study, JSON.stringify(studyData));
    closeModal(); renderStudy(); updateStudyStats(); updateSubjectDatalist(); toast('<i class="fas fa-check-circle"></i> Disimpan','success');
  };
  if(edit) $('#deleteStudyBtn').onclick = ()=>{ if(confirm('Hapus mata pelajaran ini?')){ studyData = studyData.filter(s=>s!==edit); localStorage.setItem(STORAGE.study, JSON.stringify(studyData)); closeModal(); renderStudy(); updateStudyStats(); updateSubjectDatalist(); toast('<i class="fas fa-trash"></i> Dihapus','error'); } };
}

function addStudyTask() {
  const input = $('#studyTaskInput'), subject = $('#taskSubject')?.value.trim() || '', deadline = $('#taskDeadline')?.value || '', text = input?.value.trim();
  if(!text) return;
  if(subject) addSubject(subject);
  studyTasks.push({ text, done:false, subject, deadline, createdAt: new Date().toISOString() });
  input.value = ''; $('#taskSubject').value = ''; if($('#taskDeadline')) $('#taskDeadline').value = '';
  localStorage.setItem(STORAGE.tasks, JSON.stringify(studyTasks)); renderStudyTasks(); updateStudyStats(); toast('<i class="fas fa-star"></i> Tugas ditambahkan!','success');
}

function toggleStudyTask(i) { studyTasks[i].done = !studyTasks[i].done; localStorage.setItem(STORAGE.tasks, JSON.stringify(studyTasks)); renderStudyTasks(); updateStudyStats(); }
function deleteStudyTask(i) { studyTasks.splice(i,1); localStorage.setItem(STORAGE.tasks, JSON.stringify(studyTasks)); renderStudyTasks(); updateStudyStats(); }
function resetStudy() { if(confirm('Hapus semua jadwal pelajaran?')){ studyData=[]; localStorage.removeItem(STORAGE.study); renderStudy(); updateStudyStats(); updateSubjectDatalist(); toast('<i class="fas fa-info-circle"></i> Jadwal pelajaran direset','info'); } }
function resetTasks() { if(confirm('Hapus semua tugas?')){ studyTasks=[]; localStorage.removeItem(STORAGE.tasks); renderStudyTasks(); updateStudyStats(); toast('<i class="fas fa-info-circle"></i> Tugas direset','info'); } }

// ============================================================
// NOTES
// ============================================================
function renderNotes() {
  const grid = $('#studyNotes'); if(!grid) return;
  if(!studyNotes.length) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-sticky-note"></i><p>Belum ada catatan</p></div>'; return; }
  grid.innerHTML = studyNotes.map((n,i)=>`<div class="note-card"><div class="note-header"><span class="note-title">${esc(n.title)}</span><button onclick="deleteNote(${i})" style="background:none;border:none;color:var(--text3);cursor:pointer;">✕</button></div><div class="note-body">${esc(n.content)}</div><div class="note-footer"><small>${new Date(n.createdAt).toLocaleDateString('id-ID')}</small>${n.tags?n.tags.map(t=>`<span class="note-tag">#${t}</span>`).join(''):''}</div></div>`).join('');
}

function addNote() {
  const modal = $('#modalContent');
  modal.innerHTML = `<h3><i class="fas fa-sticky-note"></i> Tambah Catatan</h3><input id="fNoteTitle" placeholder="Judul catatan..."><textarea id="fNoteContent" placeholder="Isi catatan..." rows="5" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-family:inherit;"></textarea><input id="fNoteTags" placeholder="Tag (pisahkan dengan koma) ex: matematika, fisika"><div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveNoteBtn">Simpan</button></div>`;
  $('#modalOverlay').classList.add('active');
  $('#saveNoteBtn').onclick = ()=>{
    const title = $('#fNoteTitle').value.trim(), content = $('#fNoteContent').value.trim();
    if(!title||!content) return toast('<i class="fas fa-exclamation-circle"></i> Judul & isi wajib diisi','error');
    const tags = $('#fNoteTags').value.split(',').map(t=>t.trim()).filter(Boolean);
    studyNotes.push({ title, content, tags, createdAt: new Date().toISOString() });
    localStorage.setItem(STORAGE.notes, JSON.stringify(studyNotes)); closeModal(); renderNotes(); toast('<i class="fas fa-check-circle"></i> Catatan disimpan','success');
  };
}

function deleteNote(i) { if(confirm('Hapus catatan ini?')){ studyNotes.splice(i,1); localStorage.setItem(STORAGE.notes, JSON.stringify(studyNotes)); renderNotes(); toast('<i class="fas fa-trash"></i> Catatan dihapus','error'); } }
function resetNotes() { if(confirm('Hapus semua catatan?')){ studyNotes=[]; localStorage.removeItem(STORAGE.notes); renderNotes(); toast('<i class="fas fa-info-circle"></i> Catatan direset','info'); } }

// ============================================================
// WORKOUT FUNCTIONS
// ============================================================
function renderWorkout() {
  const filtered = workoutData.filter(w=>w.day===workoutFilter);
  const grid = $('#workoutGrid'); if(!grid) return;
  if(!filtered.length) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-dumbbell"></i><p>Belum ada jadwal</p></div>'; return; }
  grid.innerHTML = filtered.map(w=>{
    const idx = workoutData.indexOf(w);
    return `<div class="workout-card ${w.done?'completed':''}"><div class="workout-name">${esc(w.name)}</div><div class="workout-meta"><span><i class="fas fa-clock"></i> ${w.time}</span><span>${w.day}</span></div><div class="workout-detail">${w.sets}s × ${w.reps}r · ${w.kg}kg</div><div class="card-actions"><button class="btn-check" onclick="toggleWorkout(${idx})"><i class="fas fa-check"></i> ${w.done?'Batal':'Selesai'}</button><button class="btn-edit" onclick="openWorkoutForm(${idx})"><i class="fas fa-pen"></i></button><button class="btn-delete" onclick="deleteWorkout(${idx})"><i class="fas fa-trash"></i></button></div></div>`;
  }).join('');
  updateWorkoutStats();
}

function updateWorkoutStats() {
  const total = workoutData.length;
  const todayIdx = new Date().getDay()===0?6:new Date().getDay()-1;
  const today = DAYS[todayIdx], todayW = workoutData.filter(w=>w.day===today);
  const done = todayW.filter(w=>w.done).length;
  const totalVolume = workoutData.reduce((sum,w)=>sum+w.sets*w.reps*w.kg,0);
  const weekDone = workoutData.filter(w=>DAYS.indexOf(w.day)<5&&w.done).length;
  const weekDays = workoutData.filter(w=>DAYS.indexOf(w.day)<5);
  const weekProgress = weekDays.length>0?Math.round((weekDone/weekDays.length)*100):0;
  if($('#totalWorkout')) $('#totalWorkout').textContent = total;
  if($('#doneWorkout')) $('#doneWorkout').textContent = done;
  if($('#workoutStreak')) $('#workoutStreak').textContent = wStreak.count||0;
  if($('#totalVolume')) $('#totalVolume').textContent = totalVolume.toLocaleString('id-ID');
  if($('#weeklyProgress')) $('#weeklyProgress').textContent = weekProgress+'%';
}

function openWorkoutForm(editIdx=-1) {
  const item = editIdx>=0?workoutData[editIdx]:null;
  const modal = $('#modalContent');
  modal.innerHTML = `<h3>${item?'Edit':'Tambah'} Workout</h3><input id="fName" placeholder="Nama latihan" value="${item?esc(item.name):''}"><select id="fDay">${DAYS.map(d=>`<option ${item&&item.day===d?'selected':''}>${d}</option>`).join('')}</select><input type="time" id="fTime" value="${item?item.time:'07:00'}"><div style="display:flex;gap:8px;"><input type="number" id="fSets" placeholder="Set" value="${item?item.sets:3}" min="0"><input type="number" id="fReps" placeholder="Reps" value="${item?item.reps:10}" min="0"><input type="number" id="fKg" placeholder="Kg" value="${item?item.kg:0}" min="0" step="0.5"></div><div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveWorkoutBtn">Simpan</button></div>`;
  $('#modalOverlay').classList.add('active');
  $('#saveWorkoutBtn').onclick = ()=>{
    const name = $('#fName').value.trim();
    if(!name) return toast('<i class="fas fa-exclamation-circle"></i> Nama latihan wajib diisi','error');
    const data = { name, day:$('#fDay').value, time:$('#fTime').value, sets:+$('#fSets').value||0, reps:+$('#fReps').value||0, kg:+$('#fKg').value||0, done: item?item.done:false };
    if(editIdx>=0) workoutData[editIdx]=data; else workoutData.push(data);
    localStorage.setItem(STORAGE.workout, JSON.stringify(workoutData)); closeModal(); renderWorkout(); toast('<i class="fas fa-check-circle"></i> Disimpan','success');
  };
}

function toggleWorkout(i) {
  workoutData[i].done = !workoutData[i].done;
  if(workoutData[i].done) updateWorkoutStreak();
  localStorage.setItem(STORAGE.workout, JSON.stringify(workoutData)); renderWorkout();
}

function updateWorkoutStreak() {
  const today = new Date().toLocaleDateString('en-CA');
  if(wStreak.last===today) return;
  const yest = new Date(Date.now()-86400000).toLocaleDateString('en-CA');
  wStreak.count = wStreak.last===yest?wStreak.count+1:1;
  wStreak.last = today;
  localStorage.setItem(STORAGE.wstreak, JSON.stringify(wStreak));
}

function deleteWorkout(i) { if(confirm('Hapus latihan ini?')){ workoutData.splice(i,1); localStorage.setItem(STORAGE.workout, JSON.stringify(workoutData)); renderWorkout(); toast('<i class="fas fa-trash"></i> Dihapus','error'); } }
function resetWorkout() { if(confirm('Hapus semua jadwal workout?')){ workoutData=[]; localStorage.removeItem(STORAGE.workout); renderWorkout(); toast('<i class="fas fa-info-circle"></i> Workout direset','info'); } }

// ============================================================
// MUSCLE GROUPS
// ============================================================
function renderMuscleGroups() {
  const grid = $('#muscleGrid'); if(!grid) return;
  if(!muscleGroups.length) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-muscle"></i><p>Belum ada muscle group</p></div>'; return; }
  grid.innerHTML = muscleGroups.map((m,i)=>`<div class="muscle-card"><div class="muscle-name">${esc(m.name)}</div><div class="muscle-exercises">${m.exercises||'Belum ada latihan'}</div><div class="muscle-progress"><div class="muscle-progress-bar"><div class="muscle-progress-fill" style="width:${m.progress||0}%"></div></div><span>${m.progress||0}%</span></div><button onclick="deleteMuscleGroup(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;">✕</button></div>`).join('');
}

function addMuscleGroup() {
  const modal = $('#modalContent');
  modal.innerHTML = `<h3><i class="fas fa-bullseye"></i> Tambah Muscle Group</h3><input id="fMuscleName" placeholder="Nama muscle group"><input id="fMuscleExercises" placeholder="Latihan"><input type="number" id="fMuscleProgress" placeholder="Progress (%)" value="0" min="0" max="100"><div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveMuscleBtn">Simpan</button></div>`;
  $('#modalOverlay').classList.add('active');
  $('#saveMuscleBtn').onclick = ()=>{
    const name = $('#fMuscleName').value.trim();
    if(!name) return toast('<i class="fas fa-exclamation-circle"></i> Nama wajib diisi','error');
    muscleGroups.push({ name, exercises:$('#fMuscleExercises').value.trim(), progress:Math.min(100,Math.max(0,+$('#fMuscleProgress').value||0)) });
    localStorage.setItem(STORAGE.muscle, JSON.stringify(muscleGroups)); closeModal(); renderMuscleGroups(); toast('<i class="fas fa-check-circle"></i> Muscle group ditambahkan','success');
  };
}

function deleteMuscleGroup(i) { if(confirm('Hapus muscle group ini?')){ muscleGroups.splice(i,1); localStorage.setItem(STORAGE.muscle, JSON.stringify(muscleGroups)); renderMuscleGroups(); toast('<i class="fas fa-trash"></i> Dihapus','error'); } }
function resetMuscleGroups() { if(confirm('Hapus semua muscle group?')){ muscleGroups=[]; localStorage.removeItem(STORAGE.muscle); renderMuscleGroups(); toast('<i class="fas fa-info-circle"></i> Muscle groups direset','info'); } }

// ============================================================
// WORKOUT HISTORY
// ============================================================
function renderWorkoutHistory() {
  const container = $('#workoutHistory'); if(!container) return;
  const last7Days = [];
  for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const dayName=DAYS[d.getDay()===0?6:d.getDay()-1]; const dateStr=d.toLocaleDateString('id-ID'); const dayData=workoutData.filter(w=>w.day===dayName); const done=dayData.filter(w=>w.done).length; last7Days.push({dayName,dateStr,total:dayData.length,done}); }
  container.innerHTML = `<div class="history-grid">${last7Days.map(d=>`<div class="history-item ${d.total>0&&d.done===d.total?'complete':''}"><div class="history-date">${d.dateStr}</div><div class="history-day">${d.dayName}</div><div class="history-stats">${d.done}/${d.total}</div><div class="history-bar"><div class="history-bar-fill" style="width:${d.total>0?(d.done/d.total)*100:0}%"></div></div></div>`).join('')}</div>`;
}

// ============================================================
// SAVING FUNCTIONS
// ============================================================
function renderSaving() {
  const list = $('#savingList'); if(!list) return;
  if(!savingData.length) { list.innerHTML = '<div class="empty-state"><i class="fas fa-piggy-bank"></i><p>Belum ada target</p></div>'; return; }
  list.innerHTML = savingData.map((s,i)=>{
    const pct = s.target>0?Math.min(100,Math.round((s.current/s.target)*100)):0;
    return `<div class="saving-item"><span class="saving-name">${esc(s.name)}</span><div class="saving-progress-bar"><div class="saving-progress-fill" style="width:${pct}%"></div></div><span class="saving-meta">Rp${Number(s.current).toLocaleString('id-ID')} / Rp${Number(s.target).toLocaleString('id-ID')} (${pct}%)</span><div class="saving-actions"><button class="btn-edit" onclick="openSavingForm(${i})"><i class="fas fa-pen"></i></button><button class="btn-delete" onclick="deleteSaving(${i})"><i class="fas fa-trash"></i></button></div></div>`;
  }).join('');
}

function openSavingForm(editIdx=-1) {
  const item = editIdx>=0?savingData[editIdx]:null;
  const modal = $('#modalContent');
  modal.innerHTML = `<h3>${item?'Edit':'Tambah'} Target</h3>
    <input id="fName" placeholder="Nama target" value="${item?esc(item.name):''}">
    <input type="text" class="nominal-input" inputmode="numeric" id="fTarget" placeholder="Target (Rp)" value="${item?item.target.toLocaleString('id-ID'):''}">
    <input type="text" class="nominal-input" inputmode="numeric" id="fCurrent" placeholder="Terkumpul (Rp)" value="${item?item.current.toLocaleString('id-ID'):'0'}">
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveSavingBtn">Simpan</button></div>`;
  $('#modalOverlay').classList.add('active');
  $('#saveSavingBtn').onclick = ()=>{
    const name = $('#fName').value.trim();
    const targetRaw = $('#fTarget').value.replace(/\D/g, '');
    const target = Number(targetRaw) || 0;
    const currentRaw = $('#fCurrent').value.replace(/\D/g, '');
    const current = Number(currentRaw) || 0;
    if(!name||target<=0) return toast('<i class="fas fa-exclamation-circle"></i> Nama & target nominal valid wajib diisi','error');
    const data = { name, target, current };
    if(editIdx>=0) savingData[editIdx]=data; else savingData.push(data);
    localStorage.setItem(STORAGE.saving, JSON.stringify(savingData)); closeModal(); renderSaving(); toast('<i class="fas fa-check-circle"></i> Disimpan','success');
  };
}

function deleteSaving(i) { if(confirm('Hapus target tabungan ini?')){ savingData.splice(i,1); localStorage.setItem(STORAGE.saving, JSON.stringify(savingData)); renderSaving(); toast('<i class="fas fa-trash"></i> Dihapus','error'); } }
function resetSaving() { if(confirm('Hapus semua target tabungan?')){ savingData=[]; localStorage.removeItem(STORAGE.saving); renderSaving(); toast('<i class="fas fa-info-circle"></i> Tabungan direset','info'); } }

// ============================================================
// CHART FUNCTIONS
// ============================================================
function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme')==='dark';
  return { textColor: isDark?'#cbd5e1':'#6e6e73', gridColor: isDark?'#334155':'#e5e7eb' };
}

function renderChart(tab=currentChartTab) {
  const canvas = $('#chartCanvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  if(chartInstance){ chartInstance.destroy(); chartInstance=null; }
  const colors = getChartColors();
  const isDark = document.documentElement.getAttribute('data-theme')==='dark';
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()||'#4f46e5';
  const success = getComputedStyle(document.documentElement).getPropertyValue('--success').trim()||'#34c759';
  const danger = getComputedStyle(document.documentElement).getPropertyValue('--danger').trim()||'#ff3b30';
  let data=null;
  const options = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ labels:{ color:colors.textColor, font:{size:12} } } },
    scales:{ x:{ ticks:{ color:colors.textColor }, grid:{ color:colors.gridColor } }, y:{ ticks:{ color:colors.textColor }, grid:{ color:colors.gridColor } } }
  };
  const desc = $('#chartDescription');
  switch(tab){
    case 'study-tasks':{
      const total=studyTasks.length, done=studyTasks.filter(t=>t.done).length, pending=total-done;
      data={ type:'doughnut', data:{ labels:['Selesai','Belum'], datasets:[{ data:[done,pending], backgroundColor:[success,danger], borderWidth:2, borderColor:isDark?'#1e293b':'#ffffff' }] }, options:{...options, plugins:{...options.plugins, legend:{...options.plugins.legend, position:'bottom'}}} };
      desc.innerHTML = `<i class="fas fa-pencil-alt"></i> Tugas: ${done} selesai, ${pending} belum (total ${total})`; break;
    }
    case 'study-subjects':{
      const sc={}; studyData.forEach(s=>{ sc[s.mapel]=(sc[s.mapel]||0)+1; });
      const labels=Object.keys(sc), values=Object.values(sc);
      const cols=labels.map((_,i)=>`hsl(${(i*360)/labels.length},70%,60%)`);
      data={ type:'pie', data:{ labels, datasets:[{ data:values, backgroundColor:cols, borderWidth:2, borderColor:isDark?'#1e293b':'#ffffff' }] }, options:{...options, plugins:{...options.plugins, legend:{...options.plugins.legend, position:'bottom'}}} };
      desc.innerHTML = `<i class="fas fa-book"></i> Distribusi ${labels.length} mata pelajaran`; break;
    }
    case 'study-trend':{
      const trend=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=d.toLocaleDateString('id-ID'); const cnt=studyTasks.filter(t=>{if(!t.done)return false; const td=new Date(t.createdAt); return td.toDateString()===d.toDateString();}).length; trend.push({date:ds,count:cnt}); }
      data={ type:'line', data:{ labels:trend.map(d=>d.date), datasets:[{ label:'Tugas Selesai', data:trend.map(d=>d.count), borderColor:primary, backgroundColor:primary+'33', fill:true, tension:0.4, pointBackgroundColor:primary, pointRadius:4 }] }, options:{...options, plugins:{...options.plugins, legend:{display:false}} } };
      desc.innerHTML = '<i class="fas fa-chart-line"></i> Tren penyelesaian tugas 7 hari terakhir'; break;
    }
    case 'workout-daily':{
      const dayCounts = DAYS.map(day=>({ day:day.slice(0,3), total:workoutData.filter(w=>w.day===day).length, done:workoutData.filter(w=>w.day===day&&w.done).length }));
      data={ type:'bar', data:{ labels:dayCounts.map(d=>d.day), datasets:[{ label:'Total', data:dayCounts.map(d=>d.total), backgroundColor:primary+'99', borderRadius:4 },{ label:'Selesai', data:dayCounts.map(d=>d.done), backgroundColor:success+'99', borderRadius:4 }] }, options:{...options, plugins:{...options.plugins, legend:{...options.plugins.legend, position:'top'}}, scales:{...options.scales, x:{...options.scales.x, stacked:false}, y:{...options.scales.y, beginAtZero:true}} } };
      desc.innerHTML = '<i class="fas fa-dumbbell"></i> Jumlah latihan per hari (total vs selesai)'; break;
    }
    case 'workout-volume':{
      const vol=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const dn=DAYS[d.getDay()===0?6:d.getDay()-1]; const dd=workoutData.filter(w=>w.day===dn); vol.push({day:dn.slice(0,3), volume:dd.reduce((s,w)=>s+w.sets*w.reps*w.kg,0)}); }
      data={ type:'line', data:{ labels:vol.map(d=>d.day), datasets:[{ label:'Volume (kg)', data:vol.map(d=>d.volume), borderColor:'#f59e0b', backgroundColor:'#f59e0b33', fill:true, tension:0.4, pointBackgroundColor:'#f59e0b', pointRadius:4 }] }, options:{...options, plugins:{...options.plugins, legend:{display:false}}, scales:{...options.scales, y:{...options.scales.y, beginAtZero:true}} } };
      desc.innerHTML = '<i class="fas fa-bolt"></i> Total volume angkatan (kg) per hari'; break;
    }
    case 'workout-active':{
      const activeDays = workoutData.filter(w=>w.done).length;
      data={ type:'doughnut', data:{ labels:['Hari Aktif','Hari Istirahat'], datasets:[{ data:[activeDays, DAYS.length-activeDays], backgroundColor:['#34c759','#94a3b8'], borderWidth:2, borderColor:isDark?'#1e293b':'#ffffff' }] }, options:{...options, plugins:{...options.plugins, legend:{...options.plugins.legend, position:'bottom'}}} };
      desc.innerHTML = `<i class="fas fa-bullseye"></i> ${activeDays} hari aktif dari ${DAYS.length} hari`; break;
    }
  }
  if(data) chartInstance = new Chart(ctx, data);
  if(!window._chartThemeObserver){
    window._chartThemeObserver=true;
    const obs = new MutationObserver(()=>{ if(chartInstance && document.querySelector('#panelChart.active')){ const nc=getChartColors(); chartInstance.options.plugins.legend.labels.color=nc.textColor; chartInstance.options.scales.x.ticks.color=nc.textColor; chartInstance.options.scales.y.ticks.color=nc.textColor; chartInstance.options.scales.x.grid.color=nc.gridColor; chartInstance.options.scales.y.grid.color=nc.gridColor; chartInstance.update(); } });
    obs.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
  }
}

function switchChartTab(tab) { currentChartTab=tab; $$('.chart-tab').forEach(b=>b.classList.toggle('active',b.dataset.chart===tab)); renderChart(tab); }

// ============================================================
// DONGHUA FUNCTIONS
// ============================================================
function getDonghuaStats() {
  return {
    total: donghuaData.length,
    watching: donghuaData.filter(d=>d.status==='watching').length,
    finished: donghuaData.filter(d=>d.status==='finished').length,
    waiting: donghuaData.filter(d=>d.status==='waiting').length
  };
}

function renderDonghua() {
  const grid = $('#donghuaGrid');
  if (!grid) return;

  let filtered = [...donghuaData];
  if (donghuaFilter === 'watching') filtered = filtered.filter(d => d.status === 'watching');
  else if (donghuaFilter === 'finished') filtered = filtered.filter(d => d.status === 'finished');
  else if (donghuaFilter === 'waiting') filtered = filtered.filter(d => d.status === 'waiting');
  else if (donghuaFilter === 'favorites') filtered = filtered.filter(d => d.favorite);
  if (donghuaSearchQuery.trim()) filtered = filtered.filter(d => d.title.toLowerCase().includes(donghuaSearchQuery.toLowerCase().trim()));
  if (hideFinished) filtered = filtered.filter(d => d.status !== 'finished');
  if (donghuaSort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (donghuaSort === 'progress') filtered.sort((a, b) => ((b.total > 0 ? b.current / b.total : 0) - (a.total > 0 ? a.current / a.total : 0)));
  else if (donghuaSort === 'latest') filtered.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  else if (donghuaSort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (!filtered.length) {
    grid.innerHTML = '';
    grid.classList.add('donghua-empty');
    updateDonghuaStats();
    return;
  }
  grid.classList.remove('donghua-empty');

  grid.innerHTML = filtered.map((d) => {
    const progress = d.total > 0 ? Math.round((d.current / d.total) * 100) : 0;
    const statusLabel = {
      watching: '<i class="fas fa-play"></i> Watching',
      finished: '<i class="fas fa-check-circle"></i> Finished',
      waiting: '<i class="fas fa-hourglass-start"></i> Waiting'
    }[d.status] || d.status;
    const ratingStars = '<i class="fas fa-star" style="color:#fbbf24;"></i>'.repeat(d.rating || 0);
    const realIdx = donghuaData.indexOf(d);
    return `<div class="donghua-card">
      ${d.favorite ? '<div class="donghua-favorite"><i class="fas fa-star" style="color:#fbbf24;"></i></div>' : ''}
      <div class="donghua-title">${esc(d.title)}</div>
      <div class="donghua-status ${d.status}">${statusLabel}</div>
      <div class="donghua-progress">${d.current}/${d.total} ep (${progress}%)</div>
      <div class="donghua-rating">${ratingStars}</div>
      <div class="donghua-actions">
        <button class="btn-progress" onclick="donghuaProgress(${realIdx})"><i class="fas fa-plus"></i></button>
        <button class="btn-edit" onclick="openDonghuaForm(${realIdx})"><i class="fas fa-pen"></i></button>
        <button class="btn-fav" onclick="donghuaToggleFav(${realIdx})"><i class="fas fa-star"></i></button>
        <button class="btn-delete" onclick="donghuaDelete(${realIdx})"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
  updateDonghuaStats();
}

function updateDonghuaStats() {
  const s = getDonghuaStats();
  if ($('#statTotal')) $('#statTotal').textContent = s.total;
  if ($('#statWatching')) $('#statWatching').textContent = s.watching;
  if ($('#statFinished')) $('#statFinished').textContent = s.finished;
  if ($('#statWaiting')) $('#statWaiting').textContent = s.waiting;
  if ($('#pointDisplay')) $('#pointDisplay').innerHTML = `<i class="fas fa-star"></i> ${s.total * 2 + s.finished * 5}`;
}

function donghuaProgress(idx) {
  const d = donghuaData[idx]; if (!d) return;
  if (d.current < d.total) {
    d.current += 1;
    if (d.current >= d.total) { d.status = 'finished'; toast('<i class="fas fa-tada"></i> Donghua selesai!', 'success'); }
    d.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE.donghua, JSON.stringify(donghuaData));
    renderDonghua();
  } else toast('<i class="fas fa-info-circle"></i> Sudah mencapai episode terakhir!', 'info');
}

function donghuaToggleFav(idx) {
  const d = donghuaData[idx]; if (!d) return;
  d.favorite = !d.favorite; d.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE.donghua, JSON.stringify(donghuaData));
  renderDonghua();
  toast(d.favorite ? '<i class="fas fa-star"></i> Ditambahkan ke favorit' : '<i class="fas fa-star"></i> Dihapus dari favorit', 'info');
}

function donghuaDelete(idx) {
  if (confirm('Hapus donghua ini?')) { donghuaData.splice(idx, 1); localStorage.setItem(STORAGE.donghua, JSON.stringify(donghuaData)); renderDonghua(); toast('<i class="fas fa-trash"></i> Dihapus', 'error'); }
}

function openDonghuaForm(editIdx = -1) {
  const overlay = $('#donghuaModalOverlay'), title = $('#donghuaModalTitle'), editId = $('#donghuaEditId');
  const nameInput = $('#donghuaTitle'), totalInput = $('#donghuaTotal'), currentInput = $('#donghuaCurrent');
  const statusInput = $('#donghuaStatus'), ratingInput = $('#donghuaRating'), favInput = $('#donghuaFavorite');
  if (editIdx >= 0 && editIdx < donghuaData.length) {
    const d = donghuaData[editIdx];
    title.innerHTML = '<i class="fas fa-pen"></i> Edit Donghua'; editId.value = editIdx; nameInput.value = d.title; totalInput.value = d.total; currentInput.value = d.current;
    statusInput.value = d.status; ratingInput.value = d.rating || 5; favInput.checked = d.favorite || false;
  } else {
    title.innerHTML = '<i class="fas fa-plus"></i> Tambah Donghua'; editId.value = -1; nameInput.value = ''; totalInput.value = 12; currentInput.value = 0;
    statusInput.value = 'watching'; ratingInput.value = 5; favInput.checked = false;
  }
  overlay.classList.add('active');
}

function closeDonghuaModal() { $('#donghuaModalOverlay').classList.remove('active'); }

function saveDonghua() {
  const editId = parseInt($('#donghuaEditId').value), title = $('#donghuaTitle').value.trim();
  const total = parseInt($('#donghuaTotal').value) || 12, current = parseInt($('#donghuaCurrent').value) || 0;
  const status = $('#donghuaStatus').value, rating = parseInt($('#donghuaRating').value) || 5, favorite = $('#donghuaFavorite').checked;
  if (!title) { toast('<i class="fas fa-exclamation-circle"></i> Judul wajib diisi!', 'error'); return; }
  if (title.length > 50) { toast('<i class="fas fa-exclamation-circle"></i> Judul maksimal 50 karakter', 'error'); return; }
  if (current > total) { toast('<i class="fas fa-exclamation-circle"></i> Episode saat ini tidak boleh melebihi total', 'error'); return; }
  const data = { title, total, current, status, rating, favorite, updatedAt: new Date().toISOString() };
  if (editId >= 0 && editId < donghuaData.length) donghuaData[editId] = { ...donghuaData[editId], ...data };
  else donghuaData.push({ ...data, createdAt: new Date().toISOString() });
  localStorage.setItem(STORAGE.donghua, JSON.stringify(donghuaData));
  closeDonghuaModal(); renderDonghua(); toast('<i class="fas fa-film"></i> Donghua disimpan!', 'success');
}

function resetDonghua() {
  if (confirm('Hapus semua donghua?')) { donghuaData = []; localStorage.removeItem(STORAGE.donghua); renderDonghua(); toast('Donghua direset', 'info'); }
}

function initDonghuaEvents() {
  $('#donghuaSearch')?.addEventListener('input', function() { donghuaSearchQuery = this.value; renderDonghua(); });
  document.querySelectorAll('#filterGroup .filter-btn').forEach(btn => btn.addEventListener('click', function() {
    document.querySelectorAll('#filterGroup .filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active'); donghuaFilter = this.dataset.filter; renderDonghua();
  }));
  $('#sortSelect')?.addEventListener('change', function() { donghuaSort = this.value; renderDonghua(); });
  $('#hideFinished')?.addEventListener('change', function() { hideFinished = this.checked; renderDonghua(); });
  $('#openAddDonghuaBtn')?.addEventListener('click', () => openDonghuaForm(-1));
  $('#closeDonghuaModal')?.addEventListener('click', closeDonghuaModal);
  $('#donghuaModalOverlay')?.addEventListener('click', e => { if (e.target === $('#donghuaModalOverlay')) closeDonghuaModal(); });
  $('#donghuaForm')?.addEventListener('submit', e => { e.preventDefault(); saveDonghua(); });
}

// ============================================================
// AI ASSISTANT
// ============================================================
function processAICommand() {
  const input = $('#aiInput'), cmd = input.value.trim();
  if (!cmd) return;
  addAIMessage(cmd, 'user'); input.value = ''; addAIMessage(parseAndExecuteAI(cmd), 'bot');
}
function addAIMessage(text, sender) {
  const chat = $('#aiChatArea'); if (!chat) return;
  const div = document.createElement('div'); div.className = `ai-message ${sender}`; div.innerHTML = text;
  chat.appendChild(div); chat.scrollTop = chat.scrollHeight;
}
function parseAndExecuteAI(cmd) {
  const c = cmd.toLowerCase();
  if (c.includes('donghua') || c.includes('anime')) {
    const match = cmd.match(/(?:donghua|anime)\s+["']?([^"'\d]+?)["']?\s*(?:episode\s*)?(\d+)?/i);
    if (match && match[1]) {
      const title = match[1].trim(), ep = match[2] ? parseInt(match[2]) : 12;
      donghuaData.push({ title, total: ep, current: 0, status: 'watching', rating: 5, favorite: false, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() });
      localStorage.setItem(STORAGE.donghua, JSON.stringify(donghuaData)); renderDonghua();
      return `<i class="fas fa-check-circle"></i> Donghua <strong>${title}</strong> (${ep} ep) ditambahkan!`;
    }
    return '<i class="fas fa-times-circle"></i> Format salah. Contoh: "Tambah donghua Solo Leveling episode 12"';
  }
  if (c.includes('tugas') || c.includes('pr') || c.includes('task')) {
    let text = '', subject = '', deadline = '';
    const taskMatch = cmd.match(/(?:tugas|pr|task)\s+(.+?)(?:\s+(?:mapel|mata pelajaran)\s+([a-zA-Z\s]+))?(?:\s+deadline\s+(\d{1,2}\/\d{1,2}(\/\d{2,4})?|besok|lusa))?$/i);
    if (taskMatch) { text = taskMatch[1].trim(); subject = taskMatch[2] ? taskMatch[2].trim() : ''; deadline = taskMatch[3] ? taskMatch[3].trim() : ''; if (deadline === 'besok') { const t = new Date(); t.setDate(t.getDate()+1); deadline = t.toISOString().split('T')[0]; } else if (deadline === 'lusa') { const t = new Date(); t.setDate(t.getDate()+2); deadline = t.toISOString().split('T')[0]; } }
    else text = cmd.replace(/.*?(?:tugas|pr|task)\s+/i, '') || cmd;
    if (text) { studyTasks.push({ text, done: false, subject, deadline, createdAt: new Date().toISOString() }); localStorage.setItem(STORAGE.tasks, JSON.stringify(studyTasks)); renderStudyTasks(); updateStudyStats(); return `<i class="fas fa-check-circle"></i> Tugas <strong>"${text}"</strong> ditambahkan!`; }
    return '<i class="fas fa-times-circle"></i> Sebutkan isi tugas.';
  }
  if (c.includes('jadwal') || c.includes('pelajaran') || c.includes('mapel')) {
    const match = cmd.match(/(?:jadwal|pelajaran|mapel)\s+(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\s+(\d{1,2}:\d{2})\s+(.+)/i);
    if (match) { const hari = match[1].toUpperCase(), jam = match[2], mapel = match[3].trim(); studyData.push({ hari, jam, mapel, guru: '', ruangan: '', warna: '#4f46e5' }); localStorage.setItem(STORAGE.study, JSON.stringify(studyData)); renderStudy(); updateStudyStats(); updateSubjectDatalist(); return `<i class="fas fa-check-circle"></i> Jadwal <strong>${hari} ${jam}</strong> - ${mapel} ditambahkan!`; }
    return '<i class="fas fa-times-circle"></i> Format: "Jadwal Senin 07:00 Fisika"';
  }
  if (c.includes('nabung') || c.includes('tabung') || c.includes('target nabung') || c.includes('menabung')) {
    const match = cmd.match(/(?:nabung|tabung|target nabung|menabung)\s+(.+?)\s+(\d[\d.,]*)/i);
    if (match) { const name = match[1].trim(), target = parseFloat(match[2].replace(/\./g, '').replace(/,/g, '.')); if (name && !isNaN(target) && target > 0) { savingData.push({ name, target, current: 0 }); localStorage.setItem(STORAGE.saving, JSON.stringify(savingData)); renderSaving(); return `<i class="fas fa-check-circle"></i> Target nabung <strong>${name}</strong> sebesar Rp${target.toLocaleString('id-ID')} ditambahkan!`; } }
    return '<i class="fas fa-times-circle"></i> Format: "Nabung beli sepatu 500000"';
  }
  if (c.includes('catatan') || c.includes('note') || c.includes('catat')) {
    const content = cmd.replace(/.*?(?:catatan|note|catat)\s+/i, '');
    if (content) { studyNotes.push({ title: 'Catatan AI', content, tags: [], createdAt: new Date().toISOString() }); localStorage.setItem(STORAGE.notes, JSON.stringify(studyNotes)); renderNotes(); return `<i class="fas fa-check-circle"></i> Catatan ditambahkan: "${content.substring(0,50)}..."`; }
    return '<i class="fas fa-times-circle"></i> Tulis isi catatan.';
  }
  if (c.includes('workout') || c.includes('latihan')) {
    const match = cmd.match(/(?:workout|latihan)\s+(.+?)\s+(\d+)\s*kg\s+(\d+)\s*set\s+(\d+)\s*reps/i);
    if (match) { const name = match[1].trim(), kg = parseFloat(match[2])||0, sets = parseInt(match[3])||3, reps = parseInt(match[4])||10; workoutData.push({ name, day:'SENIN', time:'07:00', sets, reps, kg, done:false }); localStorage.setItem(STORAGE.workout, JSON.stringify(workoutData)); renderWorkout(); return `<i class="fas fa-check-circle"></i> Workout <strong>${name}</strong> (${sets}s × ${reps}r · ${kg}kg) ditambahkan!`; }
    return '<i class="fas fa-robot"></i> Untuk menambah workout, ketik: "workout [nama] [kg]kg [set]set [reps]reps"';
  }
  if (c.includes('muscle') || c.includes('otot')) {
    const match = cmd.match(/(?:muscle|otot)\s+(.+)/i);
    if (match) { const name = match[1].trim(); muscleGroups.push({ name, exercises:'', progress:0 }); localStorage.setItem(STORAGE.muscle, JSON.stringify(muscleGroups)); renderMuscleGroups(); return `<i class="fas fa-check-circle"></i> Muscle group <strong>${name}</strong> ditambahkan!`; }
    return '<i class="fas fa-times-circle"></i> Format: "muscle [nama]"';
  }
  if (c.includes('reset') && (c.includes('semua') || c.includes('all'))) { resetDashboard(); return '<i class="fas fa-check-circle"></i> Semua data telah direset.'; }
  return '<i class="fas fa-robot"></i> Maaf, aku tidak mengerti. Coba: "Tambah donghua", "Tambah tugas", "Jadwal Senin 07:00 Fisika", "Nabung ...", "Catatan ...", "Workout ...", "muscle ..."';
}

// ============================================================
// UTILITIES
// ============================================================
function closeModal() { $('#modalOverlay')?.classList.remove('active'); $('#modalContent').innerHTML = ''; }
function toast(msg, type='info') {
  const container = $('#toastContainer'); if (!container) return;
  const el = document.createElement('div'); el.className = `toast toast-${type}`; el.innerHTML = msg;
  container.appendChild(el); setTimeout(() => el.remove(), 3000);
}
function esc(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
function downloadFile(content, filename, mimeType='text/plain') {
  const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  toast('<i class="fas fa-check-circle"></i> File siap diunduh!', 'success');
}
function switchMode(mode) { const btn = document.querySelector(`.sidebar-btn[data-mode="${mode}"]`); if (btn) btn.click(); }

// ============================================================
// RESET
// ============================================================
function resetDashboard() {
  if (confirm('Reset SEMUA data? (Jadwal, Tugas, Catatan, Workout, Tabungan, Donghua)')) {
    ['study','tasks','notes','workout','saving','donghua','muscle','wstreak','subjects','budget'].forEach(k=>localStorage.removeItem(STORAGE[k]));
    loadAllData(); renderAll(); toast('Semua data direset!', 'info');
  }
}

// ============================================================
// BUDGET TRACKER
// ============================================================
function renderBudget() {
  const tbody = $('#budgetTableBody'), summary = $('#budgetSummary'); if (!tbody) return;
  const income = budgetData.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense = budgetData.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const balance = income - expense;
  if (summary) summary.innerHTML = `<i class="fas fa-coins"></i> Saldo: Rp ${balance.toLocaleString('id-ID')}`;
  if (!budgetData.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text3);">Belum ada transaksi.</td></tr>'; return; }
  tbody.innerHTML = budgetData.map((t,i)=>{
    const date = new Date(t.date).toLocaleDateString('id-ID');
    const amt = (t.type==='income'?'+':'-') + ' Rp ' + t.amount.toLocaleString('id-ID');
    const typeLabel = t.type==='income'?'<span style="color:var(--success);"><i class="fas fa-arrow-down"></i> Masuk</span>':'<span style="color:var(--danger);"><i class="fas fa-arrow-up"></i> Keluar</span>';
    return `<tr><td>${date}</td><td>${esc(t.desc)}</td><td>${amt}</td><td>${typeLabel}</td><td><button class="btn btn-ghost btn-sm" onclick="deleteBudgetEntry(${i})"><i class="fas fa-trash"></i></button></td></tr>`;
  }).join('');
}

function addBudgetEntry() {
  const modal = $('#modalContent');
  modal.innerHTML = `<h3><i class="fas fa-wallet"></i> Tambah Transaksi</h3>
    <input id="fBudgetDesc" placeholder="Keterangan">
    <input type="text" class="nominal-input" inputmode="numeric" id="fBudgetAmount" placeholder="Jumlah (Rp)" value="">
    <select id="fBudgetType"><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveBudgetBtn">Simpan</button></div>`;
  $('#modalOverlay').classList.add('active');
  $('#saveBudgetBtn').onclick = ()=>{
    const desc = $('#fBudgetDesc').value.trim();
    const rawAmount = $('#fBudgetAmount').value.replace(/\D/g, '');
    const amount = Number(rawAmount) || 0;
    if (!desc || amount <= 0) return toast('<i class="fas fa-exclamation-circle"></i> Isi keterangan dan jumlah yang valid','error');
    budgetData.push({ desc, amount, type:$('#fBudgetType').value, date:new Date().toISOString() });
    localStorage.setItem(STORAGE.budget, JSON.stringify(budgetData)); closeModal(); renderBudget(); toast('<i class="fas fa-check-circle"></i> Transaksi ditambahkan','success');
  };
}
function deleteBudgetEntry(i) { budgetData.splice(i,1); localStorage.setItem(STORAGE.budget, JSON.stringify(budgetData)); renderBudget(); toast('<i class="fas fa-trash"></i> Transaksi dihapus','error'); }
function resetBudget() { if (confirm('Hapus semua transaksi?')) { budgetData=[]; localStorage.removeItem(STORAGE.budget); renderBudget(); toast('<i class="fas fa-info-circle"></i> Budget direset','info'); } }

// ============================================================
// NOMINAL INPUT FORMATTER (COMMA) — REAL‑TIME
// ============================================================
function formatNominalInput(input) {
  if (!input) return;
  try {
    const raw = input.value.replace(/\D/g, '');
    if (raw === '') { input.value = ''; return; }
    const cursorPos = input.selectionStart || 0;
    const rawBeforeCursor = input.value.substring(0, cursorPos).replace(/\D/g, '');
    const digitCountBefore = rawBeforeCursor.length;
    const formatted = Number(raw).toLocaleString('id-ID');
    let newCursorPos = 0, digitSeen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        if (digitSeen === digitCountBefore) { newCursorPos = i; break; }
        digitSeen++;
      }
      if (i === formatted.length - 1 && digitSeen <= digitCountBefore) newCursorPos = formatted.length;
    }
    if (newCursorPos === 0 && digitCountBefore > 0) newCursorPos = formatted.length;
    input.value = formatted;
    input.setSelectionRange(newCursorPos, newCursorPos);
  } catch (e) { console.warn('Nominal formatter error', e); }
}

function initNominalInputEvents() {
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('nominal-input')) formatNominalInput(e.target);
  });
}

// ============================================================
// SERVICE WORKER REGISTRATION
// ============================================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('✅ SW registered'))
      .catch(err => console.log('❌ SW failed', err));
  }
}

// ============================================================
// INIT
// ============================================================
function init() {
  registerServiceWorker(); // Daftarkan service worker di awal
  loadTheme();
  loadAllData();

  document.body.style.overflow = 'hidden';
  document.getElementById('mainWrapper').style.opacity = '0';
  startLoadingAnimation();

  setTimeout(() => {
    try {
      currentMode = 'dashboard';
      localStorage.setItem(STORAGE.mode, 'dashboard');
      setActiveMode(currentMode, true);
      renderAll();
      initDonghuaEvents();

      $('#toggleAiPanel')?.addEventListener('click', ()=>$('#aiPanel')?.classList.toggle('active'));
      $('#closeAiPanel')?.addEventListener('click', ()=>$('#aiPanel')?.classList.remove('active'));
      $('#aiInput')?.addEventListener('keypress', e=>{ if(e.key==='Enter') processAICommand(); });

      $('.sidebar-nav')?.addEventListener('click', e=>{
        const btn = e.target.closest('.sidebar-btn'); if(!btn) return;
        currentMode = btn.dataset.mode; localStorage.setItem(STORAGE.mode, currentMode);
        setActiveMode(currentMode); renderAll(); closeSidebar();
      });
      $('#hamburgerBtn')?.addEventListener('click', toggleSidebar);
      $('#closeSidebarBtn')?.addEventListener('click', closeSidebar);
      $('#sidebarOverlay')?.addEventListener('click', closeSidebar);
      document.addEventListener('click', e=>{
        if(window.innerWidth<=768 && !$('#sidebar')?.contains(e.target) && !$('#hamburgerBtn')?.contains(e.target)) closeSidebar();
      });

      $('#themeToggle')?.addEventListener('click', cycleTheme);

      $('#modalOverlay')?.addEventListener('click', e=>{ if(e.target===$('#modalOverlay')) closeModal(); });

      $('#workoutCalendar')?.addEventListener('click', e=>{
        const b = e.target.closest('.day-btn'); if(!b) return;
        $$('#workoutCalendar .day-btn').forEach(el=>el.classList.remove('active')); b.classList.add('active');
        workoutFilter = b.dataset.day; renderWorkout();
      });
      $('#studyTaskInput')?.addEventListener('keypress', e=>{ if(e.key==='Enter') addStudyTask(); });

      $$('.chart-tab').forEach(btn=>btn.addEventListener('click', function(){ switchChartTab(this.dataset.chart); }));
      const chartObserver = new MutationObserver(()=>{ if(document.querySelector('#panelChart.active')) renderChart(currentChartTab); });
      document.querySelectorAll('.mode-panel').forEach(p=>chartObserver.observe(p, { attributes:true, attributeFilter:['class'] }));

      initNominalInputEvents();

      window.addEventListener('popstate', e=>{
        if(e.state && e.state.mode){ currentMode = e.state.mode; localStorage.setItem(STORAGE.mode, currentMode); setActiveMode(currentMode, true); renderAll(); }
      });
      if(currentMode==='chart') setTimeout(()=>renderChart(currentChartTab), 200);
    } catch (e) {
      console.error('Init error:', e);
      document.body.style.overflow = '';
      document.getElementById('mainWrapper').style.opacity = '1';
    }
  }, 500);
}

document.addEventListener('DOMContentLoaded', init);