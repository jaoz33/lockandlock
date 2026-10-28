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
  clearAutosave();
  document.getElementById('app').innerHTML = '<div class="container"><div class="toolbar"><button id="new-template" class="btn btn-primary">New Template</button></div><div id="template-list"></div></div>';
  document.getElementById('new-template').onclick = createNewTemplate;
  loadTemplates();
}

async function createNewTemplate() {
  const task = await addTask({ title: 'Untitled template', template_html: '<p><br></p>', placeholders: [], status: 'draft' });
  state.tasks.unshift(task);
  openTask(task.id);
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
  document.getElementById('app').innerHTML = '<div class="editor-shell"><div class="editor-topbar"><button id="editor-close" class="btn">Close</button><input id="editor-title" class="input" value="' + escape(task.title) + '" /><button id="editor-save" class="btn btn-primary">Save</button><button id="editor-generate" class="btn btn-accent">Generate</button></div><div id="tool-drawer" class="tool-drawer"><div id="drawer-handle" class="drawer-handle" aria-expanded="false">Tools</div><div class="tool-panels"><div class="tool-group"><button onclick="window.Toolbar.toggleBold()" title="Bold">B</button><button onclick="window.Toolbar.toggleItalic()" title="Italic">I</button><button onclick="window.Toolbar.toggleUnderline()" title="Underline">U</button><button onclick="window.Toolbar.toggleStrike()" title="Strikethrough">S</button></div><div class="tool-group"><button onclick="window.Toolbar.insertPageBreak()">Page Break</button><button onclick="window.Toolbar.insertTable()">Table</button></div><div class="tool-group"><button onclick="window.Toolbar.insertPlaceholder()">Insert Placeholder</button></div></div></div><div id="editor" class="page-canvas" contenteditable="true"></div><div id="sheet-panel" class="sheet-panel" hidden><div class="sheet-toolbar"><input type="file" id="sheet-input" accept=".csv,.xlsx,.xls" /><button id="preview-sheet" class="btn">Preview</button><select id="filename-column"><option value="">Filename column...</option></select><button id="download-docx" class="btn">DOCX</button><button id="download-pdf" class="btn">PDF</button></div><div id="sheet-preview" class="sheet-preview"></div></div></div>';
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
    clearAutosave();
    location.hash = '#templates';
  };
  document.getElementById('editor-generate').onclick = () => { const panel = document.getElementById('sheet-panel'); panel.hidden = !panel.hidden; };
  document.getElementById('preview-sheet').onclick = previewSheet;
  document.getElementById('download-docx').onclick = downloadDocx;
  document.getElementById('download-pdf').onclick = downloadPdf;
  window.Toolbar = { toggleBold: () => document.execCommand('bold'), toggleItalic: () => document.execCommand('italic'), toggleUnderline: () => document.execCommand('underline'), toggleStrike: () => document.execCommand('strikeThrough'), insertPageBreak: () => document.execCommand('insertHTML', false, "<div class='page-break' style='break-after:page'></div><p><br></p>"), insertTable: () => { const rows = parseInt(prompt('Rows', '3')) || 3; const cols = parseInt(prompt('Columns', '3')) || 3; const html = '<table style="width:100%;border-collapse:collapse"><tbody>' + Array.from({length: rows}, () => '<tr>' + Array.from({length: cols}, () => '<td style="border:1px solid #ccc;padding:6px"><br></td>').join('') + '</tr>').join('') + '</tbody></table><p><br></p>'; document.execCommand('insertHTML', false, html); }, insertPlaceholder: () => { const name = prompt('Placeholder name'); if (name) document.execCommand('insertText', false, '{{' + name + '}}'); } };
}

async function previewSheet() {
  const input = document.getElementById('sheet-input');
  const file = input.files[0];
  if (!file) { toast('Choose a file first'); return; }
  try {
    const rows = await parseSheet(file);
    state.sheet = rows;
    const preview = previewRows(rows, 5);
    const headers = rows.length ? Object.keys(rows[0]) : [];
    state.mapping = autoMap(state.placeholders, headers);
    const out = document.getElementById('sheet-preview');
    out.innerHTML = '<pre>' + escape(JSON.stringify(preview, null, 2)) + '</pre><p>Headers: ' + headers.join(', ') + '</p><p>Mapping: ' + escape(JSON.stringify(state.mapping)) + '</p>';
    const select = document.getElementById('filename-column');
    select.innerHTML = '<option value="">Filename column...</option>' + headers.map(h => '<option value="' + escape(h) + '">' + escape(h) + '</option>').join('');
  } catch (e) {
    toast('Failed to parse sheet: ' + e.message);
  }
}

async function downloadDocx() {
  if (!state.sheet?.length) { toast('Upload a sheet first'); return; }
  const col = document.getElementById('filename-column').value;
  const editor = document.getElementById('editor');
  for (let i = 0; i < state.sheet.length; i++) {
    const row = state.sheet[i];
    const html = mergeRow(editor.innerHTML, row, state.mapping, state.placeholders);
    const name = (col ? row[col] : ('row_' + (i + 1))) + '.docx';
    await exportDocx(html, name);
  }
  toast('Export complete');
}

async function downloadPdf() {
  if (!state.sheet?.length) { toast('Upload a sheet first'); return; }
  const col = document.getElementById('filename-column').value;
  const editor = document.getElementById('editor');
  for (let i = 0; i < state.sheet.length; i++) {
    const row = state.sheet[i];
    const html = mergeRow(editor.innerHTML, row, state.mapping, state.placeholders);
    const name = (col ? row[col] : ('row_' + (i + 1))) + '.pdf';
    await exportPdf(html, name);
  }
  toast('Export complete');
}

function startAutosave() {
  clearAutosave();
  if (!state.user) return;
  state.autosaveTimer = setInterval(async () => {
    if (!state.dirty || !state.current) return;
    const editor = document.getElementById('editor');
    if (!editor) return;
    const title = document.getElementById('editor-title').value.trim() || 'Untitled';
    await saveTask(state.current.id, { title, template_html: editor.innerHTML, placeholders: state.placeholders });
    state.dirty = false;
    toast('Autosaved');
  }, 30000);
}

function clearAutosave() {
  if (state.autosaveTimer) { clearInterval(state.autosaveTimer); state.autosaveTimer = null; }
}

function renderPrivacy() {
  document.getElementById('app').innerHTML = '<div class="container"><h1>Privacy Notice</h1><p>ParseLock processes spreadsheets and generated documents entirely in your browser. Nothing leaves your device except templates and metadata you choose to save.</p></div>';
}

function escape(str) {
  return (str || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
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
