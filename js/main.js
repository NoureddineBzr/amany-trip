/* ═══════════════════════════════════════════════════════════
   AMANY TRIP — main.js
═══════════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════ */
let currentLang = localStorage.getItem('amanyLang') || 'fr';

/* ══════════════════════════════════════════════════════════
   LANGUAGE SYSTEM
   1. Switch all [data-fr]/[data-ar] text content
   2. Toggle dir="rtl" on <html>
   3. Switch font-family Poppins ↔ Tajawal (via rtl.css)
   4. Save preference in localStorage
   5. Button shows current: "FR | العربية" (active highlighted)
══════════════════════════════════════════════════════════ */
function applyLanguage(lang) {
  currentLang = lang;

  // 4. Persist
  localStorage.setItem('amanyLang', lang);

  const html = document.documentElement;
  const rtlSheet = document.getElementById('rtl-stylesheet');

  // 2. dir + lang attribute
  if (lang === 'ar') {
    html.setAttribute('lang', 'ar');
    html.setAttribute('dir', 'rtl');
    rtlSheet.disabled = false;
  } else {
    html.setAttribute('lang', 'fr');
    html.setAttribute('dir', 'ltr');
    rtlSheet.disabled = true;
  }

  // 1. Switch all translatable elements
  document.querySelectorAll('[data-fr], [data-ar]').forEach(el => {
    let val = el.getAttribute(`data-${lang}`);
    if (val === null) return;
    
    // As requested: dynamically swap arrows based on language
    if (lang === 'ar' && val.includes('→')) val = val.replace(/→/g, '←');
    if (lang === 'fr' && val.includes('←')) val = val.replace(/←/g, '→');

    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      el.placeholder = val;
    } else if (tag === 'OPTION') {
      el.textContent = val;
    } else {
      el.textContent = val;
    }
  });

  // 5. Toggle button labels + highlight active
  const frEl  = document.querySelector('.lang-fr');
  const arEl  = document.querySelector('.lang-ar');
  if (frEl && arEl) {
    frEl.textContent = 'FR';
    arEl.textContent = 'العربية';
    frEl.classList.toggle('active', lang === 'fr');
    arEl.classList.toggle('active', lang === 'ar');
  }

  // Page title
  document.title = lang === 'ar'
    ? 'أماني تريب — وكالة سفر معتمدة في المغرب'
    : 'Amany Trip — Agence de Voyages au Maroc | Istanbul, Dubaï, Égypte, Omra';

  // Refresh AOS after direction flip
  if (typeof AOS !== 'undefined') {
    setTimeout(() => AOS.refreshHard(), 50);
  }
}

// Toggle handler
document.getElementById('lang-toggle')?.addEventListener('click', () => {
  applyLanguage(currentLang === 'fr' ? 'ar' : 'fr');
});

/* ══════════════════════════════════════════════════════════
   NAVBAR — scroll (rAF throttled) + hamburger + active link
══════════════════════════════════════════════════════════ */
// Cache DOM — query once, never inside loops
const DOM = {
  navbar:     document.getElementById('navbar'),
  hamburger:  document.getElementById('hamburger'),
  mobileMenu: document.getElementById('mobile-menu'),
  sections:   document.querySelectorAll('section[id]'),
  navLinks:   document.querySelectorAll('.nav-links .nav-link'),
};

// rAF throttle — fires at most once per frame
let rafTicking = false;
function onScroll() {
  if (!rafTicking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      DOM.navbar.classList.toggle('scrolled', y > 60);
      // Active nav link
      const pos = y + 120;
      DOM.sections.forEach(sec => {
        if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
          DOM.navLinks.forEach(a =>
            a.classList.toggle('active', a.getAttribute('href') === `#${sec.id}`)
          );
        }
      });
      rafTicking = false;
    });
    rafTicking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

DOM.hamburger?.addEventListener('click', () => {
  DOM.hamburger.classList.toggle('open');
  DOM.mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    DOM.hamburger.classList.remove('open');
    DOM.mobileMenu.classList.remove('open');
  });
});

