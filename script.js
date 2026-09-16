/* =========================================================
   ДАТКАЙЫМДЫН КЫЗ УЗАТУУСУ — invitation logic
   Change everything guest-facing right here in invitationData.
   ========================================================= */

const invitationData = {
  brideName: "Даткайым",
  eventTitle: "Даткайымдын кыз узатуусу",

  // Countdown target — ISO date + time, 24h format
  date: "2026-12-20",          // YYYY-MM-DD
  time: "17:00",                // HH:MM

  // What guests see in the details section (edit freely, any format)
  displayDate: "20-декабрь, 2026-жыл",
  displayTime: "17:00",

  venue: "\u00abАсман Пэлас\u00bb той толгону",
  address: "Бишкек шаары, Чүй проспекти 123",
  mapLink: "https://maps.google.com/?q=Bishkek",

  music: "music.mp3",

  program: [
    { time: "18:00", label: "Конокторду тосуп алуу" },
    { time: "18:30", label: "Кыз узатуу аземи" },
    { time: "19:30", label: "Тамактануу" },
    { time: "20:30", label: "Каалоо-тилектер" },
    { time: "21:30", label: "Музыкалык программа" },
  ],
};

// Google Form that quietly collects RSVP responses into a Google Sheet.
// Get these values from Google Forms: ⋮ menu → "Get pre-filled link" →
// fill dummy answers → copy link → the entry.XXXXXXX numbers are below.
const googleFormConfig = {
  formId: "1FAIpQLSdcFJGIJvC8RLE5Dp-fU_yvQxjNYP49nU3detifd7Fl91DK7A",
  entries: {
    name: "entry.1346962006",
    attendance: "entry.1044444492",
    guests: "entry.785782901",
    message: "entry.1948446755",
  },
  // Must match the exact option text used in the Google Form's
  // "Келесизби?" multiple-choice question.
  attendanceLabels: {
    yes: "Келем",
    no: "Келе албайм",
  },
};

const galleryImages = [
  "images/photo1.jpg",
  "images/photo2.jpg",
  "images/photo3.jpg",
  "images/photo4.jpg",
  "images/photo5.jpg",
  "images/photo6.jpg",
];

/* =========================================================
   DEVICE CAPABILITY CHECK — reduce heavy effects on weak devices
   ========================================================= */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isWeakDevice =
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
  /Android [4-7]\./.test(navigator.userAgent);
const lowPowerMode = prefersReducedMotion || isWeakDevice;

/* =========================================================
   3D GOLD PARTICLE FIELD (Three.js)
   A soft field of drifting gold dust behind the whole page,
   with a slow orbiting camera for real parallax depth.
   ========================================================= */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!window.THREE || prefersReducedMotion) {
    canvas.style.display = 'none';
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 12;

  const count = isWeakDevice ? 140 : 340;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    sizes[i] = Math.random() * 2 + 0.6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0xE9C98B,
    size: 0.09,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let t = 0;
  let frameSkip = 0;
  function animate() {
    requestAnimationFrame(animate);
    // throttle on weak devices
    if (isWeakDevice) {
      frameSkip++;
      if (frameSkip % 2 !== 0) return;
    }
    t += 0.0022;
    points.rotation.y = t * 0.6;
    points.rotation.x = Math.sin(t * 0.4) * 0.08;
    camera.position.x = Math.sin(t * 0.5) * 1.2;
    camera.position.y = Math.cos(t * 0.35) * 0.6;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* =========================================================
   DOOR OPENING SCENE
   ========================================================= */
function initDoorScene() {
  document.body.classList.add('lock-scroll');

  const openBtn = document.getElementById('openInvitation');
  const doorLeft = document.getElementById('doorLeft');
  const doorRight = document.getElementById('doorRight');
  const doorFrame = document.querySelector('.door-frame');
  const splash = document.getElementById('splash');
  const splashText = document.getElementById('splashText');
  const splashHint = document.getElementById('splashHint');
  const mainContent = document.getElementById('main-content');
  const musicBtn = document.getElementById('music-toggle');

  openBtn.addEventListener('click', () => {
    openBtn.disabled = true;
    splashText.classList.add('fading');
    splashHint.style.opacity = '0';

    doorLeft.classList.add('open');
    doorRight.classList.add('open');
    doorFrame.classList.add('opened');

    burstGoldParticlesDOM();

    setTimeout(() => {
      document.body.classList.remove('lock-scroll');
      splash.classList.add('closed');
      mainContent.classList.add('visible');
      musicBtn.classList.remove('hidden');
      initRevealObservers();
    }, 1500);
  }, { once: true });
}

/* A quick DOM-based gold particle burst at the moment the doors open,
   independent from the Three.js field, for an immediate flash of magic. */
function burstGoldParticlesDOM() {
  const burstCount = lowPowerMode ? 10 : 26;
  const stage = document.querySelector('.door-stage');
  for (let i = 0; i < burstCount; i++) {
    const p = document.createElement('span');
    const size = 3 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 160;
    p.style.cssText = `
      position:absolute; left:50%; top:45%;
      width:${size}px; height:${size}px; border-radius:50%;
      background: radial-gradient(circle, #FBF0CE, #C9A66B 70%, transparent);
      pointer-events:none; z-index:20; opacity:0.95;
      transition: transform 1.3s cubic-bezier(0.22,1,0.36,1), opacity 1.3s ease;
    `;
    stage.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 40}px)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 1400);
  }
}

