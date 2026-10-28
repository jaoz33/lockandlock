import { currentUser, watchAuth, doSignIn, doSignUp, doSignOut } from './auth.js';
import { listTasks, readTask, addTask, saveTask, removeTask } from './tasks.js';
import { initDrawer } from './editor/drawer.js';
import { Ads } from './ads.js';
import { detectPlaceholders } from './editor/placeholders.js';
import { applyPageSetup } from './editor/pageSetup.js';
import { parseSheet, previewRows, autoMap } from './sheet.js';
import { mergeRow } from './generate.js';
import { exportDocx, exportPdf, downloadBlob, downloadZip } from './export.js';
import { toast, confirm } from './ui.js';

window.ADS_ENABLED = false;

let state = { user: null, tasks: [], current: null, sheet: null, mapping: {}, placeholders: [], dirty: false };
const routes = { '#templates': renderTemplates, '#editor': renderEditor, '#privacy': renderPrivacy };

function navigate() {
  const hash = location.hash || '#templates';
  const fn = routes[hash.split('/')[0]] || renderTemplates;
  fn();
}

function renderTemplates() {
  document.getElementById('app').innerHTML = '<div id="template-list" class="container"></div>';
  loadTemplates();
}

async function loadTemplates() {
  const list = document.getElementById('template-list');
  list.innerHTML = '<div class="loader"></div>';
  try {
    state.tasks = await listTasks();
    list.innerHTML = state.tasks.map(t => cardHtml(t)).join('');
    bindTaskActions();
  } catch (e) {
    list.innerHTML = '<p class="error">Failed to load templates.</p>';
  }
}

function cardHtml(t) {
  return '<div class="card"><h3>' + escape(t.title) + '</h3><p>Status: ' + t.status + ' | Placeholders: ' + (t.placeholders?.length || 0) + ' | Updated: ' + new Date(t.updated_at).toLocaleDateString() + '</p><button data-open="' + t.id + '">Open</button>' + (state.user ? '<button data-delete="' + t.id + '">Delete</button>' : '<p class="hint">Sign in to save</p>') + '</div>';
}

function bindTaskActions() {
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openTask(b.dataset.open));
  document.querySelectorAll('[data-delete]').forEach(b => b.onclick = async () => { if (await confirm('Delete this template?')) { await removeTask(b.dataset.delete); loadTemplates(); } });
}

async function openTask(id) {
  const task = await readTask(id);
  state.current = task;
  state.placeholders = detectPlaceholders(task.template_html || '');
  location.hash = '#editor/' + id;
}

function renderEditor() {
  const id = location.hash.split('/')[1];
  const task = state.tasks.find(t => t.id === id) || state.current;
  if (!task) { location.hash = '#templates'; return; }
  state.current = task;
  document.getElementById('app').innerHTML = '<div class="editor-shell"><div class="editor-topbar"><button id="editor-close">Close</button><input id="editor-title" value="' + escape(task.title) + '" /><button id="editor-save">Save</button></div><div id="tool-drawer" class="tool-drawer"><div id="drawer-handle" class="drawer-handle" aria-expanded="false">Tools</div><div class="tool-panels"><div class="tool-group"><button onclick="window.Toolbar.toggleBold()">B</button><button onclick="window.Toolbar.toggleItalic()">I</button><button onclick="window.Toolbar.toggleUnderline()">U</button></div><div class="tool-group"><button onclick="window.Toolbar.insertPageBreak()">Page Break</button></div><div class="tool-group"><button onclick="window.Toolbar.insertPlaceholder(prompt('Placeholder name'))">Insert {{ }}</button></div></div></div><div id="editor" class="page-canvas" contenteditable="true">' + (task.template_html || '<p><br></p>') + '</div></div>';
  initDrawer();
  const editor = document.getElementById('editor');
  if (editor) editor.contentEditable = 'true';
  if (task.page_setup) applyPageSetup(task.page_setup);
  bindEditorActions();
}

function bindEditorActions() {
  const editor = document.getElementById('editor');
  if (!editor) return;
  editor.addEventListener('input', () => { state.dirty = true; state.placeholders = detectPlaceholders(editor.innerHTML); });
  document.getElementById('editor-save').onclick = async () => {
    const title = document.getElementById('editor-title').value.trim() || 'Untitled';
    await saveTask(state.current.id, { title, template_html: editor.innerHTML, placeholders: state.placeholders });
    state.dirty = false;
    toast('Saved');
  };
  document.getElementById('editor-close').onclick = async () => {
    if (state.dirty && !await confirm('Discard unsaved changes?')) return;
    location.hash = '#templates';
  };
  window.Toolbar = { toggleBold: () => document.execCommand('bold'), toggleItalic: () => document.execCommand('italic'), toggleUnderline: () => document.execCommand('underline'), insertPageBreak: () => document.execCommand('insertHTML', false, '<div class='page-break' style='break-after:page'></div><p><br></p>'), insertPlaceholder: (name) => { if (name) document.execCommand('insertText', false, '{{' + name + '}}'); } };
}

function renderPrivacy() {
  document.getElementById('app').innerHTML = '<div class="container"><h1>Privacy Notice</h1><p>ParseLock processes spreadsheets and generated documents entirely in your browser. Nothing leaves your device except templates and metadata you choose to save.</p></div>';
}

function escape(str) {
  return (str || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',''':'&#39;'}[m]));
}

function init() {
  watchAuth((user) => { state.user = user; renderAuth(); });
  currentUser().then(u => { state.user = u; renderAuth(); loadTemplates(); }).catch(() => {});
  Ads.init();
  window.addEventListener('hashchange', navigate);
  navigate();
}

function renderAuth() {
  const el = document.getElementById('auth-area');
  if (!el) return;
  if (state.user) {
    el.innerHTML = '<span>' + escape(state.user.email) + '</span><button id="sign-out">Sign out</button>';
    document.getElementById('sign-out').onclick = () => doSignOut().then(() => location.reload());
  } else {
    el.innerHTML = '<button id="sign-in">Sign in</button><button id="sign-up">Sign up</button>';
    document.getElementById('sign-in').onclick = () => { const email = prompt('Email'); const password = prompt('Password'); if (email && password) doSignIn(email, password).catch(() => toast('Sign in failed')); };
    document.getElementById('sign-up').onclick = () => { const email = prompt('Email'); const password = prompt('Password'); if (email && password) doSignUp(email, password).catch(() => toast('Sign up failed')); };
  }
}

export { init, state };