/* ══════════════════════════════════════════════════════════
   GSAP — Hero sequence
   Splits hero lines into .word spans, then animates
══════════════════════════════════════════════════════════ */
function splitHeroWords() {
  document.querySelectorAll('.hero-line').forEach(line => {
    const text = line.textContent.trim();
    const isAccent = line.classList.contains('accent-line');
    line.innerHTML = text
      .split(/\s+/)
      .map(w => `<span class="word${isAccent ? ' accent-word' : ''}">${w}</span>`)
      .join(' ');
  });
}

function initGsap() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);
  splitHeroWords();

  const tl = gsap.timeline({ delay: 0.2 });

  tl
    .from('.navbar', { y: -80, opacity: 0, duration: 0.6, ease: 'power3.out' })
    .from('#hero-badge', { scale: 0.8, opacity: 0, duration: 0.4, ease: 'back.out(1.7)' }, '-=0.2')
    .from('.hero-title .word', { y: 60, opacity: 0, stagger: 0.08, duration: 0.55, ease: 'power3.out' }, '-=0.1')
    .to('#hero-sub',   { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1')
    .to('#hero-cta',   { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.15')
    .to('#hero-stats', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.1')
    .from('#hero-stats .stat', { opacity: 0, y: 20, stagger: 0.1, duration: 0.4, ease: 'power2.out' }, '-=0.3');

  // Parallax on scroll
  gsap.to('.hero-bg', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    y: 80, ease: 'none'
  });

  gsap.to('.airplane-float', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    y: -50, x: 30, ease: 'none'
  });
}

/* ══════════════════════════════════════════════════════════
   COUNTER ANIMATION (easeOutCubic)
   Targets both hero stats and about stats
══════════════════════════════════════════════════════════ */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-num, .about-stat-num');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseInt(el.dataset.target, 10);
      const suffix  = el.dataset.suffix || '';
      const dur     = 1600;
      const start   = performance.now();

      const tick = ts => {
        const p = Math.min((ts - start) / dur, 1);
        const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
        el.textContent = v + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════════════════
   SWIPER — Testimonials (exposed globally for lazy loader)
══════════════════════════════════════════════════════════ */
window.initSwiper = function initSwiper() {
  if (typeof Swiper === 'undefined') return;

  new Swiper('.testi-swiper', {
    loop: true,
    speed: 600,
    autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true },
    slidesPerView: 1,
    spaceBetween: 24,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { prevEl: '.swiper-button-prev', nextEl: '.swiper-button-next' },
    breakpoints: {
      640:  { slidesPerView: 1 },
      768:  { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    },
    on: {
      init: function () {
        setTimeout(function() {
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
        }, 300);
      }
    }
  });
}

/* ══════════════════════════════════════════════════════════
   AOS (exposed globally for lazy loader)
══════════════════════════════════════════════════════════ */
window.initAOS = function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });
}

/* ══════════════════════════════════════════════════════════
   CONTACT FORM — builds WhatsApp message, shows success
══════════════════════════════════════════════════════════ */
document.getElementById('contact-form')?.addEventListener('submit', e => {
  e.preventDefault();

  const name      = document.getElementById('f-name')?.value.trim()     || '';
  const email     = document.getElementById('f-email')?.value.trim()    || '';
  const phone     = document.getElementById('f-phone')?.value.trim()    || '';
  const dest      = document.getElementById('f-dest')?.value            || '';
  const travelers = document.getElementById('f-travelers')?.value       || '';
  const date      = document.getElementById('f-date')?.value            || '';
  const budget    = document.getElementById('f-budget')?.value          || '';
  const message   = document.getElementById('f-message')?.value.trim()  || '';

  let text;
  if (currentLang === 'ar') {
    text =
      `مرحباً، أنا ${name}.\n` +
      (email     ? `البريد: ${email}\n` : '') +
      `الهاتف: ${phone}\n` +
      `الوجهة: ${dest}\n` +
      `عدد المسافرين: ${travelers}\n` +
      (date      ? `تاريخ الانطلاق: ${date}\n` : '') +
      (budget    ? `الميزانية: ${budget}\n` : '') +
      (message   ? `\n${message}` : '');
  } else {
    text =
      `Bonjour, je m'appelle ${name}.\n` +
      (email     ? `Email: ${email}\n` : '') +
      `Tél: ${phone}\n` +
      `Destination: ${dest}\n` +
      `Voyageurs: ${travelers}\n` +
      (date      ? `Départ: ${date}\n` : '') +
      (budget    ? `Budget: ${budget}\n` : '') +
      (message   ? `\n${message}` : '');
  }

  window.open(`https://wa.me/212604702922?text=${encodeURIComponent(text)}`, '_blank', 'noopener');

  // Success state
  const btn     = document.getElementById('submit-btn');
  const success = document.getElementById('form-success');
  btn.disabled = true;
  btn.style.opacity = '.6';
  success.removeAttribute('hidden');
  success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = '';
    success.setAttribute('hidden', '');
  }, 6000);
});

