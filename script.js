(function () {
  var form = document.getElementById('callback');
  if (!form) return;
  var ENDPOINT = 'https://formsubmit.co/ajax/info@victorianpropertymanagement.com';
  var SUBJECT = 'Call back request \u2013 Victorian Property Management';
  var QUICK_MS = 6000; // the form service can take a while to answer; confirm once the request is on its way
  var fields = form.querySelector('.cb-fields');
  var done = document.getElementById('cb-done');
  var status = document.getElementById('cb-status');
  var btn = document.getElementById('cb-send');
  var label = btn ? btn.querySelector('span') : null;
  var busy = false;
  var EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
  var purposeEl = form.elements['purpose'];
  function syncPurpose() { purposeEl.classList.toggle('is-empty', !purposeEl.value); }
  purposeEl.addEventListener('change', syncPurpose);
  syncPurpose();
  ['name', 'phone', 'email'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () {
      this.removeAttribute('aria-invalid');
      if (this.setCustomValidity) this.setCustomValidity('');
    });
  });
  function flag(el, msg) {
    el.setAttribute('aria-invalid', 'true');
    el.focus();
    if (el.setCustomValidity && el.reportValidity) { el.setCustomValidity(msg); el.reportValidity(); }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var nameEl = form.elements['name'];
    var name = nameEl.value.trim();
    if (!name) { flag(nameEl, 'Please enter your name.'); return; }
    var phoneEl = form.elements['phone'];
    var phone = phoneEl.value.trim();
    if (!phone) { flag(phoneEl, 'Please enter your phone number.'); return; }
    var emailEl = form.elements['email'];
    var email = emailEl.value.trim();
    if (!email) { flag(emailEl, 'Please enter your email.'); return; }
    if (!EMAIL_RE.test(email)) { flag(emailEl, 'Please enter a valid email, like name@example.com.'); return; }
    if (form.elements['_honey'].value) { showDone(); return; }
    busy = true;
    status.hidden = true;
    btn.disabled = true;
    if (label) label.textContent = 'Sending\u2026';
    var data = {
      purpose: form.elements['purpose'].value || '(not selected)',
      name: name,
      phone: phone,
      email: email,
      message: form.elements['message'].value.trim() || '(none)',
      _subject: SUBJECT,
      _template: 'table',
      _captcha: 'false',
      _honey: ''
    };
    if (email) data._replyto = email;
    var settled = false;
    var quick = setTimeout(function () { if (!settled) showDone(); }, QUICK_MS);
    var opts = {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new URLSearchParams(data)
    };
    try { opts.keepalive = true; } catch (x) {}
    fetch(ENDPOINT, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok && String(j.success) === 'true') return j;
        throw new Error((j && j.message) || ('HTTP ' + r.status));
      });
    }).then(function () {
      settled = true; clearTimeout(quick);
      showDone();
    }).catch(function () {
      settled = true; clearTimeout(quick);
      showFail();
    });
  });

  function showDone() {
    fields.hidden = true;
    done.hidden = false;
    try { done.focus({ preventScroll: true }); } catch (e) { done.focus(); }
  }
  function showFail() {
    busy = false;
    done.hidden = true;
    fields.hidden = false;
    btn.disabled = false;
    if (label) label.textContent = 'Request Call';
    status.hidden = false;
  }
})();
