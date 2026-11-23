// Privacy Major: návrh webu. Tři malé části: menu, cookie lišta, kontaktní formulář.
(function () {
  'use strict';

  // --- Mobilní menu ---
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('hlavni-menu');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // --- Cookie lišta ---
  var KEY = 'pm-cookie-souhlas';
  var bar = document.getElementById('cookie-bar');
  var dialog = document.getElementById('cookie-dialog');
  var form = document.getElementById('cookie-form');
  var stateEl = document.querySelector('[data-cookie-state]');

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function write(consent) {
    consent.ulozeno = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (e) { /* bez úložiště platí jen pro tuto návštěvu */ }
    current = consent;
    render();
    // Zde by se podle souhlasu teprve načítaly měřicí skripty.
  }
  function render() {
    bar.hidden = !!current;
    if (!stateEl) return;
    if (!current) { stateEl.textContent = 'zatím nezvoleno'; return; }
    var on = [];
    if (current.analytics) on.push('analytické');
    if (current.marketing) on.push('marketingové');
    stateEl.textContent = on.length ? 'nezbytné, ' + on.join(', ') : 'pouze nezbytné';
  }
  function openDialog() {
    form.elements.analytics.checked = !!(current && current.analytics);
    form.elements.marketing.checked = !!(current && current.marketing);
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
  }
  function closeDialog() {
    if (dialog.open && dialog.close) dialog.close();
  }

  var current = read();
  render();

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-cookie-accept],[data-cookie-reject],[data-cookie-settings],[data-cookie-open],[data-cookie-reset]');
    if (!t) return;
    if (t.hasAttribute('data-cookie-accept')) { write({ analytics: true, marketing: true }); closeDialog(); }
    else if (t.hasAttribute('data-cookie-reject')) { write({ analytics: false, marketing: false }); closeDialog(); }
    else if (t.hasAttribute('data-cookie-reset')) {
      try { localStorage.removeItem(KEY); } catch (err) { /* nic */ }
      current = null; render();
    }
    else { e.preventDefault(); openDialog(); }
  });
  form.addEventListener('submit', function () {
    write({ analytics: form.elements.analytics.checked, marketing: form.elements.marketing.checked });
  });

  // --- Kontaktní formulář (ukázka: zpráva se neodesílá) ---
  var contact = document.getElementById('kontaktni-formular');
  var status = contact.querySelector('.form-status');
  contact.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Array.prototype.forEach.call(contact.querySelectorAll('input, textarea'), function (el) {
      var bad = !el.checkValidity();
      el.classList.toggle('invalid', bad);
      el.setAttribute('aria-invalid', String(bad));
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) {
      status.className = 'form-status err';
      status.textContent = 'Vyplňte prosím jméno, platný e-mail a zprávu.';
      firstBad.focus();
      return;
    }
    status.className = 'form-status ok';
    status.textContent = 'Děkujeme, zpráva by nyní dorazila do schránky kanceláře. V tomto návrhu se nic neodesílá.';
    contact.reset();
  });
})();
