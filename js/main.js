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
    const val = el.getAttribute(`data-${lang}`);
    if (val === null) return;
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
});
