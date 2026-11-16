/* A&P Real Estate — landing alquiler turístico
   Interacciones: reveal, nav sticky, acordeón FAQ, tabs de ciudad,
   progreso de pasos, UTMs, WhatsApp y envío de formulario con píxel. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* -------- año -------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* -------- UTMs: capturar de la URL y preparar enlaces/campos -------- */
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var params = new URLSearchParams(window.location.search);
  var utm = {};
  UTM_KEYS.forEach(function (k) {
    var v = params.get(k);
    if (v) utm[k] = v;
    var field = document.getElementById(k);
    if (field && v) field.value = v;
  });
  var utmQuery = Object.keys(utm).map(function (k) { return k + '=' + encodeURIComponent(utm[k]); }).join('&');

  // Conservar UTMs al navegar por anclas internas (listo para medición).
  if (utmQuery) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.setAttribute('data-utm', utmQuery);
    });
  }

  /* -------- WhatsApp (número principal: Pedro) -------- */
  var WA_NUMBER = '34605449916';
  function buildWa(text) {
    var msg = text || 'Hola, me gustaría información sobre la gestión de mi piso turístico.';
    if (utmQuery) msg += ' [' + utmQuery + ']';
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }
  var waFloat = document.getElementById('waFloat');
  var waFormBtn = document.getElementById('waFormBtn');
  if (waFloat) waFloat.href = buildWa();
  if (waFormBtn) waFormBtn.href = buildWa('Hola, quiero mi estudio de rentabilidad gratis.');

  /* -------- nav sticky -------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* -------- reveal on scroll -------- */
  var reveals = document.querySelectorAll('.reveal, .step');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* -------- FAQ acordeón -------- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var panel = item.querySelector('.faq__a');
      var open = item.classList.toggle('is-open');
      panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
    });
  });

  /* -------- tabs de ciudad + sincronía con anclas -------- */
  var tabs = document.querySelectorAll('.citytab');
  var panels = document.querySelectorAll('.citypanel');
  function activateCity(name, scroll) {
    var found = false;
    tabs.forEach(function (t) { t.classList.toggle('is-active', t.dataset.tab === name); });
    panels.forEach(function (p) {
      var on = p.dataset.panel === name;
      p.classList.toggle('is-active', on);
      if (on) found = true;
    });
    if (found && scroll) {
      var sec = document.getElementById('ciudades');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return found;
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { activateCity(t.dataset.tab, false); });
  });
  // chips del hero y cualquier enlace a #madrid/#valladolid/#valencia
  document.querySelectorAll('a[href="#madrid"],a[href="#valladolid"],a[href="#valencia"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var name = a.getAttribute('href').slice(1);
      e.preventDefault();
      activateCity(name, true);
      if (history.replaceState) history.replaceState(null, '', '#' + name);
    });
  });
  // al cargar con hash de ciudad
  var h = (window.location.hash || '').slice(1);
  if (['madrid', 'valladolid', 'valencia'].indexOf(h) !== -1) {
    activateCity(h, false);
    setTimeout(function () {
      var sec = document.getElementById('ciudades');
      if (sec) sec.scrollIntoView({ block: 'start' });
    }, 60);
  }

  /* -------- envío del formulario -------- */
  var form = document.getElementById('leadForm');
  var ok = document.getElementById('formOk');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      // === PLACEHOLDER PÍXEL DE CONVERSIÓN ===
      // Dispara aquí tu píxel (Meta, Google Ads, TikTok, etc.).
      // Ejemplo: fbq('track','Lead'); gtag('event','conversion',{...});
      try {
        if (typeof window.trackConversion === 'function') {
          window.trackConversion(serialize(form));
        }
        // window.dataLayer = window.dataLayer || [];
        // window.dataLayer.push({ event: 'lead_estudio_gratis' });
      } catch (err) { /* noop */ }
      // =======================================

      // TODO: enviar `serialize(form)` a tu backend / CRM / email.
      form.style.display = 'none';
      if (ok) ok.classList.add('is-on');
    });
  }
  function serialize(f) {
    var data = {};
    new FormData(f).forEach(function (v, k) { data[k] = v; });
    return data;
  }
})();
