(() => {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = reduceMotion ? 0.15 : 1;            // factor de tiempos
  const isSmall = window.matchMedia('(max-width: 600px)').matches;

  /* ---------- Elementos ---------- */
  const intro        = $('#intro');
  const letterScreen = $('#letter-screen');
  const envelope     = $('#envelope');
  const yesBtn       = $('#btn-yes');
  const noBtn        = $('#btn-no');
  const noMsg        = $('#no-msg');
  const fadeTargets  = $$('.fade-target');
  const fxBg         = $('#fx-bg');
  const fxTop        = $('#fx-top');
  const player       = $('#player');
  const musicBtn     = $('#music-btn');
  const musicNote    = $('#music-note');
  const audio        = $('#bg-audio');
  const polaroid     = $('#polaroid');
  const photo        = $('#our-photo');

  /* =====================================================
     1. FONDO: corazones flotando y brillitos (moderado)
     ===================================================== */
  function buildBackground() {
    if (reduceMotion) return;
    const hearts = isSmall ? 6 : 11;
    const sparkles = isSmall ? 8 : 16;
    const symbols = ['❤', '💗', '💕', '🩷'];

    for (let i = 0; i < hearts; i++) {
      const h = document.createElement('span');
      h.className = 'float-heart';
      h.textContent = pick(symbols);
      h.style.left = rand(2, 96) + '%';
      h.style.fontSize = rand(14, 28) + 'px';
      h.style.animationDuration = rand(14, 24) + 's';
      h.style.animationDelay = (-rand(0, 20)) + 's';
      h.style.color = pick(['#ff8fa8', '#f48aa5', '#d6264f', '#ffb3c6']);
      fxBg.appendChild(h);
    }
    for (let i = 0; i < sparkles; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = pick(['✦', '✧', '✨']);
      s.style.left = rand(2, 98) + '%';
      s.style.top = rand(2, 96) + '%';
      s.style.fontSize = rand(10, 18) + 'px';
      s.style.animationDuration = rand(2.5, 5) + 's';
      s.style.animationDelay = (-rand(0, 5)) + 's';
      fxBg.appendChild(s);
    }
  }

  /* Lluvia de corazones (al abrir el sobre) */
  function heartRain(count) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'rain-heart';
      h.textContent = pick(['❤️', '💗', '💖', '🩷', '💕']);
      h.style.left = rand(0, 94) + '%';
      h.style.fontSize = rand(16, 30) + 'px';
      const dur = rand(3, 5.5);
      h.style.animationDuration = dur + 's';
      h.style.animationDelay = rand(0, 1.6) + 's';
      h.style.setProperty('--sway', rand(-40, 40) + 'px');
      h.style.setProperty('--spin', rand(-200, 200) + 'deg');
      fxTop.appendChild(h);
      setTimeout(() => h.remove(), (dur + 1.8) * 1000 + 200);
    }
  }

  /* =====================================================
     2. BOTÓN "NO" TRAVIESO
     ===================================================== */
  const NO_MESSAGES = [
    '¿CÓMO QUE NOOO? 😭',
    'Mi amor, inténtalo otra vez JAJAJA 😂',
    'Esa opción está de vacaciones, vuelve mañana 🤨',
    'Error 404: No se encontró el motivo para rechazar esta cartita ❤️',
    'Piénsalo bien, mi niña 🥺',
    '¿Y si mejor me das un besito? 😚',
    'No me rompas mi corazoncito de programador 😔💻',
    'Te doy otra oportunidad porque te quiero muchito 💗'
  ];
  const SPECIAL_MSG = 'JAJAJA, ya vi que quieres hacerte la difícil, pero yo sé que quieres leer tu cartita. 😭❤️';

  let attempts = 0;
  let lastMsgIndex = -1;
  let lastDodge = 0;
  let placeholder = null;

  function overlaps(a, b, pad = 0) {
    return !(a.right + pad < b.left || a.left - pad > b.right ||
             a.bottom + pad < b.top || a.top - pad > b.bottom);
  }

  function moveNoButton() {
    const margin = 10;
    const w = noBtn.offsetWidth;
    const h = noBtn.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    // Zonas que el botón NO debe tapar
    const avoid = [yesBtn, noMsg, player]
      .filter(Boolean)
      .map((el) => el.getBoundingClientRect());

    const cur = noBtn.getBoundingClientRect();
    let x = margin, y = margin, found = false;

    for (let i = 0; i < 60; i++) {
      const cx = rand(margin, Math.max(margin, vw - w - margin));
      const cy = rand(margin, Math.max(margin, vh - h - margin));
      const rect = { left: cx, top: cy, right: cx + w, bottom: cy + h };
      const farEnough = Math.hypot(cx - cur.left, cy - cur.top) > 70;
      if (farEnough && !avoid.some((r) => overlaps(rect, r, 14))) {
        x = cx; y = cy; found = true;
        break;
      }
    }
    if (!found) { // respaldo: esquina opuesta al botón SÍ
      const yes = yesBtn.getBoundingClientRect();
      x = yes.left > vw / 2 ? margin : vw - w - margin;
      y = Math.max(margin, vh - h - margin);
    }
    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
  }

  function showNoMessage() {
    if (attempts >= 5 && attempts % 5 === 0) {
      noMsg.textContent = SPECIAL_MSG;
      return;
    }
    let i;
    do { i = Math.floor(Math.random() * NO_MESSAGES.length); } while (i === lastMsgIndex);
    lastMsgIndex = i;
    noMsg.textContent = NO_MESSAGES[i];
  }

  function dodge() {
    const now = Date.now();
    if (now - lastDodge < 250) return;   // evita contar dos veces (pointerdown + click)
    lastDodge = now;
    attempts++;

    if (!noBtn.classList.contains('escaped')) {
      const r = noBtn.getBoundingClientRect();
      placeholder = document.createElement('span');
      placeholder.className = 'no-placeholder';
      placeholder.style.width = r.width + 'px';
      placeholder.style.height = r.height + 'px';
      noBtn.parentNode.insertBefore(placeholder, noBtn);
      noBtn.classList.add('escaped');
      noBtn.style.left = r.left + 'px';
      noBtn.style.top = r.top + 'px';
      noBtn.getBoundingClientRect();     // fuerza reflow para animar el primer salto
    }
    moveNoButton();
    showNoMessage();
  }

  function resetNoButton() {
    attempts = 0;
    lastMsgIndex = -1;
    noBtn.classList.remove('escaped');
    noBtn.style.left = '';
    noBtn.style.top = '';
    if (placeholder) { placeholder.remove(); placeholder = null; }
    noMsg.textContent = '';
  }

  noBtn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') dodge(); });
  noBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); dodge(); });
  noBtn.addEventListener('click', (e) => { e.preventDefault(); dodge(); });

  window.addEventListener('resize', () => {   // mantenerlo dentro de la pantalla (giro del celular, etc.)
    if (!noBtn.classList.contains('escaped')) return;
    const maxX = document.documentElement.clientWidth - noBtn.offsetWidth - 10;
    const maxY = window.innerHeight - noBtn.offsetHeight - 10;
    noBtn.style.left = Math.max(10, Math.min(parseFloat(noBtn.style.left) || 10, maxX)) + 'px';
    noBtn.style.top = Math.max(10, Math.min(parseFloat(noBtn.style.top) || 10, maxY)) + 'px';
  });

  /* =====================================================
     3. MÚSICA
     ===================================================== */
  let audioFailed = false;
  let noteTimer = null;

  audio.volume = 0.6;

  function showMusicNote(text) {
    musicNote.textContent = text;
    musicNote.hidden = false;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { musicNote.hidden = true; }, 4500);
  }
  function setPlaying(isPlaying) {
    player.classList.toggle('playing', isPlaying);
    musicBtn.setAttribute('aria-pressed', String(isPlaying));
  }
  function musicUnavailable() {
    if (audioFailed) return;
    audioFailed = true;
    setPlaying(false);
    showMusicNote('La música no está disponible por ahora 🎵');
  }

  async function playMusic() {
    if (audioFailed) return;
    try {
      await audio.play();
      setPlaying(true);
    } catch (err) {
      setPlaying(false);
      if (err && err.name === 'NotSupportedError') musicUnavailable();
    }
  }

  audio.addEventListener('error', musicUnavailable);
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('playing', () => setPlaying(true));

  musicBtn.addEventListener('click', async () => {
    if (audioFailed) { showMusicNote('La música no está disponible por ahora 🎵'); return; }
    if (audio.paused) { await playMusic(); } else { audio.pause(); }
  });

  /* =====================================================
     4. APERTURA DEL SOBRE
     ===================================================== */
  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;
    yesBtn.disabled = true;
    noBtn.style.visibility = 'hidden';

    playMusic();                                  // dentro del gesto del usuario (necesario en el móvil)
    fadeTargets.forEach((el) => el.classList.add('fade-out'));
    envelope.classList.add('open');

    setTimeout(() => heartRain(isSmall ? 18 : 34), 900 * T);
    setTimeout(() => intro.classList.add('leaving'), 3600 * T);
    setTimeout(showLetter, 4500 * T);
  }

  function showLetter() {
    intro.hidden = true;
    letterScreen.hidden = false;
    window.scrollTo(0, 0);
    setupReveal();
  }

  yesBtn.addEventListener('click', openEnvelope);

  /* =====================================================
     5. REVELADO SUAVE AL HACER SCROLL
     ===================================================== */
  let io = null;
  function setupReveal() {
    const els = $$('.reveal');
    if (io) io.disconnect();
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => { el.classList.remove('in'); io.observe(el); });
  }

  /* =====================================================
     6. FINAL: corazones suaves
     ===================================================== */
  let finalHeartsBuilt = false;
  function buildFinalHearts() {
    if (finalHeartsBuilt || reduceMotion) return;
    finalHeartsBuilt = true;
    const box = $('#final-hearts');
    const n = isSmall ? 6 : 9;
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'float-heart';
      h.textContent = pick(['❤', '💗', '💕']);
      h.style.left = rand(4, 94) + '%';
      h.style.fontSize = rand(16, 26) + 'px';
      h.style.animationDuration = rand(9, 15) + 's';
      h.style.animationDelay = (-rand(0, 10)) + 's';
      h.style.color = pick(['#ff8fa8', '#d6264f', '#ffb3c6']);
      box.appendChild(h);
    }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { buildFinalHearts(); obs.disconnect(); }
    }, { threshold: 0.2 }).observe($('#final'));
  } else {
    buildFinalHearts();
  }

  /* =====================================================
     7. VOLVER A LEER / VER EL SOBRE OTRA VEZ
     ===================================================== */
  $('#btn-reread').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(setupReveal, reduceMotion ? 0 : 600);
  });

  $('#btn-again').addEventListener('click', () => {
    opened = false;
    yesBtn.disabled = false;
    noBtn.style.visibility = '';
    resetNoButton();
    envelope.classList.remove('open');
    intro.classList.remove('leaving');
    fadeTargets.forEach((el) => el.classList.remove('fade-out'));
    letterScreen.hidden = true;
    intro.hidden = false;
    window.scrollTo(0, 0);
  });

  /* =====================================================
     8. RECURSOS OPCIONALES: foto y stickers con respaldo
     ===================================================== */
  // Foto: si falta, se muestra el marco con la indicación discreta
  function checkPhoto() {
    if (photo.complete && photo.naturalWidth === 0) polaroid.classList.add('no-photo');
  }
  photo.addEventListener('error', () => polaroid.classList.add('no-photo'));
  photo.addEventListener('load', () => polaroid.classList.remove('no-photo'));
  checkPhoto();

  // Stickers: si existe el PNG propio se usa; si no, queda el dibujo SVG
  $$('.sticker[data-img]').forEach((st) => {
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.addEventListener('load', () => {
      if (img.naturalWidth > 0) { st.appendChild(img); st.classList.add('has-img'); }
    });
    img.src = st.dataset.img;            // si da error, simplemente se ignora
  });

  /* ---------- Arranque ---------- */
  buildBackground();
})();