/* ELMAS Robotic — main.js */
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  /* Header shrink/background on scroll */
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav (with focus management + Escape) */
  if (toggle && mobileNav) {
    function openMenu() {
      mobileNav.removeAttribute('hidden');
      header.classList.add('scrolled');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Menü schließen');
      var first = mobileNav.querySelector('a');
      if (first) first.focus();
    }
    function closeMenu(returnFocus) {
      mobileNav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü öffnen');
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener('click', function () {
      if (mobileNav.hasAttribute('hidden')) openMenu(); else closeMenu(false);
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { closeMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileNav.hasAttribute('hidden')) closeMenu(true);
    });
  }

  /* Scroll reveal */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* FAQ: only one open at a time */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) { if (other !== item) other.removeAttribute('open'); });
      }
    });
  });

  /* ScrollSpy active nav */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.getAttribute('id');
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* Contact form: spam protection + validation */
  var form = document.getElementById('contact-form');
  if (form) {
    var ts = document.getElementById('form-ts');
    if (ts) ts.value = String(Date.now());
    var success = document.getElementById('form-success');

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      /* 1) Honeypot — if filled, it's a bot: silently abort */
      var hp = form.querySelector('#website');
      if (hp && hp.value.trim() !== '') return;
      /* 2) Time trap — submission faster than 3s = bot */
      var started = parseInt(ts && ts.value, 10) || 0;
      if (started && (Date.now() - started) < 3000) return;
      /* 3) Native validation */
      if (!form.checkValidity()) { form.reportValidity(); return; }

      /* Versand: ohne Backend als funktionierender mailto-Fallback (kein Lead-Verlust).
         PRODUKTION: stattdessen an Web3Forms/Formspree/Cloudflare-Worker POSTen,
         der das Turnstile-Token serverseitig prüft, und Erfolg/Fehler an die Server-Antwort koppeln. */
      var v = function (id) { var el = form.querySelector('#' + id); return el ? el.value.trim() : ''; };
      var subject = 'Anfrage über elmas-robotic.com – ' + v('name');
      var body = 'Name: ' + v('name') +
        '\nUnternehmen: ' + v('company') +
        '\nTelefon: ' + v('phone') +
        '\nE-Mail: ' + v('email') +
        '\n\nVorhaben:\n' + v('message');
      window.location.href = 'mailto:info@elmas-robotic.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* Hero-Video: Autoplay (stummgeschaltet) zuverlässig starten */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var vp = heroVideo.play();
    if (vp && vp.catch) vp.catch(function () {});
  }

  /* KPI count-up bei Sichtbarkeit */
  var kpis = document.querySelectorAll('.kpi-v[data-to]');
  if (kpis.length && 'IntersectionObserver' in window) {
    var kReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var kFmt = function (n, th) { n = Math.round(n); return th ? n.toLocaleString('de-DE') : String(n); };
    var kIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; kIo.unobserve(el);
        var to = parseFloat(el.getAttribute('data-to'));
        var th = el.getAttribute('data-fmt') === 'thousand';
        if (kReduced) { el.textContent = kFmt(to, th); return; }
        var dur = 1400, startTs = null;
        function tick(ts) {
          if (startTs === null) startTs = ts;
          var p = Math.min((ts - startTs) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = kFmt(to * eased, th);
          if (p < 1) requestAnimationFrame(tick); else el.textContent = kFmt(to, th);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    kpis.forEach(function (el) { kIo.observe(el); });
  }
})();
