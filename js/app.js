/* ==============================================
   MY DASHBOARD — app.js
   Vanilla JS | No frameworks | LocalStorage
   ============================================== */

// ──────────────────────────────────────────────
// SECTION 0: SETTINGS — Theme, Name, Duration
// (runs before everything else so values are
//  available to all other sections immediately)
// ──────────────────────────────────────────────

const SETTINGS_KEY = 'dashboard_settings';

/** Load persisted settings or return defaults. */
function loadSettings() {
  try {
    return Object.assign(
      { theme: 'dark', name: '', timerMinutes: 25 },
      JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
    );
  } catch {
    return { theme: 'dark', name: '', timerMinutes: 25 };
  }
}

/** Persist settings object to localStorage. */
function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

let settings = loadSettings();

/* ── DOM references for settings panel ── */
const btnThemeHeader   = document.getElementById('btn-theme');
const themeIconEl      = document.getElementById('theme-icon');
const btnSettings      = document.getElementById('btn-settings');
const settingsOverlay  = document.getElementById('settings-overlay');
const settingsPanel    = document.getElementById('settings-panel');
const btnCloseSettings = document.getElementById('btn-close-settings');

const settingsNameInput = document.getElementById('settings-name');
const btnSaveName       = document.getElementById('btn-save-name');

const settingsDurationInput = document.getElementById('settings-duration');
const btnSaveDuration       = document.getElementById('btn-save-duration');
const durationDisplay       = document.getElementById('duration-display');

const btnThemeDark  = document.getElementById('btn-theme-dark');
const btnThemeLight = document.getElementById('btn-theme-light');

/* ─── Theme ─── */

/**
 * Apply theme to <body> and sync all related UI.
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light');
    themeIconEl.textContent = '☀️';
    btnThemeDark.classList.remove('active');
    btnThemeLight.classList.add('active');
  } else {
    document.body.classList.remove('light');
    themeIconEl.textContent = '🌙';
    btnThemeDark.classList.add('active');
    btnThemeLight.classList.remove('active');
  }
}

function toggleTheme() {
  settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
  applyTheme(settings.theme);
  saveSettings(settings);
}

function setTheme(theme) {
  settings.theme = theme;
  applyTheme(theme);
  saveSettings(settings);
}

// Apply immediately on load (before paint)
applyTheme(settings.theme);

btnThemeHeader.addEventListener('click', toggleTheme);
btnThemeDark.addEventListener('click',  () => setTheme('dark'));
btnThemeLight.addEventListener('click', () => setTheme('light'));

/* ─── Settings panel open / close ─── */

function openSettings() {
  // Pre-fill current values
  settingsNameInput.value     = settings.name;
  settingsDurationInput.value = settings.timerMinutes;
  durationDisplay.textContent = `Current: ${settings.timerMinutes} min`;

  settingsPanel.classList.add('active');
  settingsOverlay.classList.add('active');
  settingsPanel.setAttribute('aria-hidden', 'false');
  settingsNameInput.focus();
}

function closeSettings() {
  settingsPanel.classList.remove('active');
  settingsOverlay.classList.remove('active');
  settingsPanel.setAttribute('aria-hidden', 'true');
}

btnSettings.addEventListener('click',      openSettings);
btnCloseSettings.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click',  closeSettings);

// Close panel with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSettings();
});

/* ─── Save custom name ─── */

function saveName() {
  const name = settingsNameInput.value.trim();
  settings.name = name;
  saveSettings(settings);
  // Update greeting immediately
  updateGreeting();
  // Visual feedback
  showSaved(btnSaveName);
}

btnSaveName.addEventListener('click', saveName);
settingsNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveName();
});

/* ─── Save custom Pomodoro duration ─── */

