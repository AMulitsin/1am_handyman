// ═══════════════════════════════════════════════════════
// SERVICE CARD SLIDERS (main page)
// ═══════════════════════════════════════════════════════
function initSliders() {
  document.querySelectorAll('.service-card[data-icon]').forEach(card => {
    const icon   = card.dataset.icon  || '🔧';
    const name   = card.dataset.name  || '';
    const desc   = card.dataset.desc  || '';
    const url    = card.dataset.url   || '';
    let   photos = [];
    try { photos = JSON.parse(card.dataset.photos || '[]'); } catch(e) {}

    const hasPhotos = photos.length > 0;
    if (hasPhotos) card.classList.add('has-photos');

    const track = document.createElement('div');
    track.className = 'slide-track';
    if (hasPhotos) {
      photos.forEach(src => {
        const item = document.createElement('div');
        item.className = 'slide-item';
        const img = document.createElement('img');
        img.src = src; img.alt = name; img.loading = 'lazy';
        item.appendChild(img);
        track.appendChild(item);
      });
    } else {
      const item = document.createElement('div');
      item.className = 'slide-item';
      const ph = document.createElement('div');
      ph.className = 'slide-placeholder';
      ph.textContent = icon;
      item.appendChild(ph);
      track.appendChild(item);
    }
    card.appendChild(track);

    if (hasPhotos && photos.length > 1) {
      const badge = document.createElement('div');
      badge.className = 'slide-count';
      badge.textContent = `1 / ${photos.length}`;
      card.appendChild(badge);
    }

    const overlay = document.createElement('div');
    overlay.className = 'service-overlay';
    overlay.innerHTML = `<div class="service-icon">${icon}</div><div class="service-name">${name}</div><div class="service-desc">${desc}</div>`;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.className = 'service-link';
      link.textContent = 'View Service →';
      overlay.appendChild(link);
    }
    if (hasPhotos && photos.length > 1) {
      const dots = document.createElement('div');
      dots.className = 'slide-dots';
      photos.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Photo ${i + 1}`);
        dot.addEventListener('click', e => { e.stopPropagation(); goTo(card, track, dots, i, card.querySelector('.slide-count')); });
        dots.appendChild(dot);
      });
      overlay.appendChild(dots);
    }
    card.appendChild(overlay);

    if (hasPhotos && photos.length > 1) {
      let cur = 0;
      setInterval(() => {
        if (!card.matches(':hover')) {
          cur = (cur + 1) % photos.length;
          goTo(card, track, overlay.querySelector('.slide-dots'), cur, card.querySelector('.slide-count'));
        }
      }, 3200);
    }
  });
}

function goTo(card, track, dots, idx, badge) {
  track.style.transform = `translateX(-${idx * card.offsetWidth}px)`;
  if (dots) dots.querySelectorAll('.slide-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  if (badge) { const total = card.querySelectorAll('.slide-item').length; badge.textContent = `${idx + 1} / ${total}`; }
}

initSliders();

// ═══════════════════════════════════════════════════════
// LIGHTBOX — global scope (works on all pages)
// ═══════════════════════════════════════════════════════
const lb        = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');
const lbCaption = document.getElementById('lbCaption');
const lbCounter = document.getElementById('lbCounter');
let lbPhotos = [], lbCurrent = 0, lbName = '';

function lbOpen(photos, idx, name) {
  if (!lb) return;
  lbPhotos = photos; lbCurrent = idx; lbName = name;
  lbShow();
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function lbShow() {
  if (!lbImg) return;
  lbImg.src = lbPhotos[lbCurrent];
  if (lbCaption) lbCaption.textContent = lbName;
  if (lbCounter) lbCounter.textContent = lbPhotos.length > 1 ? `${lbCurrent + 1} / ${lbPhotos.length}` : '';
  if (lbPrev) lbPrev.style.display = lbPhotos.length > 1 ? 'flex' : 'none';
  if (lbNext) lbNext.style.display = lbPhotos.length > 1 ? 'flex' : 'none';
}

function lbClose_fn() {
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { if (lbImg) lbImg.src = ''; }, 300);
}

if (lb) {
  if (lbClose) lbClose.addEventListener('click', lbClose_fn);
  lb.addEventListener('click', e => { if (e.target === lb) lbClose_fn(); });
  if (lbPrev) lbPrev.addEventListener('click', () => { lbCurrent = (lbCurrent - 1 + lbPhotos.length) % lbPhotos.length; lbShow(); });
  if (lbNext) lbNext.addEventListener('click', () => { lbCurrent = (lbCurrent + 1) % lbPhotos.length; lbShow(); });
}

document.addEventListener('keydown', e => {
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'Escape') lbClose_fn();
  if (e.key === 'ArrowLeft') { lbCurrent = (lbCurrent - 1 + lbPhotos.length) % lbPhotos.length; lbShow(); }
  if (e.key === 'ArrowRight') { lbCurrent = (lbCurrent + 1) % lbPhotos.length; lbShow(); }
});

// Service photo grid click (main page slider)
const grid = document.querySelector('.services-grid');
if (grid) {
  grid.addEventListener('click', e => {
    const img = e.target.closest('.slide-item img');
    if (!img) return;
    const card = img.closest('.service-card');
    if (!card) return;
    let photos = [];
    try { photos = JSON.parse(card.dataset.photos || '[]'); } catch(err) {}
    if (!photos.length) return;
    const track = card.querySelector('.slide-track');
    let idx = 0;
    if (track) { const tx = new DOMMatrix(getComputedStyle(track).transform).m41; idx = Math.round(Math.abs(tx) / card.offsetWidth); }
    lbOpen(photos, idx, card.dataset.name || '');
  });
}

// Service page gallery grid click
const gallery = document.querySelector('.sp-gallery-grid');
if (gallery) {
  gallery.addEventListener('click', e => {
    const img = e.target.closest('.sp-gallery-item img');
    if (!img) return;
    const items = [...gallery.querySelectorAll('.sp-gallery-item img')];
    const photos = items.map(i => i.src);
    const idx = items.indexOf(img);
    lbOpen(photos, idx, img.alt || '');
  });
}

// ═══════════════════════════════════════════════════════
// SERVICE AREA TAGS
// ═══════════════════════════════════════════════════════
const SERVICE_AREAS = ["Simi Valley","Thousand Oaks","Moorpark","Camarillo","Chatsworth","Northridge","North Hollywood","Burbank","Glendale","Woodland Hills","Calabasas","West Hills","Canoga Park","Agoura Hills","Santa Clarita","Newhall"];
const tagsContainer = document.getElementById('serviceAreaTags');
if (tagsContainer) {
  SERVICE_AREAS.forEach(city => { const tag = document.createElement('span'); tag.className = 'area-tag'; tag.textContent = city; tagsContainer.appendChild(tag); });
}

// ═══════════════════════════════════════════════════════
// FORMS
// ═══════════════════════════════════════════════════════
const form    = document.getElementById('estimateForm');
const success = document.getElementById('formSuccess');
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        form.style.display = 'none'; success.style.display = 'block';
        if (typeof gtag !== 'undefined') gtag('event', 'conversion_event_purchase', { 'event_source': 'estimate_form' });
      } else { alert('Something went wrong. Please call: 323-454-3637'); btn.textContent = 'Request Free Estimate →'; btn.disabled = false; }
    } catch { alert('Please call: 323-454-3637'); btn.textContent = 'Request Free Estimate →'; btn.disabled = false; }
  });
}

const spForm    = document.getElementById('spEstimateForm');
const spSuccess = document.getElementById('spFormSuccess');
if (spForm) {
  spForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = spForm.querySelector('button[type=submit]');
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      const res = await fetch(spForm.action, { method: 'POST', body: new FormData(spForm), headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        spForm.style.display = 'none'; spSuccess.style.display = 'block';
        if (typeof gtag !== 'undefined') gtag('event', 'conversion_event_purchase', { 'event_source': 'service_page_form' });
      } else { alert('Please call: 323-454-3637'); btn.textContent = 'Get Free Estimate →'; btn.disabled = false; }
    } catch { alert('Please call: 323-454-3637'); btn.textContent = 'Get Free Estimate →'; btn.disabled = false; }
  });
}

const careersForm    = document.getElementById('careersForm');
const careersSuccess = document.getElementById('careersSuccess');
if (careersForm) {
  careersForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = careersForm.querySelector('button[type=submit]');
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      const res = await fetch(careersForm.action, { method: 'POST', body: new FormData(careersForm), headers: { 'Accept': 'application/json' } });
      if (res.ok) { careersForm.style.display = 'none'; careersSuccess.style.display = 'block'; }
      else { alert('Error. Email: 1am.handyman.sf@gmail.com'); btn.textContent = 'Submit Application →'; btn.disabled = false; }
    } catch { alert('Email: 1am.handyman.sf@gmail.com'); btn.textContent = 'Submit Application →'; btn.disabled = false; }
  });
}

// ═══════════════════════════════════════════════════════
// CONVERSION: CALL & TEXT CLICKS
// ═══════════════════════════════════════════════════════
document.querySelectorAll('a[href^="tel:"], a[href^="sms:"]').forEach(el => {
  el.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion_event_purchase', { 'event_source': el.href.startsWith('sms:') ? 'sms_button' : 'call_button' });
    }
  });
});

// ═══════════════════════════════════════════════════════
// FAQ ACCORDION
// ═══════════════════════════════════════════════════════
function toggleFaq(question) {
  const answer = question.nextElementSibling;
  const isOpen = question.classList.contains('open');
  document.querySelectorAll('.faq-question').forEach(q => { q.classList.remove('open'); if (q.nextElementSibling) q.nextElementSibling.classList.remove('open'); });
  if (!isOpen) { question.classList.add('open'); answer.classList.add('open'); }
}

// ═══════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; } });
}, { threshold: 0.06 });
document.querySelectorAll('.service-card,.contact-item,.contact-aside,.why-card,.pricing-card,.connect-card,.review-card,.stat-item,.sp-include-item,.sp-process-step,.sp-gallery-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  obs.observe(el);
});


// ═══════════════════════════════════════════════════════
// GOOGLE ADS — DELAYED NAVIGATION HELPER
// Fires conversion before navigating (tel: / sms: links)
// ═══════════════════════════════════════════════════════
function gtagSendEvent(url) {
  var callback = function () {
    if (typeof url === 'string') {
      window.location = url;
    }
  };
  // Fire both conversion events
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion_event_purchase_1', {
      'event_callback': callback,
      'event_timeout': 2000,
    });
    gtag('event', 'conversion_event_purchase', {
      'event_source': 'call_sms_click',
    });
  } else {
    callback();
  }
  return false;
}

// ═══════════════════════════════════════════════════════
// COOKIE BANNER
// ═══════════════════════════════════════════════════════
const cookieBanner = document.getElementById('cookieBanner');
if (cookieBanner && !localStorage.getItem('cookieConsent')) {
  setTimeout(() => { cookieBanner.style.transform = 'translateY(0)'; }, 1500);
}
function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  if (cookieBanner) cookieBanner.style.transform = 'translateY(100%)';
  if (typeof gtag !== 'undefined') gtag('consent', 'update', { analytics_storage: 'granted' });
}
function declineCookies() {
  localStorage.setItem('cookieConsent', 'declined');
  if (cookieBanner) cookieBanner.style.transform = 'translateY(100%)';
}

// ═══════════════════════════════════════════════════════
// PRIVACY MODAL
// ═══════════════════════════════════════════════════════
const privacyModal = document.getElementById('privacyModal');
function openPrivacy(e) { if (e) e.preventDefault(); if (privacyModal) { privacyModal.style.display = 'block'; document.body.style.overflow = 'hidden'; } }
function closePrivacy() { if (privacyModal) { privacyModal.style.display = 'none'; document.body.style.overflow = ''; } }
['privacyLink','privacyLink2','privacyLink3','privacyLink4'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('click', openPrivacy); });
if (privacyModal) privacyModal.addEventListener('click', e => { if (e.target === privacyModal) closePrivacy(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && privacyModal && privacyModal.style.display === 'block') closePrivacy(); });
