/* ============================================================
   LAVENDER LOVE — script.js
   Romantic proposal website · Vanilla ES6 · No backend
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
const state = {
  name: '',
  date: '',
  time: '',
  dateType: '',
  escapeCount: 0,
  countdownInterval: null,
  relMeterInterval: null,
  audioCtx: null,
  musicNodes: null,
  musicPlaying: false,
  easterSeq: [],
  currentPage: 'welcome',
};

/* ──────────────────────────────────────────
   ESCAPE MESSAGES
────────────────────────────────────────── */
const escapeMsgs = [
  'Nice try 😏',
  'Almost got it 😂',
  'Not today ❤️',
  'Try again 😜',
  'You are determined 😆',
  'Mission Failed Successfully 🤣',
];
const escapeExtra = {
  5:  'Persistent, aren\'t we? 😏',
  10: 'This button has commitment issues 😂',
  15: 'At this point just click YES ❤️',
};

/* ──────────────────────────────────────────
   KONAMI CODE
────────────────────────────────────────── */
const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
];

/* ──────────────────────────────────────────
   DOM REFS
────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyStoredPrefs();
  initParticles();
  initDarkModeToggle();
  initMusicToggle();
  initWelcomePage();
  initQuestionPage();
  initPlanPage();
  initInvitationPage();
  initEasterEgg();
  addFloatingHeartsToCard();
  placeMiniHearts('.floating-hearts-small', 6);
  placeMiniHearts('.ps-hearts', 8);
  placeCardSparkles();
});

/* ──────────────────────────────────────────
   STORED PREFERENCES
────────────────────────────────────────── */
function applyStoredPrefs() {
  // Dark mode
  if (localStorage.getItem('lavender-dark') === '1') {
    document.body.classList.replace('light-mode', 'dark-mode');
  } else {
    document.body.classList.add('light-mode');
  }

  // Music preference stored but don't auto-play (browser policy)
  // Name — skip directly if stored? No, always start fresh for the experience.
}

/* ──────────────────────────────────────────
   DARK MODE
────────────────────────────────────────── */
function initDarkModeToggle() {
  $('darkModeToggle').addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode', !isDark);
    document.body.classList.toggle('light-mode', isDark);
    localStorage.setItem('lavender-dark', isDark ? '0' : '1');
  });
}

/* ──────────────────────────────────────────
   MUSIC — Web Audio API tone generator
────────────────────────────────────────── */
function initMusicToggle() {
  $('musicToggle').addEventListener('click', toggleMusic);
}

function toggleMusic() {
  if (state.musicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
}

function startMusic() {
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

  // Soft romantic chord: layered sine + triangle oscillators
  const ctx = state.audioCtx;
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4 E4 G4 C5
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);
  master.connect(ctx.destination);

  const oscs = notes.map((freq, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    gainNode.gain.value = 0.25;
    osc.connect(gainNode);
    gainNode.connect(master);
    osc.start();
    return osc;
  });

  // Gentle LFO for tremolo
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.3;
  lfoGain.gain.value = 0.01;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();

  state.musicNodes = { master, oscs, lfo };
  state.musicPlaying = true;
  $('musicIcon').textContent = '🔇';
  localStorage.setItem('lavender-music', '1');
}

function stopMusic() {
  if (!state.musicNodes) return;
  const { master, oscs, lfo } = state.musicNodes;
  const ctx = state.audioCtx;
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  setTimeout(() => {
    oscs.forEach(o => { try { o.stop(); } catch(_){} });
    try { lfo.stop(); } catch(_){}
    state.musicNodes = null;
  }, 900);
  state.musicPlaying = false;
  $('musicIcon').textContent = '🎵';
  localStorage.setItem('lavender-music', '0');
}

/* ──────────────────────────────────────────
   PAGE TRANSITIONS
────────────────────────────────────────── */
function goToPage(id) {
  const current = document.querySelector('.page.active');
  const next    = $(`page-${id}`);
  if (!next || current === next) return;

  current.style.opacity = '0';
  current.style.pointerEvents = 'none';
  setTimeout(() => {
    current.classList.remove('active');
    next.classList.add('active');
    next.style.opacity = '1';
    next.style.pointerEvents = 'all';
    state.currentPage = id;
  }, 380);
}