function saveDuration() {
  const raw = parseInt(settingsDurationInput.value, 10);
  if (isNaN(raw) || raw < 1 || raw > 120) {
    settingsDurationInput.style.borderColor = 'var(--danger)';
    setTimeout(() => (settingsDurationInput.style.borderColor = ''), 1500);
    return;
  }
  settings.timerMinutes = raw;
  saveSettings(settings);
  durationDisplay.textContent = `Current: ${raw} min`;
  // Reset the timer to the new duration
  resetTimer();
  showSaved(btnSaveDuration);
}

btnSaveDuration.addEventListener('click', saveDuration);
settingsDurationInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveDuration();
});

/** Briefly swap button text to "✓ Saved" as tactile feedback. */
function showSaved(btn) {
  const original = btn.textContent;
  btn.textContent = '✓ Saved';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 1200);
}


// ──────────────────────────────────────────────
// SECTION 1: GREETING & CLOCK
// ──────────────────────────────────────────────

const greetingEl = document.getElementById('greeting');
const dateEl     = document.getElementById('current-date');
const clockEl    = document.getElementById('clock');

/**
 * Returns a greeting string based on the current hour.
 * Includes the user's name if one is set.
 */
function getGreeting(hour) {
  const name = settings.name ? `, ${settings.name}` : '';
  if (hour >= 5  && hour < 12) return `Good Morning${name}! ☀️`;
  if (hour >= 12 && hour < 17) return `Good Afternoon${name}! 🌤️`;
  if (hour >= 17 && hour < 21) return `Good Evening${name}! 🌆`;
  return `Good Night${name}! 🌙`;
}

/** Update only the greeting text (called after name is saved). */
function updateGreeting() {
  const hour = new Date().getHours();
  greetingEl.textContent = getGreeting(hour);
}

/**
 * Formats a Date into "Thursday, September 10, 2026".
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

/** Updates clock, greeting, and date every second. */
function updateClock() {
  const now  = new Date();
  const hour = now.getHours();
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');

  clockEl.textContent     = `${String(hour).padStart(2, '0')}:${mins}:${secs}`;
  greetingEl.textContent  = getGreeting(hour);
  dateEl.textContent      = formatDate(now);
}

updateClock();
setInterval(updateClock, 1000);


// ──────────────────────────────────────────────
// SECTION 2: FOCUS TIMER
// ──────────────────────────────────────────────

const timerDisplay = document.getElementById('timer-display');
const btnStart     = document.getElementById('btn-start');
const btnStop      = document.getElementById('btn-stop');
const btnReset     = document.getElementById('btn-reset');

// Duration is read from settings so it survives page reloads
let timerDuration = settings.timerMinutes * 60; // seconds
let timerSeconds  = timerDuration;
let timerInterval = null;
let timerRunning  = false;

/**
 * Converts total seconds into MM:SS string.
 */
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timerSeconds);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerDisplay.classList.add('running');

  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.classList.remove('running');
      timerDisplay.textContent = '00:00';
      alert('⏰ Focus session complete! Take a short break.');
      return;
    }
    timerSeconds--;
    renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerDisplay.classList.remove('running');
}

function resetTimer() {
  stopTimer();
  // Always use latest saved duration
  timerDuration = settings.timerMinutes * 60;
  timerSeconds  = timerDuration;
  renderTimer();
}

btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click',  stopTimer);
btnReset.addEventListener('click', resetTimer);

renderTimer();


// ──────────────────────────────────────────────
// SECTION 3: TO-DO LIST
// ──────────────────────────────────────────────

const TODO_KEY      = 'dashboard_todos';
const todoInput     = document.getElementById('todo-input');
const btnAddTodo    = document.getElementById('btn-add-todo');
const todoListEl    = document.getElementById('todo-list');
const todoEmptyEl   = document.getElementById('todo-empty');

const modalOverlay  = document.getElementById('modal-overlay');
const editInput     = document.getElementById('edit-input');
const btnSaveEdit   = document.getElementById('btn-save-edit');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

