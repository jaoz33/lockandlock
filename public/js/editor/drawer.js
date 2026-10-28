export function initDrawer() {
  const handle = document.getElementById('drawer-handle');
  const topBar = document.getElementById('drawer-top-bar');
  const drawer = document.getElementById('tool-drawer');
  if (!handle || !drawer) return;
  handle.addEventListener('click', () => {
    const open = drawer.classList.toggle('drawer-open');
    handle.setAttribute('aria-expanded', open);
  });
  if (topBar) {
    topBar.addEventListener('click', () => {
      drawer.classList.remove('drawer-open');
      handle.setAttribute('aria-expanded', 'false');
    });
  }
}
