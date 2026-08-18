(function () {
  'use strict';

  var APP_STORE = 'https://apps.apple.com/pl/app/eatsee-kalorie-ze-zdj%C4%99cia/id6789152922?l=pl';
  var PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.eatsee.app';
  var isAppleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(navigator.userAgent);

  document.querySelectorAll('.smart-store').forEach(function (link) {
    link.href = isAppleMobile ? APP_STORE : PLAY_STORE;
    link.dataset.platform = isAppleMobile ? 'appstore' : 'googleplay';
    if (isAppleMobile) link.setAttribute('aria-label', 'Pobierz EatSee w App Store');
    else if (isAndroid) link.setAttribute('aria-label', 'Pobierz EatSee z Google Play');
  });

  var header = document.getElementById('siteHeader');
  function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 8); }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Otwórz menu');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  menuButton.addEventListener('click', function () {
    var open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Otwórz menu' : 'Zamknij menu');
    mobileMenu.classList.toggle('open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  mobileMenu.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });

  var themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  function setTheme(theme, persist) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#15120e' : '#f6f2e9';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.setAttribute('aria-label', theme === 'dark' ? 'Włącz tryb jasny' : 'Włącz tryb ciemny');
    });
    if (persist) {
      try { localStorage.setItem('eatsee-theme', theme); } catch (e) {}
    }
  }
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light', false);
  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(next, true);
    });
  });
  themeMedia.addEventListener('change', function (event) {
    var saved = null;
    try { saved = localStorage.getItem('eatsee-theme'); } catch (e) {}
    if (!saved) setTheme(event.matches ? 'dark' : 'light', false);
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -28px' });
    document.querySelectorAll('.reveal').forEach(function (element) { revealObserver.observe(element); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (element) { element.classList.add('visible'); });
  }

  var mobileCta = document.getElementById('mobileCta');
  var heroActions = document.querySelector('.hero-actions');
  var finalCta = document.querySelector('.final-cta');
  if ('IntersectionObserver' in window) {
    var heroPassed = false;
    var finalVisible = false;
    function updateMobileCta() {
      var show = heroPassed && !finalVisible;
      mobileCta.classList.toggle('visible', show);
      mobileCta.setAttribute('aria-hidden', show ? 'false' : 'true');
    }
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      updateMobileCta();
    }).observe(heroActions);
    new IntersectionObserver(function (entries) {
      finalVisible = entries[0].isIntersecting;
      updateMobileCta();
    }).observe(finalCta);
  }

  document.querySelectorAll('a[data-store]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var href = link.href;
      if (!href) return;
      event.preventDefault();
      gtag_report_conversion(href);
    });
  });

  var cookie = document.getElementById('cookieConsent');
  var storedConsent = null;
  try { storedConsent = localStorage.getItem('eatsee-cookies'); } catch (e) {}
  if (storedConsent !== 'granted' && storedConsent !== 'denied') {
    cookie.hidden = false;
    document.body.classList.add('cookie-open');
    requestAnimationFrame(function () { cookie.classList.add('visible'); });
  }
  function chooseConsent(value) {
    try { localStorage.setItem('eatsee-cookies', value); } catch (e) {}
    if (value === 'granted') {
      gtag('consent', 'update', {
        ad_storage: 'granted', ad_user_data: 'granted',
        ad_personalization: 'granted', analytics_storage: 'granted'
      });
      gtag('set', 'ads_data_redaction', false);
    }
    cookie.classList.remove('visible');
    document.body.classList.remove('cookie-open');
    setTimeout(function () { cookie.hidden = true; }, 260);
  }
  document.getElementById('cookieAccept').addEventListener('click', function () { chooseConsent('granted'); });
  document.getElementById('cookieDecline').addEventListener('click', function () { chooseConsent('denied'); });
  document.getElementById('year').textContent = new Date().getFullYear();
})();
