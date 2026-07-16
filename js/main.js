/* ============================================================
   FreshSip Café – Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. THEME (LIGHT / DARK) TOGGLE
  ---------------------------------------------------------- */
  const THEME_KEY = 'freshsip_theme';
  const DIR_KEY   = 'freshsip_dir';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      el.className = theme === 'dark'
        ? el.dataset.iconDark || 'bi bi-sun-fill'
        : el.dataset.iconLight || 'bi bi-moon-fill';
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  }

  /* ----------------------------------------------------------
     2. RTL / LTR TOGGLE
  ---------------------------------------------------------- */
  function applyDir(dir) {
    document.documentElement.setAttribute('dir', dir);
    document.body.setAttribute('dir', dir);
    localStorage.setItem(DIR_KEY, dir);
    document.querySelectorAll('[data-rtl-icon]').forEach(el => {
      el.className = dir === 'rtl'
        ? 'bi bi-text-left'
        : 'bi bi-text-right';
    });
    document.querySelectorAll('[data-rtl-label]').forEach(el => {
      el.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    });
  }

  function toggleDir() {
    const current = document.documentElement.getAttribute('dir') || 'ltr';
    applyDir(current === 'ltr' ? 'rtl' : 'ltr');
  }

  function initDir() {
    const saved = localStorage.getItem(DIR_KEY) || 'ltr';
    applyDir(saved);
  }

  /* ----------------------------------------------------------
     3. ACTIVE NAV LINK
  ---------------------------------------------------------- */
  function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop();
      link.classList.remove('active');
      if (linkPage === currentPage ||
          (currentPage === '' && linkPage === 'index.html') ||
          (currentPage === 'index.html' && href === 'index.html') ||
          (currentPage === linkPage)) {
        link.classList.add('active');
      }
    });
  }

  /* ----------------------------------------------------------
     4. STICKY NAVBAR + SCROLL EFFECTS
  ---------------------------------------------------------- */
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     5. SCROLL TO TOP BUTTON
  ---------------------------------------------------------- */
  function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     6. AOS ANIMATIONS
  ---------------------------------------------------------- */
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-out-cubic',
        offset: 60,
        delay: 0
      });
    }
  }

  /* ----------------------------------------------------------
     8. COUNTER ANIMATION
  ---------------------------------------------------------- */
  function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.counter);
          const suffix = el.dataset.suffix || '';
          const duration = 1800;
          const step = target / (duration / 16);
          let current = 0;
          const isDecimal = target % 1 !== 0;

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
          }, 16);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  /* ----------------------------------------------------------
     9. GALLERY LIGHTBOX
  ---------------------------------------------------------- */
  function initGalleryLightbox() {
    const overlay = document.getElementById('galleryLightbox');
    if (!overlay) return;

    const imgEl  = overlay.querySelector('.lightbox-img');
    const closeBtn = overlay.querySelector('.lightbox-close');

    document.querySelectorAll('[data-lightbox]').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.querySelector('img')?.src || item.dataset.src;
        if (imgEl && src) {
          imgEl.src = src;
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ----------------------------------------------------------
     10. PASSWORD VISIBILITY TOGGLE
  ---------------------------------------------------------- */
  function initPasswordToggles() {
    document.querySelectorAll('[data-pw-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const inputId = btn.dataset.pwToggle;
        const input = document.getElementById(inputId);
        if (!input) return;
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        btn.querySelector('i').className = isText
          ? 'bi bi-eye-slash'
          : 'bi bi-eye';
      });
    });
  }

  /* ----------------------------------------------------------
     11. PASSWORD STRENGTH METER
  ---------------------------------------------------------- */
  function initPasswordStrength() {
    const pwInput = document.getElementById('registerPassword');
    const fill    = document.querySelector('.strength-fill');
    const label   = document.querySelector('.strength-label');
    if (!pwInput || !fill || !label) return;

    pwInput.addEventListener('input', () => {
      const val = pwInput.value;
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const levels = [
        { pct: '0%',   color: 'transparent', text: '' },
        { pct: '25%',  color: '#E74C3C',     text: 'Weak' },
        { pct: '50%',  color: '#F39C12',     text: 'Fair' },
        { pct: '75%',  color: '#F1C40F',     text: 'Good' },
        { pct: '100%', color: '#2ECC71',     text: 'Strong' }
      ];

      const lvl = levels[score];
      fill.style.width = lvl.pct;
      fill.style.background = lvl.color;
      label.textContent = lvl.text;
      label.style.color = lvl.color;
    });
  }

  /* ----------------------------------------------------------
     12. SMOOTH SCROLL FOR ANCHOR LINKS
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = document.querySelector('.navbar')?.offsetHeight || 72;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ----------------------------------------------------------
     13. NAVBAR COLLAPSE ON MOBILE LINK CLICK
  ---------------------------------------------------------- */
  function initMobileNavClose() {
    const toggler = document.querySelector('.navbar-toggler');
    const collapseEl = document.getElementById('navbarMain');
    if (!collapseEl) return;
    collapseEl.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
        if (bsCollapse) bsCollapse.hide();
      });
    });
  }

  /* ----------------------------------------------------------
     14. FORM SUBMISSION (Demo – prevent default)
  ---------------------------------------------------------- */
  function initForms() {
    document.querySelectorAll('form[data-demo]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        if (btn) {
          const original = btn.textContent;
          btn.textContent = 'Sending...';
          btn.disabled = true;
          setTimeout(() => {
            btn.textContent = 'Sent Successfully!';
            btn.style.background = '#27AE60';
            setTimeout(() => {
              btn.textContent = original;
              btn.disabled = false;
              btn.style.background = '';
              form.reset();
            }, 2500);
          }, 1200);
        }
      });
    });
  }

  /* ----------------------------------------------------------
     15. NEWSLETTER FORM
  ---------------------------------------------------------- */
  function initNewsletter() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const btn   = form.querySelector('button');
        if (!input || !btn) return;
        btn.textContent = 'Subscribed!';
        btn.style.background = '#27AE60';
        input.value = '';
        setTimeout(() => {
          btn.textContent = 'Subscribe';
          btn.style.background = '';
        }, 3000);
      });
    });
  }

  /* ----------------------------------------------------------
     16. EVENT LISTENERS FOR BUTTONS
  ---------------------------------------------------------- */
  function bindToggleButtons() {
    document.querySelectorAll('[data-toggle-theme]').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
    document.querySelectorAll('[data-toggle-rtl]').forEach(btn => {
      btn.addEventListener('click', toggleDir);
    });
  }

  function initAuthControlsAutoHide() {
    const controls = document.querySelector('.auth-top-controls');
    const card = document.querySelector('.auth-single-card');
    if (!controls) return;

    const updateControls = () => {
      if (!card) return;
      const controlsRect = controls.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const safetyGap = 12;
      const touchesControls = cardRect.top <= controlsRect.bottom + safetyGap
        && cardRect.bottom >= controlsRect.top - safetyGap;

      controls.classList.toggle('is-hidden', touchesControls);
    };

    updateControls();
    window.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  function init() {
    initTheme();
    initDir();
    setActiveNav();
    initNavbar();
    initScrollTop();
    initAOS();
    animateCounters();
    initGalleryLightbox();
    initPasswordToggles();
    initPasswordStrength();
    initSmoothScroll();
    initMobileNavClose();
    initForms();
    initNewsletter();
    bindToggleButtons();
    initAuthControlsAutoHide();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
