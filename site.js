(() => {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  menuBtn?.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  const langBtn = document.getElementById('languageBtn');
  const langMenu = document.getElementById('languageMenu');
  langBtn?.addEventListener('click', () => {
    const open = langMenu.classList.toggle('open');
    langBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (langMenu && langBtn && !langMenu.contains(e.target) && !langBtn.contains(e.target)) {
      langMenu.classList.remove('open'); langBtn.setAttribute('aria-expanded','false');
    }
  });

  const access = document.getElementById('accessibilityBtn');
  access?.addEventListener('click', () => document.body.classList.toggle('large-text'));

  document.querySelectorAll('.reveal').forEach(el => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:.12});
    observer.observe(el);
  });
})();