/* ──────────────────────────────────────────
   PAGE 1 — WELCOME
────────────────────────────────────────── */
function initWelcomePage() {
  const btn   = $('welcomeBtn');
  const input = $('nameInput');
  const err   = $('nameError');

  const validate = () => {
    const val = input.value.trim();
    if (!val) {
      err.textContent = 'Please enter your lovely name 💜';
      input.closest('.form-group').classList.add('shake');
      setTimeout(() => input.closest('.form-group').classList.remove('shake'), 500);
      input.focus();
      return false;
    }
    if (val.length < 2) {
      err.textContent = 'Name must be at least 2 characters.';
      input.closest('.form-group').classList.add('shake');
      setTimeout(() => input.closest('.form-group').classList.remove('shake'), 500);
      return false;
    }
    err.textContent = '';
    return true;
  };

  btn.addEventListener('click', () => {
    if (!validate()) return;
    state.name = capitalise(input.value.trim());
    localStorage.setItem('lavender-name', state.name);
    $('nameGreeting').textContent = `Hi ${state.name} ❤️`;
    goToPage('question');
  });

  input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
  input.addEventListener('input',   () => { if ($('nameError').textContent) $('nameError').textContent = ''; });
}

/* ──────────────────────────────────────────
   PAGE 2 — THE BIG QUESTION
────────────────────────────────────────── */
function initQuestionPage() {
  const yesBtn = $('yesBtn');
  const noBtn  = $('noBtn');

  // Initial placement for NO button (after page is shown)
  positionNoBtn();

  yesBtn.addEventListener('click', handleYes);

  // Cooldown so the button doesn't fire on every mousemove frame
  let noBtnCooldown = false;

  // Cursor proximity — only triggers once per cooldown window
  document.addEventListener('mousemove', e => {
    if (state.currentPage !== 'question' || noBtnCooldown) return;
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < 110) {
      noBtnCooldown = true;
      runAwayNoBtn(e.clientX, e.clientY);
      setTimeout(() => { noBtnCooldown = false; }, 450);
    }
  });

  // Touch proximity
  document.addEventListener('touchmove', e => {
    if (state.currentPage !== 'question' || noBtnCooldown) return;
    const touch = e.touches[0];
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    if (Math.hypot(touch.clientX - cx, touch.clientY - cy) < 140) {
      noBtnCooldown = true;
      runAwayNoBtn(touch.clientX, touch.clientY);
      setTimeout(() => { noBtnCooldown = false; }, 450);
    }
  }, { passive: true });

  // Also run away on direct click/tap
  noBtn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    runAwayNoBtn(e.clientX, e.clientY);
  });

  noBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    runAwayNoBtn(t.clientX, t.clientY);
  }, { passive: false });
}

function positionNoBtn() {
  const noBtn = $('noBtn');
  // Place it somewhere visible initially
  noBtn.style.left = '60%';
  noBtn.style.top  = '70%';
}

function runAwayNoBtn(cursorX = -999, cursorY = -999) {
  const noBtn = $('noBtn');
  state.escapeCount++;
  $('escapeCount').textContent = state.escapeCount;

  // Pick message
  const msg = escapeExtra[state.escapeCount] || escapeMsgs[Math.floor(Math.random() * escapeMsgs.length)];
  const msgEl = $('escapeMsg');
  msgEl.textContent = msg;
  msgEl.style.opacity = '1';
  clearTimeout(runAwayNoBtn._msgTimer);
  runAwayNoBtn._msgTimer = setTimeout(() => { msgEl.style.opacity = '0'; }, 1800);

  const btnW  = noBtn.offsetWidth  || 110;
  const btnH  = noBtn.offsetHeight || 48;
  const pad   = 24;
  const maxX  = window.innerWidth  - btnW - pad;
  const maxY  = window.innerHeight - btnH - pad;

  // Current centre of the button
  const rect  = noBtn.getBoundingClientRect();
  const curBX = rect.left + btnW / 2;
  const curBY = rect.top  + btnH / 2;

  // Generate 12 candidates and score each by combined distance from
  // cursor AND from current position — pick the farthest one.
  let bestX = pad, bestY = pad, bestScore = -1;
  for (let i = 0; i < 12; i++) {
    const cx = pad + Math.random() * maxX;
    const cy = pad + Math.random() * maxY;
    const midX = cx + btnW / 2;
    const midY = cy + btnH / 2;
    const dCursor = Math.hypot(midX - cursorX, midY - cursorY);
    const dCurrent = Math.hypot(midX - curBX, midY - curBY);
    // Weight cursor distance more so it always moves away from the mouse
    const score = dCursor * 1.6 + dCurrent;
    if (score > bestScore) { bestScore = score; bestX = cx; bestY = cy; }
  }

  const rot = (Math.random() - 0.5) * 18;
  noBtn.style.transition = 'left 0.35s cubic-bezier(.22,.68,0,1.4), top 0.35s cubic-bezier(.22,.68,0,1.4), transform 0.3s ease';
  noBtn.style.left      = `${bestX}px`;
  noBtn.style.top       = `${bestY}px`;
  noBtn.style.transform = `rotate(${rot}deg)`;
  setTimeout(() => { noBtn.style.transform = 'rotate(0deg)'; }, 400);
}

