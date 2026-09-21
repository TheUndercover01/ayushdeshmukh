/* Shared behaviour for every page: mobile nav toggle + BibTeX reveal/copy. */

document.addEventListener('DOMContentLoaded', () => {
  // --- mobile nav toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('nav.links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
  }

  // --- light / dark toggle (light is the default; choice is remembered) ---
  const themeBtn = document.querySelector('.theme-toggle');
  const root = document.documentElement;
  const syncThemeBtn = () => {
    const dark = root.dataset.theme === 'dark';
    themeBtn.textContent = dark ? '☀ Light mode' : '☾ Dark mode';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  if (themeBtn) {
    syncThemeBtn();
    themeBtn.addEventListener('click', () => {
      const dark = root.dataset.theme !== 'dark';
      if (dark) root.dataset.theme = 'dark'; else delete root.dataset.theme;
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
      syncThemeBtn();
    });
  }

  // --- BibTeX show/hide + copy ---
  document.querySelectorAll('[data-bibtex-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const box = document.getElementById(btn.dataset.bibtexToggle);
      if (box) box.classList.toggle('open');
    });
  });

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pre = btn.parentElement.querySelector('pre');
      if (!pre) return;
      try {
        await navigator.clipboard.writeText(pre.textContent.trim());
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 1400);
      } catch (e) {
        // clipboard API unavailable (e.g. non-secure context) — select text instead
        const range = document.createRange();
        range.selectNode(pre);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      }
    });
  });
});
