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
