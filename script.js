(() => {
  const STORAGE = {
    theme: 'ga-theme',
    size: 'ga-size',
  };

  // ---- Theme (dark/light) ----
  const themeBtn = document.getElementById('toggle-theme');
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      themeBtn.setAttribute('aria-pressed', 'true');
      themeBtn.textContent = '☀ Light';
    } else {
      root.removeAttribute('data-theme');
      themeBtn.setAttribute('aria-pressed', 'false');
      themeBtn.textContent = '☾ Dark';
    }
  }

  const savedTheme = localStorage.getItem(STORAGE.theme);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme ?? (prefersDark ? 'dark' : 'light'));

  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE.theme, next);
  });

  // ---- Font size ----
  const SIZES = [16, 18, 20, 22, 24];
  let sizeIdx = parseInt(localStorage.getItem(STORAGE.size) ?? '1', 10);
  if (isNaN(sizeIdx) || sizeIdx < 0 || sizeIdx >= SIZES.length) sizeIdx = 1;

  function applySize() {
    document.body.style.setProperty('--base-size', SIZES[sizeIdx] + 'px');
    localStorage.setItem(STORAGE.size, String(sizeIdx));
  }
  applySize();

  document.getElementById('size-down').addEventListener('click', () => {
    sizeIdx = Math.max(0, sizeIdx - 1);
    applySize();
  });
  document.getElementById('size-up').addEventListener('click', () => {
    sizeIdx = Math.min(SIZES.length - 1, sizeIdx + 1);
    applySize();
  });

  // ---- Scroll progress + back-to-top ----
  const progress = document.getElementById('progress');
  const toTop = document.getElementById('to-top');

  function onScroll() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    progress.style.width = pct + '%';
    toTop.classList.toggle('visible', scrolled > 400);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Clean up Pandoc's inline image dimensions (overridden by CSS but tidier) ----
  document.querySelectorAll('.content img').forEach(img => {
    img.removeAttribute('width');
    img.removeAttribute('height');
    img.style.cssText = '';
    img.loading = 'lazy';
    img.alt = img.alt || 'Shri Ganapati';
  });

  // ---- Tag Devanagari-heavy paragraphs with lang attribute for assistive tech ----
  const devRe = /[ऀ-ॿ]/;
  document.querySelectorAll('.content p, .content li').forEach(el => {
    if (devRe.test(el.textContent)) el.setAttribute('lang', 'sa');
  });
})();
