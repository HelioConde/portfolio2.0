// Progressive enhancements for the static portfolio.
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const currentYear = document.getElementById('current-year');
const revealItems = document.querySelectorAll('.reveal');
const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('.project-card[data-category]');
const projectCount = document.getElementById('project-count');

if (currentYear) currentYear.textContent = String(new Date().getFullYear());

if (menuToggle && siteNav) {
  const setMenuOpen = (open) => {
    siteNav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) setMenuOpen(false);
  });
}

if (filterButtons.length && projectCards.length) {
  const applyFilter = (filter) => {
    let count = 0;

    projectCards.forEach((card) => {
      const visible = filter === 'todos' || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible) count++;
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (projectCount) {
      projectCount.textContent = count === 1 ? '1 projeto' : `${count} projetos`;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.filter));
  });
}

// Image preview: the thumbnail links continue working without JavaScript.
const previewDialog = document.getElementById('project-preview-dialog');
const previewTriggers = Array.from(document.querySelectorAll('.preview-trigger'));
const previewImage = document.getElementById('preview-dialog-image');
const previewTitle = document.getElementById('preview-dialog-title');
const previewDescription = document.getElementById('preview-dialog-description');
const previewOriginal = document.getElementById('preview-original');
const previewCounter = document.getElementById('preview-counter');
const previewClose = document.getElementById('preview-close');
const previewPrevious = document.getElementById('preview-previous');
const previewNext = document.getElementById('preview-next');

if (previewDialog && typeof previewDialog.showModal === 'function' &&
    previewImage && previewTitle && previewDescription && previewOriginal) {
  let activeTrigger = null;
  let previewList = [];

  const displayPreview = (trigger) => {
    const card = trigger.closest('.project-card');
    const thumbnail = trigger.querySelector('img');
    if (!card || !thumbnail) return;
    activeTrigger = trigger;

    const projectTitle = card.querySelector('h3')?.textContent.trim() || 'Projeto';
    const imageCaption = card.querySelector('.screen-note')?.textContent.trim() || 'Imagem original do projeto';
    previewTitle.textContent = projectTitle;
    previewDescription.textContent = imageCaption + '. A imagem é mostrada sem cortes.';
    previewImage.src = trigger.href;
    previewImage.alt = thumbnail.alt;
    previewOriginal.href = trigger.href;
    const position = previewList.indexOf(trigger);
    previewCounter.textContent = (position + 1) + ' de ' + previewList.length;
    previewPrevious.disabled = previewNext.disabled = previewList.length < 2;
  };

  const movePreview = (step) => {
    if (!previewDialog.open || !previewList.length) return;
    const index = previewList.indexOf(activeTrigger);
    const next = (index + step + previewList.length) % previewList.length;
    displayPreview(previewList[next]);
  };

  previewTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      // Allow browser modifier keys to open the original file in another tab.
      if (event.button !== 0 || event.ctrlKey || event.metaKey ||
          event.shiftKey || event.altKey) return;
      previewList = previewTriggers.filter((link) => !link.closest('.project-card')?.hidden);
      if (!previewList.includes(trigger)) return;
      event.preventDefault();
      displayPreview(trigger);
      previewDialog.showModal();
      document.body.classList.add('preview-open');
      previewClose.focus();
    });
  });

  previewClose.addEventListener('click', () => previewDialog.close());
  previewPrevious.addEventListener('click', () => movePreview(-1));
  previewNext.addEventListener('click', () => movePreview(1));
  previewDialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); movePreview(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); movePreview(-1); }
  });
  previewDialog.addEventListener('click', (event) => {
    if (event.target === previewDialog) previewDialog.close();
  });
  previewDialog.addEventListener('close', () => {
    document.body.classList.remove('preview-open');
    previewImage.removeAttribute('src');
    // Return keyboard focus to the image selected in the gallery.
    activeTrigger?.focus({ preventScroll: true });
  });
}

const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!('IntersectionObserver' in window) || prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -3% 0px', threshold: 0.06 });

  revealItems.forEach((item) => observer.observe(item));
}