/* ══════════════════════════════════════════════════════════
   VISA MODAL
══════════════════════════════════════════════════════════ */
function openVisaModal(visaType) {
  const overlay = document.getElementById('visa-modal-overlay');
  const select  = document.getElementById('visa-select');
  if (!overlay || !select) return;

  // Pre-select the visa type matching the card clicked
  select.value = visaType;

  // Set today as min date for departure
  const today = new Date().toISOString().split('T')[0];
  const departInput = document.getElementById('visa-depart-date');
  if (departInput) {
    departInput.min = today;
    if (!departInput.value) departInput.value = '';
  }

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeVisaModal() {
  const overlay = document.getElementById('visa-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// Close button
document.getElementById('visa-modal-close')?.addEventListener('click', closeVisaModal);

// Click outside overlay to close
document.getElementById('visa-modal-overlay')?.addEventListener('click', function(e) {
  if (e.target === this) closeVisaModal();
});

// Departure date changes → update return min + clear invalid return
document.getElementById('visa-depart-date')?.addEventListener('change', function() {
  const returnInput = document.getElementById('visa-return-date');
  if (!returnInput || !this.value) return;
  const nextDay = new Date(this.value);
  nextDay.setDate(nextDay.getDate() + 1);
  returnInput.min = nextDay.toISOString().split('T')[0];
  if (returnInput.value && returnInput.value <= this.value) returnInput.value = '';
  returnInput.setCustomValidity('');
});

// Return date validation
document.getElementById('visa-return-date')?.addEventListener('change', function() {
  const depart = document.getElementById('visa-depart-date')?.value;
  if (depart && this.value && this.value <= depart) {
    this.setCustomValidity(
      document.documentElement.lang === 'ar'
        ? 'يجب أن يكون تاريخ العودة بعد تاريخ المغادرة'
        : 'La date de retour doit être après la date de départ'
    );
  } else {
    this.setCustomValidity('');
  }
});

// Visa form submit → WhatsApp
document.getElementById('visa-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  if (!this.checkValidity()) { this.reportValidity(); return; }

  const visaSelect  = document.getElementById('visa-select');
  const persons     = document.getElementById('visa-persons')?.value     || '';
  const depart      = document.getElementById('visa-depart-date')?.value || '';
  const retour      = document.getElementById('visa-return-date')?.value || '';
  const name        = document.getElementById('visa-name')?.value.trim() || '';
  const phone       = document.getElementById('visa-phone')?.value.trim() || '';
  const lang        = document.documentElement.lang;

  const selectedOpt = visaSelect?.options[visaSelect.selectedIndex];
  const visaLabel   = selectedOpt?.getAttribute(`data-${lang}`) || selectedOpt?.textContent || '';

  const text = lang === 'ar'
    ? `طلب تأشيرة — أماني تريب\nنوع التأشيرة: ${visaLabel}\nعدد الأشخاص: ${persons}\nتاريخ المغادرة: ${depart}\nتاريخ العودة: ${retour}\nالاسم: ${name}\nالهاتف: ${phone}`
    : `Demande de Visa — Amany Trip\nType de visa: ${visaLabel}\nNombre de personnes: ${persons}\nDate de départ: ${depart}\nDate de retour: ${retour}\nNom: ${name}\nTél: ${phone}`;

  window.open(`https://wa.me/212604702922?text=${encodeURIComponent(text)}`, '_blank', 'noopener');

  const submitBtn = document.getElementById('visa-submit-btn');
  const successEl = document.getElementById('visa-form-success');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '.6'; }
  if (successEl) { successEl.removeAttribute('hidden'); }

  setTimeout(() => {
    closeVisaModal();
    if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
    if (successEl) { successEl.setAttribute('hidden', ''); }
    document.getElementById('visa-form')?.reset();
  }, 2000);
});

// Attach click handlers on visa CTA buttons
document.querySelectorAll('.btn-visa-cta').forEach(btn => {
  btn.addEventListener('click', () => openVisaModal(btn.dataset.visa));
});

/* ══════════════════════════════════════════════════════════
   TRIP MODALS (Maroc programmes — Agadir, Sud4, Ouest, Nord, Dakhla)
══════════════════════════════════════════════════════════ */
function openTripModal(tripId) {
  const overlay = document.getElementById(`${tripId}-modal-overlay`);
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeTripModal(tripId) {
  const overlay = document.getElementById(`${tripId}-modal-overlay`);
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function closeAllTripModals() {
  document.querySelectorAll('.trip-modal-overlay').forEach(el => {
    el.style.display = 'none';
  });
  document.body.style.overflow = '';
}

// Open trip modal from Maroc card buttons
document.querySelectorAll('.btn-maroc-detail').forEach(btn => {
  btn.addEventListener('click', () => openTripModal(btn.dataset.trip));
});

// Close button inside each modal (uses data-trip-close OR id="agadir-modal-close" for legacy)
document.getElementById('agadir-modal-close')?.addEventListener('click', () => closeTripModal('agadir'));
document.querySelectorAll('[data-trip-close]').forEach(btn => {
  btn.addEventListener('click', () => closeTripModal(btn.dataset.tripClose));
});

// Click outside modal content to close
document.querySelectorAll('.trip-modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
});

// ESC closes any open modal
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeAllTripModals();
  closeVisaModal();
});

