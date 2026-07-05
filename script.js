// The actual result — this is the gender the site lands on after the "SIKE!" moment.
const CORRECT_GENDER = 'boy';
const WRONG_GENDER = CORRECT_GENDER === 'boy' ? 'girl' : 'boy';

const boyPhoto = document.getElementById('photo-boy');
const girlPhoto = document.getElementById('photo-girl');
const winnerPhoto = document.getElementById('photo-winner');
const revealBtn = document.getElementById('reveal-btn');
const sikeOverlay = document.getElementById('sike-overlay');
const resultEl = document.getElementById('result');
const stage = document.getElementById('stage');

const photos = { boy: boyPhoto, girl: girlPhoto, winner: winnerPhoto };

const config = window.IMAGE_CONFIG || {};
boyPhoto.src = config.boy || '';
girlPhoto.src = config.girl || '';
winnerPhoto.src = config.winner || '';

let cycleTimer = null;
let currentlyShown = 'girl';

function show(name) {
  currentlyShown = name;
  Object.entries(photos).forEach(([key, el]) => el.classList.toggle('active', key === name));
}

function startCycling() {
  cycleTimer = setInterval(() => {
    show(currentlyShown === 'boy' ? 'girl' : 'boy');
  }, 900);
}

function stopCycling() {
  clearInterval(cycleTimer);
  cycleTimer = null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fast flicker that decelerates, like a slot machine slowing down.
function buildFlickerDelays() {
  const delays = [];
  let delay = 70;
  for (let i = 0; i < 16; i++) {
    delays.push(Math.round(delay));
    delay *= 1.22;
  }
  return delays;
}

async function runFlicker() {
  const delays = buildFlickerDelays();
  const n = delays.length;
  for (let i = 0; i < n; i++) {
    // Guarantees the sequence lands on WRONG_GENDER on the final frame.
    const gender = (n - 1 - i) % 2 === 0 ? WRONG_GENDER : CORRECT_GENDER;
    show(gender);
    await sleep(delays[i]);
  }
  show(WRONG_GENDER);
}

function spawnConfetti(gender) {
  const colors = gender === 'boy'
    ? ['#5b9bf0', '#8fc7ff', '#c9e4ff', '#ffffff']
    : ['#f76fa0', '#ffb6ce', '#ffe0ec', '#ffffff'];

  for (let i = 0; i < 70; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2 + Math.random() * 2 + 's';
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
}

async function handleReveal() {
  revealBtn.disabled = true;
  revealBtn.textContent = 'No peeking...';
  stopCycling();

  await runFlicker();

  // Hold on the wrong photo for a couple seconds to sell it.
  await sleep(2200);

  sikeOverlay.classList.add('show');
  await sleep(1600);
  sikeOverlay.classList.remove('show');
  await sleep(300);

  show(CORRECT_GENDER);
  stage.classList.add(CORRECT_GENDER === 'boy' ? 'reveal-boy' : 'reveal-girl');
  resultEl.textContent = CORRECT_GENDER === 'boy' ? "IT'S A BOY!" : "IT'S A GIRL!";
  resultEl.classList.add('show');
  spawnConfetti(CORRECT_GENDER);

  revealBtn.classList.add('hidden');

  // Grand finale: fade from the gender photo to the winning family photo.
  await sleep(2800);
  show('winner');
  resultEl.textContent = 'Welcome to the family!';
}

show('girl');
startCycling();
revealBtn.addEventListener('click', handleReveal);