/* =========================================================
   COUNTDOWN
   ========================================================= */
function initCountdown() {
  const target = new Date(`${invitationData.date}T${invitationData.time}:00`);
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
}

/* =========================================================
   POPULATE CONTENT FROM CONFIG
   ========================================================= */
function populateContent() {
  document.getElementById('detail-date').textContent = invitationData.displayDate;
  document.getElementById('detail-time').textContent = invitationData.displayTime;
  document.getElementById('detail-venue').textContent = invitationData.venue;

  document.getElementById('venue-name').textContent = invitationData.venue;
  document.getElementById('venue-address').textContent = invitationData.address;
  document.getElementById('venue-map-link').href = invitationData.mapLink;

  const timeline = document.getElementById('timeline');
  timeline.innerHTML = invitationData.program.map(item => `
    <div class="tl-item">
      <div class="tl-time">${item.time}</div>
      <div class="tl-label">${item.label}</div>
    </div>
  `).join('');
}

/* =========================================================
   GALLERY + LIGHTBOX
   ========================================================= */
let currentLightboxIndex = 0;

function initGallery() {
  const grid = document.getElementById('galleryGrid');

  grid.innerHTML = galleryImages.map((src, i) => `
    <div class="gallery-item" data-index="${i}">
      <div class="gallery-placeholder">
        <span class="icon">✦</span>
        <span>Сүрөт ${i + 1}</span>
      </div>
      <img src="${src}" alt="Сүрөт ${i + 1}" loading="lazy"
           onload="this.classList.add('loaded')"
           onerror="this.style.display='none'">
    </div>
  `).join('');

  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index, 10)));
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  function openLightbox(index) {
    currentLightboxIndex = index;
    lightboxImg.src = galleryImages[index];
    lightbox.classList.remove('hidden');
  }
  function closeLightbox() { lightbox.classList.add('hidden'); }
  function showRelative(delta) {
    currentLightboxIndex = (currentLightboxIndex + delta + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentLightboxIndex];
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  prevBtn.addEventListener('click', () => showRelative(-1));
  nextBtn.addEventListener('click', () => showRelative(1));

  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelative(-1);
    if (e.key === 'ArrowRight') showRelative(1);
  });

  // mobile swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 40) showRelative(dx > 0 ? -1 : 1);
  }, { passive: true });
}

/* =========================================================
   MUSIC TOGGLE
   ========================================================= */
function initMusic() {
  const btn = document.getElementById('music-toggle');
  const audio = document.getElementById('bgMusic');
  audio.src = invitationData.music;

  let playing = false;
  btn.addEventListener('click', () => {
    if (!playing) {
      audio.play().catch(() => { /* file missing or blocked — silently ignore */ });
      btn.classList.add('playing');
    } else {
      audio.pause();
      btn.classList.remove('playing');
    }
    playing = !playing;
  });
}

/* =========================================================
   RSVP FORM
   ========================================================= */
function initRSVP() {
  const form = document.getElementById('rsvpForm');
  const yesBtn = document.getElementById('rsvpYes');
  const noBtn = document.getElementById('rsvpNo');
  const status = document.getElementById('rsvpStatus');
  let attendance = null;

  function selectChoice(value) {
    attendance = value;
    yesBtn.classList.toggle('selected', value === 'yes');
    noBtn.classList.toggle('selected', value === 'no');
  }

  yesBtn.addEventListener('click', () => selectChoice('yes'));
  noBtn.addEventListener('click', () => selectChoice('no'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('rsvpName').value.trim();
    const guests = document.getElementById('rsvpGuests').value;
    const message = document.getElementById('rsvpMessage').value.trim();

    if (!name) {
      status.textContent = 'Атыңызды жазыңыз.';
      status.classList.add('error');
      return;
    }
    if (!attendance) {
      status.textContent = 'Келерин же келбесин тандаңыз.';
      status.classList.add('error');
      return;
    }

    const response = {
      name,
      attendance,
      guests: attendance === 'yes' ? guests : 0,
      message,
      submittedAt: new Date().toISOString(),
    };

    // Local backup copy, in case the Google Form submission fails silently.
    const stored = JSON.parse(localStorage.getItem('rsvpResponses') || '[]');
    stored.push(response);
    localStorage.setItem('rsvpResponses', JSON.stringify(stored));

    // Send the response to the Google Form → Google Sheet, without the
    // guest ever seeing the Google Forms page. Google Forms does not
    // send CORS headers, so the response can't be read here — that's
    // expected, "no-cors" mode still delivers the submission.
    const gf = googleFormConfig;
    const formBody = new URLSearchParams({
      [gf.entries.name]: name,
      [gf.entries.attendance]: gf.attendanceLabels[attendance],
      [gf.entries.guests]: response.guests,
      [gf.entries.message]: message,
    });

    fetch(`https://docs.google.com/forms/d/e/${gf.formId}/formResponse`, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    }).catch(() => { /* network hiccup — local backup above still has it */ });

    status.classList.remove('error');
    status.textContent = attendance === 'yes'
      ? 'Рахмат! Жообуңуз катталды, сизди күтөбүз ❤️'
      : 'Рахмат, жообуңуз үчүн!';
    form.reset();
    selectChoice(null);
  });
}

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
function initRevealObservers() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('.reveal, .tl-item').forEach(el => observer.observe(el));
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  populateContent();
  initCountdown();
  initGallery();
  initMusic();
  initRSVP();
  initParticles();
  initDoorScene();
});
