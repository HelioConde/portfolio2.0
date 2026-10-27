const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const currentYear = document.getElementById('current-year');
const revealItems = document.querySelectorAll('.reveal');

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = ('IntersectionObserver' in window) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.14,
});

revealItems.forEach((item) => observer ? observer.observe(item) : item.classList.add('visible'));

if (menuToggle && siteNav) {
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { siteNav.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.focus(); } });
  document.addEventListener('click', (event) => { if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) { siteNav.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); } });
}

