export const Ads = {
  init() {
    if (!window.ADS_ENABLED) return;
    // Placeholder: swap with real provider SDK here.
    document.querySelectorAll('[data-ad-slot]').forEach(el => {
      el.innerHTML = '<div class="ad-placeholder">Sponsored</div>';
    });
  },

  async showBanner(slotId) {
    if (!window.ADS_ENABLED) return;
    const slot = document.getElementById(slotId);
    if (!slot) return;
    slot.innerHTML = '<div class="ad-placeholder">Sponsored</div>';
  },

  async showVideoInterstitial(reason) {
    if (!window.ADS_ENABLED) return;
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'ad-overlay';
      overlay.innerHTML = '<div class="ad-video-placeholder">Sponsored video (simulated)</div>';
      document.body.appendChild(overlay);
      setTimeout(() => { overlay.remove(); resolve(); }, 2000);
    });
  }
};
