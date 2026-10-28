export function toast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('toast-exit'); setTimeout(() => el.remove(), 300); }, 3000);
}

export function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

export function showLoader(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

export function hideLoader(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

export function showModal(id) {
  const el = document.getElementById(id);
  if (el) { el.hidden = false; el.classList.add('modal-open'); }
}

export function hideModal(id) {
  const el = document.getElementById(id);
  if (el) { el.hidden = true; el.classList.remove('modal-open'); }
}

export function confirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const msg = document.getElementById('confirm-message');
    const btnOk = document.getElementById('confirm-ok');
    const btnCancel = document.getElementById('confirm-cancel');
    msg.textContent = message;
    showModal('confirm-modal');
    const cleanup = () => { btnOk.removeEventListener('click', onOk); btnCancel.removeEventListener('click', onCancel); hideModal('confirm-modal'); };
    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };
    btnOk.addEventListener('click', onOk);
    btnCancel.addEventListener('click', onCancel);
  });
}