let todos     = loadTodos();
let editingId = null;

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Sanitise text to prevent XSS when using innerHTML. */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTodos() {
  todoListEl.innerHTML = '';
  todoEmptyEl.style.display = todos.length > 0 ? 'none' : 'block';

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item${todo.done ? ' done' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" aria-label="Mark task as done" ${todo.done ? 'checked' : ''} />
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button class="btn btn-edit"   aria-label="Edit task">✏️</button>
        <button class="btn btn-danger" aria-label="Delete task">🗑️</button>
      </div>
    `;

    li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodoDone(todo.id));
    li.querySelector('.btn-edit').addEventListener('click',       () => openEditModal(todo.id));
    li.querySelector('.btn-danger').addEventListener('click',     () => deleteTodo(todo.id));

    todoListEl.appendChild(li);
  });
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
  todos.push({ id: generateId(), text, done: false });
  saveTodos();
  renderTodos();
  todoInput.value = '';
  todoInput.focus();
}

function toggleTodoDone(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.done = !todo.done; saveTodos(); renderTodos(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function openEditModal(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  editingId = id;
  editInput.value = todo.text;
  modalOverlay.classList.add('active');
  editInput.focus();
}

function saveEdit() {
  const text = editInput.value.trim();
  if (!text) return;
  const todo = todos.find(t => t.id === editingId);
  if (todo) { todo.text = text; saveTodos(); renderTodos(); }
  closeModal();
}

function closeModal() {
  modalOverlay.classList.remove('active');
  editingId = null;
  editInput.value = '';
}

btnAddTodo.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });
btnSaveEdit.addEventListener('click',   saveEdit);
btnCancelEdit.addEventListener('click', closeModal);
editInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveEdit(); });
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

renderTodos();


// ──────────────────────────────────────────────
// SECTION 4: QUICK LINKS
// ──────────────────────────────────────────────

const LINKS_KEY     = 'dashboard_links';
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput  = document.getElementById('link-url-input');
const btnAddLink    = document.getElementById('btn-add-link');
const linksGrid     = document.getElementById('links-grid');
const linksEmptyEl  = document.getElementById('links-empty');

let links = loadLinks();

function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem(LINKS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLinks() {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

function getFaviconUrl(url) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

function renderLinks() {
  linksGrid.innerHTML = '';
  linksEmptyEl.style.display = links.length > 0 ? 'none' : 'block';

  links.forEach(link => {
    const wrapper = document.createElement('div');
    wrapper.className = 'link-btn';

    const favicon = getFaviconUrl(link.url);
    wrapper.innerHTML = `
      ${favicon ? `<img src="${favicon}" class="link-favicon" alt="" onerror="this.style.display='none'" />` : ''}
      <span>${escapeHtml(link.name)}</span>
      <button class="link-delete" title="Remove link" aria-label="Remove ${escapeHtml(link.name)}">✕</button>
    `;

    wrapper.addEventListener('click', e => {
      if (e.target.classList.contains('link-delete')) return;
      window.open(link.url, '_blank', 'noopener,noreferrer');
    });

    wrapper.querySelector('.link-delete').addEventListener('click', () => deleteLink(link.id));

    linksGrid.appendChild(wrapper);
  });
}

function normaliseUrl(raw) {
  let url = raw.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { new URL(url); return url; } catch { return null; }
}

function addLink() {
  const name = linkNameInput.value.trim();
  const url  = normaliseUrl(linkUrlInput.value);

  if (!name) {
    linkNameInput.focus();
    linkNameInput.style.borderColor = 'var(--danger)';
    setTimeout(() => (linkNameInput.style.borderColor = ''), 1500);
    return;
  }
  if (!url) {
    linkUrlInput.focus();
    linkUrlInput.style.borderColor = 'var(--danger)';
    setTimeout(() => (linkUrlInput.style.borderColor = ''), 1500);
    return;
  }

  links.push({ id: generateId(), name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
}

function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

btnAddLink.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

renderLinks();