/* ══════════════════════════════════════════════════════════
   SUR MESURE FORM — date validation + WhatsApp submit
══════════════════════════════════════════════════════════ */
document.getElementById('sm-depart')?.addEventListener('change', function() {
  const ret = document.getElementById('sm-return');
  if (!ret || !this.value) return;
  const next = new Date(this.value);
  next.setDate(next.getDate() + 1);
  ret.min = next.toISOString().split('T')[0];
  if (ret.value && ret.value <= this.value) ret.value = '';
  ret.setCustomValidity('');
});

document.getElementById('sm-return')?.addEventListener('change', function() {
  const dep = document.getElementById('sm-depart')?.value;
  if (dep && this.value && this.value <= dep) {
    this.setCustomValidity(
      document.documentElement.lang === 'ar'
        ? 'يجب أن يكون تاريخ العودة بعد تاريخ الذهاب'
        : 'La date de retour doit être après la date d\'aller'
    );
  } else {
    this.setCustomValidity('');
  }
});

document.getElementById('sur-mesure-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  if (!this.checkValidity()) { this.reportValidity(); return; }

  const destination = document.getElementById('sm-destination')?.value.trim() || '';
  const depart      = document.getElementById('sm-depart')?.value             || '';
  const retour      = document.getElementById('sm-return')?.value             || '';
  const travelers   = document.getElementById('sm-travelers')?.value          || '';
  const hotelSel    = document.getElementById('sm-hotel');
  const name        = document.getElementById('sm-name')?.value.trim()        || '';
  const phone       = document.getElementById('sm-phone')?.value.trim()       || '';
  const message     = document.getElementById('sm-message')?.value.trim()     || '';
  const lang        = document.documentElement.lang;

  const hotelOpt    = hotelSel?.options[hotelSel.selectedIndex];
  const hotelLabel  = hotelOpt?.getAttribute(`data-${lang}`) || hotelOpt?.textContent || '';

  const services = [];
  const svcMap = lang === 'ar'
    ? { 'sm-vol': 'تذاكر الطيران', 'sm-transport': 'النقل في الوجهة', 'sm-guide': 'مرشد سياحي',
        'sm-visa': 'المساعدة في التأشيرة', 'sm-assurance': 'تأمين السفر', 'sm-excursions': 'رحلات وأنشطة' }
    : { 'sm-vol': 'Vol aller-retour', 'sm-transport': 'Transport sur place', 'sm-guide': 'Guide touristique',
        'sm-visa': 'Assistance Visa', 'sm-assurance': 'Assurance voyage', 'sm-excursions': 'Excursions / Activités' };
  Object.keys(svcMap).forEach(id => {
    if (document.getElementById(id)?.checked) services.push(svcMap[id]);
  });

  const text = lang === 'ar'
    ? `🌟 طلب رحلة حسب الطلب — أماني تريب\n\n` +
      `الوجهة: ${destination}\n` +
      `تاريخ الذهاب: ${depart}\n` +
      `تاريخ العودة: ${retour}\n` +
      `عدد المسافرين: ${travelers}\n` +
      `فئة الفندق: ${hotelLabel}\n` +
      (services.length ? `الخدمات: ${services.join(' · ')}\n` : '') +
      `\nالاسم: ${name}\nالهاتف: ${phone}` +
      (message ? `\n\n${message}` : '')
    : `🌟 Demande de voyage sur mesure — Amany Trip\n\n` +
      `Destination: ${destination}\n` +
      `Date d'aller: ${depart}\n` +
      `Date de retour: ${retour}\n` +
      `Voyageurs: ${travelers}\n` +
      `Catégorie hôtel: ${hotelLabel}\n` +
      (services.length ? `Services: ${services.join(' · ')}\n` : '') +
      `\nNom: ${name}\nTél: ${phone}` +
      (message ? `\n\n${message}` : '');

  window.open(`https://wa.me/212604702922?text=${encodeURIComponent(text)}`, '_blank', 'noopener');

  const submitBtn = document.getElementById('sur-mesure-submit');
  const successEl = document.getElementById('sur-mesure-success');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '.6'; }
  if (successEl) {
    successEl.removeAttribute('hidden');
    successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  setTimeout(() => {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
    if (successEl) { successEl.setAttribute('hidden', ''); }
  }, 6000);
});