/* ──────────────────────────────────────────
   YES CLICK
────────────────────────────────────────── */
function handleYes() {
  // Confetti burst
  fireConfetti();

  // Float hearts
  burstHearts(30);

  // Sparkles
  burstSparkles(20);

  // Transition to loading page
  setTimeout(() => {
    goToPage('loading');
    runCompatibilityCheck();
  }, 800);
}

function runCompatibilityCheck() {
  const steps   = $$('#compatSteps .step');
  const fill    = $('progressFill');
  const barWrap = $('progressBar');
  const result  = $('matchResult');
  const stepDelay = 900;

  // Reset
  steps.forEach(s => { s.classList.remove('done'); s.querySelector('.step-icon').textContent = '⏳'; });
  fill.style.width = '0%';
  result.hidden = true;

  steps.forEach((step, i) => {
    setTimeout(() => {
      step.classList.add('done');
      step.querySelector('.step-icon').textContent = '✔';
      const pct = Math.round(((i + 1) / steps.length) * 85);
      fill.style.width = pct + '%';
      barWrap.setAttribute('aria-valuenow', pct);

      if (i === steps.length - 1) {
        setTimeout(() => {
          fill.style.width = '100%';
          barWrap.setAttribute('aria-valuenow', 100);
          setTimeout(() => {
            result.hidden = false;
            // Fire extra confetti
            fireConfetti(0.4);
            burstHearts(20);
            setTimeout(() => goToPage('plan'), 2200);
          }, 600);
        }, 400);
      }
    }, i * stepDelay);
  });
}

/* ──────────────────────────────────────────
   PAGE 3 — PLAN OUR DATE
────────────────────────────────────────── */
function initPlanPage() {
  const form = $('planForm');

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  $('dateInput').min = today;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validatePlanForm()) return;

    state.date     = $('dateInput').value;
    state.time     = $('timeInput').value;
    state.dateType = $('dateType').value;

    buildInvitationCard();
    goToPage('invitation');

    setTimeout(() => {
      startCountdown();
      animateRelMeter();
    }, 600);
  });
}

function validatePlanForm() {
  let valid = true;

  const dateVal = $('dateInput').value;
  const timeVal = $('timeInput').value;
  const typeVal = $('dateType').value;

  if (!dateVal) {
    showFieldError('dateInput', 'dateError', 'Please pick a date 📅');
    valid = false;
  } else {
    clearFieldError('dateError');
  }

  if (!timeVal) {
    showFieldError('timeInput', 'timeError', 'Please pick a time 🕐');
    valid = false;
  } else {
    clearFieldError('timeError');
  }

  if (!typeVal) {
    showFieldError('dateType', 'typeError', 'Please choose a date type 💜');
    valid = false;
  } else {
    clearFieldError('typeError');
  }

  return valid;
}

function showFieldError(inputId, errId, msg) {
  $(errId).textContent = msg;
  const el = $(inputId);
  el.closest('.form-group').classList.add('shake');
  setTimeout(() => el.closest('.form-group').classList.remove('shake'), 500);
}

function clearFieldError(errId) {
  $(errId).textContent = '';
}

