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
      document.dispatchEvent(new CustomEvent('themechange', {detail:{dark}}));
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

  // --- paper pages: play videos only while on screen (muted, so browsers allow it) ---
  const vids = document.querySelectorAll('video[data-autoplay]');
  if ('IntersectionObserver' in window) {
    // a pause the viewer makes themselves sticks: scrolling back won't restart it
    const vio = new IntersectionObserver(entries => entries.forEach(e => {
      const v = e.target;
      v.dataset.visible = e.isIntersecting ? '1' : '';
      if (e.isIntersecting) { if (!v.dataset.userPaused) v.play().catch(() => {}); }
      else if (!v.paused) { v.dataset.autoPausing = '1'; v.pause(); }
    }), { threshold: 0.35 });
    vids.forEach(v => {
      v.addEventListener('pause', () => {
        if (v.dataset.autoPausing) delete v.dataset.autoPausing;
        else if (v.dataset.visible && !v.ended) v.dataset.userPaused = '1';
      });
      v.addEventListener('play', () => { delete v.dataset.userPaused; });
      vio.observe(v);
    });
  } else {
    vids.forEach(v => v.play().catch(() => {}));
  }

  // --- paper pages: count stat numbers up once they scroll into view ---
  const nums = document.querySelectorAll('[data-count]');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (nums.length && !still && 'IntersectionObserver' in window) {
    const fmt = (el, x) => {
      const target = el.dataset.count, dec = (target.split('.')[1] || '').length;
      el.textContent = x.toFixed(dec) + (el.dataset.suffix || '');
    };
    const nio = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      nio.unobserve(e.target);
      const el = e.target, end = parseFloat(el.dataset.count), t0 = performance.now(), dur = 1600;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur);
        fmt(el, end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    nums.forEach(el => { fmt(el, 0); nio.observe(el); });
  }

  // --- paper pages: highlight the quick-index entry for the section on screen ---
  const tocLinks = [...document.querySelectorAll('.paper-toc a[href^="#"]')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const tio = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      tocLinks.forEach(a => a.classList.remove('active'));
      byId.get(e.target.id)?.classList.add('active');
    }), { rootMargin: '-40% 0px -55% 0px' });
    byId.forEach((a, id) => { const el = document.getElementById(id); if (el) tio.observe(el); });
  }
});