// Set min date = today on load
(function() {
  const today = new Date().toISOString().split('T')[0];
  ['sm-depart', 'sm-return'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });
})();

/* ══════════════════════════════════════════════════════════
   SMOOTH SCROLL for anchor links
══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  });
});

/* ══════════════════════════════════════════════════════════
   FLOATING WHATSAPP — show after 3 seconds
══════════════════════════════════════════════════════════ */
setTimeout(() => {
  const btn = document.getElementById('float-wa');
  if (btn) btn.classList.add('visible');
}, 3000);

/* ══════════════════════════════════════════════════════════
   ACCESSIBILITY — bulk-mark decorative SVGs + required inputs
   (Icons accompanied by visible text labels are decorative for AT)
══════════════════════════════════════════════════════════ */
function enhanceA11y() {
  document.querySelectorAll('svg:not([aria-hidden]):not([role="img"])').forEach(svg => {
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
  });
  document.querySelectorAll('[required]:not([aria-required])').forEach(el => {
    el.setAttribute('aria-required', 'true');
  });
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved language
  applyLanguage(currentLang);

  // Counters (IntersectionObserver — no library needed)
  animateCounters();

  // GSAP hero animation — after a tick so DOM is settled
  setTimeout(initGsap, 80);

  // AOS + Swiper are lazy-loaded by IntersectionObserver in HTML
  // They will call window.initAOS() / window.initSwiper() when ready

  // Navbar initial state
  if (window.scrollY > 60) DOM.navbar?.classList.add('scrolled');

  // A11y enhancements (decorative svgs + required inputs)
  enhanceA11y();
});