/* ──────────────────────────────────────────
   PAGE 4 — INVITATION CARD
────────────────────────────────────────── */
function buildInvitationCard() {
  $('invName').textContent = state.name;

  // Format date
  const dateObj = new Date(state.date + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  $('invDate').textContent = dateStr;

  // Format time
  const [h, m] = state.time.split(':');
  const hr  = parseInt(h, 10);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const hr12 = hr % 12 || 12;
  $('invTime').textContent = `${hr12}:${m} ${ampm}`;

  $('invType').textContent = state.dateType;

  // Populate hearts in card
  const heartEl = document.querySelector('.inv-hearts');
  heartEl.innerHTML = ['❤️','💜','💕','💖','💜','❤️'].map(h => `<span>${h}</span>`).join('');
}

function initInvitationPage() {
  // Share
  $('shareBtn').addEventListener('click', shareInvitation);

  // Copy text
  $('copyTextBtn').addEventListener('click', copyInvitationText);

  // QR Code
  $('generateQr').addEventListener('click', showQr);
  $('qrClose').addEventListener('click', () => { $('qrModal').hidden = true; });

  // Close QR on backdrop click
  $('qrModal').addEventListener('click', e => {
    if (e.target === $('qrModal')) $('qrModal').hidden = true;
  });
}

/* ── Share ── */
async function shareInvitation() {
  const text = buildInvitationText();
  if (navigator.share) {
    try {
      await navigator.share({ title: '💌 Our Date Invitation', text });
      showToast('✅ Shared successfully!');
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Sharing failed — try Copy Text instead.');
    }
  } else {
    await copyToClipboard(text);
    showToast('📋 Copied! Paste it anywhere to share.');
  }
}

/* ── Copy text ── */
async function copyInvitationText() {
  const text = buildInvitationText();
  await copyToClipboard(text);
  showToast('📋 Invitation text copied!');
}

function buildInvitationText() {
  const dateStr = new Date(state.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [h, m] = state.time.split(':');
  const hr12 = (parseInt(h,10) % 12) || 12;
  const ampm = parseInt(h,10) >= 12 ? 'PM' : 'AM';
  return `💌 OFFICIAL DATE INVITATION 💌

Dear ${state.name},

You are officially invited to a wonderful date.
Let's create beautiful memories together.

📅 Date: ${dateStr}
🕐 Time: ${hr12}:${m} ${ampm}
💜 Date Type: ${state.dateType}

I cannot wait to spend this special time with you.

With Love ❤️`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

/* ── QR Code ── */
function showQr() {
  const canvas = $('qrCanvas');
  canvas.innerHTML = '';

  const qrText = `Lavender Love Date Invitation\nName: ${state.name}\nDate: ${state.date}\nTime: ${state.time}\nType: ${state.dateType}`;

  try {
    new QRCode(canvas, {
      text: qrText,
      width: 200,
      height: 200,
      colorDark: '#B57EDC',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.M,
    });
    $('qrModal').hidden = false;
  } catch (err) {
    showToast('QR generation failed.');
    console.error(err);
  }
}

/* ──────────────────────────────────────────
   COUNTDOWN
────────────────────────────────────────── */
function startCountdown() {
  if (state.countdownInterval) clearInterval(state.countdownInterval);

  function tick() {
    const target = new Date(`${state.date}T${state.time}:00`);
    const now    = new Date();
    const diff   = target - now;

    if (diff <= 0) {
      $('cdDays').textContent  = '00';
      $('cdHours').textContent = '00';
      $('cdMins').textContent  = '00';
      $('cdSecs').textContent  = '00';
      clearInterval(state.countdownInterval);
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    $('cdDays').textContent  = String(days).padStart(2, '0');
    $('cdHours').textContent = String(hours).padStart(2, '0');
    $('cdMins').textContent  = String(mins).padStart(2, '0');
    $('cdSecs').textContent  = String(secs).padStart(2, '0');
  }

  tick();
  state.countdownInterval = setInterval(tick, 1000);
}

/* ──────────────────────────────────────────
   RELATIONSHIP METER
────────────────────────────────────────── */
function animateRelMeter() {
  const fill = $('relMeterFill');
  const pctEl = $('relMeterPct');
  const bar   = $('relMeterBar');

  if (state.relMeterInterval) clearInterval(state.relMeterInterval);

  // CSS transition drives the bar width; JS just counts the displayed number
  fill.style.width = '0%';
  // Force reflow so transition fires from 0
  void fill.offsetWidth;
  fill.style.width = '99.99%';

  let displayed = 0;
  const target  = 99.99;
  const duration = 3200; // matches CSS transition
  const start    = performance.now();

  state.relMeterInterval = setInterval(() => {
    const elapsed = performance.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out curve for the number
    displayed = target * (1 - Math.pow(1 - progress, 3));
    pctEl.textContent = displayed >= target ? '99.99%' : displayed.toFixed(1) + '%';
    bar.setAttribute('aria-valuenow', Math.round(displayed));

    if (progress >= 1) {
      clearInterval(state.relMeterInterval);
      pctEl.textContent = '99.99%';
      showToast('❤️ 99.99% Compatibility Confirmed!');
    }
  }, 100);
}

/* ──────────────────────────────────────────
   PARTICLES — Canvas
────────────────────────────────────────── */
const PARTICLE_POOL = [];
let   particleCtx, particleW, particleH, particleRAF;

function initParticles() {
  const canvas = $('particleCanvas');
  particleCtx = canvas.getContext('2d');
  resizeParticles();
  window.addEventListener('resize', resizeParticles, { passive: true });

  // Seed initial particles
  for (let i = 0; i < 18; i++) spawnParticle(true);

  animateParticles();
}

function resizeParticles() {
  const c = $('particleCanvas');
  particleW = c.width  = window.innerWidth;
  particleH = c.height = window.innerHeight;
}

function spawnParticle(randomY = false) {
  const types = ['❤️','💜','✨','💕','🌸','⭐','💫'];
  PARTICLE_POOL.push({
    x:    Math.random() * particleW,
    y:    randomY ? Math.random() * particleH : particleH + 20,
    vy:   -(0.4 + Math.random() * 0.7),
    vx:   (Math.random() - 0.5) * 0.4,
    size: 12 + Math.random() * 14,
    op:   0.5 + Math.random() * 0.4,
    rot:  Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.03,
    type: types[Math.floor(Math.random() * types.length)],
  });
}

function animateParticles() {
  particleCtx.clearRect(0, 0, particleW, particleH);

  for (let i = PARTICLE_POOL.length - 1; i >= 0; i--) {
    const p = PARTICLE_POOL[i];
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.vrot;

    particleCtx.save();
    particleCtx.globalAlpha = p.op;
    particleCtx.font = `${p.size}px serif`;
    particleCtx.translate(p.x, p.y);
    particleCtx.rotate(p.rot);
    particleCtx.fillText(p.type, -p.size / 2, p.size / 2);
    particleCtx.restore();

    // Fade out near top
    if (p.y < particleH * 0.2) p.op -= 0.004;

    if (p.y < -30 || p.op <= 0) {
      PARTICLE_POOL.splice(i, 1);
    }
  }

  // Maintain ~18 ambient particles
  if (PARTICLE_POOL.length < 18 && Math.random() < 0.06) spawnParticle();

  particleRAF = requestAnimationFrame(animateParticles);
}

/* ──────────────────────────────────────────
   CONFETTI BURST
────────────────────────────────────────── */
function fireConfetti(intensity = 1) {
  if (typeof confetti === 'undefined') return;

  const opts = {
    particleCount: Math.round(120 * intensity),
    spread: 80,
    origin: { x: 0.5, y: 0.55 },
    colors: ['#E6E6FA', '#B57EDC', '#FFD1DC', '#FFD700', '#FF69B4', '#FFFFFF'],
    ticks: 200,
    gravity: 0.7,
  };

  confetti(opts);

  // Side bursts
  setTimeout(() => {
    confetti({ ...opts, particleCount: 60, origin: { x: 0.1, y: 0.6 }, angle: 60 });
    confetti({ ...opts, particleCount: 60, origin: { x: 0.9, y: 0.6 }, angle: 120 });
  }, 200);
}

/* ──────────────────────────────────────────
   BURST HEARTS (DOM overlay)
────────────────────────────────────────── */
function burstHearts(count = 20) {
  const hearts = ['❤️','💜','💕','💖','💗','🌸'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.cssText = `
        position:fixed;
        left:${20 + Math.random() * 60}%;
        top:${30 + Math.random() * 40}%;
        font-size:${18 + Math.random() * 22}px;
        pointer-events:none;
        z-index:9999;
        animation: burstFly ${0.8 + Math.random() * 1}s ease forwards;
        opacity:1;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }, i * 50);
  }
}

function burstSparkles(count = 15) {
  const sparks = ['✨','⭐','💫','🌟'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.textContent = sparks[Math.floor(Math.random() * sparks.length)];
      el.style.cssText = `
        position:fixed;
        left:${10 + Math.random() * 80}%;
        top:${20 + Math.random() * 60}%;
        font-size:${14 + Math.random() * 18}px;
        pointer-events:none;
        z-index:9999;
        animation: burstFly ${0.6 + Math.random() * 0.8}s ease forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }, i * 60);
  }
}

/* Inject keyframe for bursts */
(function injectBurstKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes burstFly {
      0%   { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
      100% { transform: translateY(-120px) scale(0.2) rotate(${Math.random() > 0.5 ? '' : '-'}180deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

/* ──────────────────────────────────────────
   DECORATIVE HELPERS
────────────────────────────────────────── */
function placeMiniHearts(selector, count) {
  const containers = $$(selector);
  containers.forEach(container => {
    const hearts = ['❤️','💜','💕','🌸'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.textContent = hearts[i % hearts.length];
      el.style.cssText = `
        left:${5 + Math.random() * 90}%;
        top:${10 + Math.random() * 80}%;
        animation-delay:${Math.random() * 3}s;
        animation-duration:${2 + Math.random() * 2}s;
        opacity:${0.3 + Math.random() * 0.5};
      `;
      container.appendChild(el);
    }
  });
}

function placeCardSparkles() {
  const containers = $$('.card-sparkles');
  containers.forEach(container => {
    const sparks = ['✨','⭐','💫'];
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('span');
      el.textContent = sparks[i % sparks.length];
      el.style.cssText = `
        left:${Math.random() * 90}%;
        top:${Math.random() * 90}%;
        animation-delay:${Math.random() * 2.5}s;
        animation-duration:${1.5 + Math.random() * 2}s;
      `;
      container.appendChild(el);
    }
  });
}

function addFloatingHeartsToCard() {
  // PS section hearts — animated differently
  const ps = document.querySelector('.ps-hearts');
  if (!ps) return;
  const hearts = ['❤️','💜','💕','🌸','✨'];
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('span');
    el.textContent = hearts[i % hearts.length];
    el.style.cssText = `
      left:${Math.random() * 100}%;
      bottom: 0;
      animation-delay:${Math.random() * 4}s;
      animation-duration:${3 + Math.random() * 2}s;
      font-size:${14 + Math.random() * 10}px;
      opacity:${0.3 + Math.random() * 0.5};
    `;
    ps.appendChild(el);
  }

  // Easter egg hearts
  const eeHearts = document.querySelector('.easter-hearts');
  if (!eeHearts) return;
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('span');
    el.textContent = hearts[i % hearts.length];
    el.style.cssText = `
      left:${Math.random() * 100}%;
      bottom:0;
      animation-delay:${Math.random() * 2}s;
      animation-duration:${2 + Math.random() * 1.5}s;
      font-size:${16 + Math.random() * 14}px;
    `;
    eeHearts.appendChild(el);
  }
}

/* ──────────────────────────────────────────
   TOAST
────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg, duration = 2800) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ──────────────────────────────────────────
   EASTER EGG — Konami Code
────────────────────────────────────────── */
function initEasterEgg() {
  document.addEventListener('keydown', e => {
    state.easterSeq.push(e.key);
    if (state.easterSeq.length > KONAMI.length) state.easterSeq.shift();
    if (JSON.stringify(state.easterSeq) === JSON.stringify(KONAMI)) {
      triggerEasterEgg();
    }
  });

  $('easterClose').addEventListener('click', () => {
    $('easterModal').hidden = true;
  });

  $('easterModal').addEventListener('click', e => {
    if (e.target === $('easterModal')) $('easterModal').hidden = true;
  });
}

function triggerEasterEgg() {
  $('easterModal').hidden = false;
  fireConfetti(1.5);
  burstHearts(40);
  burstSparkles(30);
  showToast('🏆 Hopeless Romantic Achievement Unlocked!', 4000);
}

/* ──────────────────────────────────────────
   UTIL
────────────────────────────────────────── */
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
