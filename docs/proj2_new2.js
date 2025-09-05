let image_dictionary = {
  0: 'COURAGE_CN.png',
  1: 'H_HENRY.jpeg',
  2: 'JERRY.jpeg',
  3: 'MR.png',
  4: 'OGGY.png',
  5: 'TOM.png'
};

const main = document.getElementById('main');
const timerEl = document.getElementById('timer');
const hintBtn = document.getElementById('hint-btn');
const navbar = document.getElementById('navbar');
const scoreEl = document.getElementById('score');

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;

let timerStarted = false;
let totalSeconds = 300;
let timerInterval = null;

let hintCount = 5;
let score = 0;

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function preloadImages() {
  Object.values(image_dictionary).forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

function generateImageArray() {
  const arr = [];
  for (let idx = 0; idx < 6; idx++) {
    for (let rep = 0; rep < 10; rep++) {
      arr.push(idx);
    }
  }
  shuffleArray(arr);
  return arr;
}

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const hh = h < 10 ? '0' + h : h;
  const mm = m < 10 ? '0' + m : m;
  const ss = s < 10 ? '0' + s : s;
  return `${hh}:${mm}:${ss}`;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerStarted = false;
  totalSeconds = 300;
  timerEl.textContent = formatTime(totalSeconds);
  timerEl.classList.remove('warning');
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerInterval = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      timerEl.textContent = formatTime(totalSeconds);
      if (totalSeconds <= 10) {
        timerEl.classList.add('warning');
      }
    } else {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  lockBoard = true;
  hintBtn.disabled = true;

  // Freeze all cards so no more clicks/hover effects:
  document.querySelectorAll('.boxes').forEach(card => {
    card.classList.add('frozen');
  });

  // Show final score or message
 showOutro();
}

function showOutro() {
  const outro = document.getElementById('outro');
  const outroScoreDiv = document.getElementById('outro-score');
  // Set final score
  outroScoreDiv.textContent = score;
  // Show overlay
  outro.classList.add('show');

  // Hook Play Again button
  const playAgainBtn = document.getElementById('play-again-btn');
playAgainBtn.onclick = () => {
  // Fade out
  outro.classList.remove('show');
  outro.classList.add('hide');
  setTimeout(() => {
    outro.classList.remove('hide');
    // outro.style.display = 'none'; // or ensure show class removed
    resetGameAndBoard();
  }, 500);
};
}

// A helper to reset the game state fully and rebuild
function resetGameAndBoard() {
  // Remove frozen class from cards (if any remain)
  document.querySelectorAll('.boxes').forEach(card => {
    card.classList.remove('frozen', 'matched');
  });
  // Reset timer and score etc.
  resetTimer();
  matchesFound = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  hintCount = 5;
  hintBtn.disabled = false;
  hintBtn.textContent = 'HINT(5)';
  score = 0;
  scoreEl.textContent = `Score: ${score}`;
  // Rebuild board (reshuffle)
  buildBoard();
}

function buildBoard() {
  main.innerHTML = '';
  const image_arr = generateImageArray();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 60; i++) {
    const outer = document.createElement('div');
    outer.classList.add('boxes');
    outer.id = `card-${i+1}`;
    outer.dataset.imageIndex = image_arr[i];
    const inner = document.createElement('div');
    inner.classList.add('card-inner');
    const back = document.createElement('div');
    back.classList.add('card-back');
    const front = document.createElement('div');
    front.classList.add('card-front');
    front.style.backgroundImage = '';
    front.textContent = '';
    inner.appendChild(back);
    inner.appendChild(front);
    outer.appendChild(inner);
    frag.appendChild(outer);
  }
  main.appendChild(frag);
  document.querySelectorAll('.boxes').forEach(card => {
    card.addEventListener('click', handleCardClick);
  });
  resetTimer();
  matchesFound = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  hintCount = 5;
  hintBtn.disabled = false;
  hintBtn.textContent = 'HINT(5)';
  score = 0;
  scoreEl.textContent = `Score: ${score}`;
}

function handleCardClick(e) {
  if (lockBoard) return;
  if (!timerStarted) startTimer();
  const outer = e.currentTarget;
  if (outer.classList.contains('matched')) return;
  if (firstCard && outer.id === firstCard.outer.id) return;
  const inner = outer.querySelector('.card-inner');
  const front = outer.querySelector('.card-front');
  const idx = outer.dataset.imageIndex;
  front.style.backgroundImage = `url('${image_dictionary[idx]}')`;
  front.style.backgroundSize = 'contain';
  inner.classList.add('flipped');
  if (!firstCard) {
    firstCard = { outer, inner, idx };
  } else {
    secondCard = { outer, inner, idx };
    lockBoard = true;
    if (firstCard.idx === secondCard.idx) {
      handleMatch();
    } else {
      handleMismatch();
    }
  }
}

function handleMatch() {
  setTimeout(() => {
    [firstCard, secondCard].forEach(c => {
      c.outer.classList.add('matched');
      c.inner.classList.add('flipped');
      const front = c.outer.querySelector('.card-front');
      front.textContent = '';
      const tick = document.createElement('span');
      tick.classList.add('tick');
      tick.textContent = '✔';
      front.appendChild(tick);
    });
    matchesFound++;
    // Float +5 from center
    displayFloating('+5', 'up');
    score += 5;
    scoreEl.textContent = `Score: ${score}`;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    if (matchesFound === 30) endGame();
  }, 1000);
}

function handleMismatch() {
  const [c1, c2] = [firstCard, secondCard];
  // 1) Keep both cards face-up (they already are), wait so player can see second image
  setTimeout(() => {
    // 2) Now apply vibration
    c1.inner.classList.add('vibrate');
    c2.inner.classList.add('vibrate');
    // After vibration duration, flip back
    setTimeout(() => {
      [c1, c2].forEach(c => {
        c.inner.classList.remove('vibrate');
        c.inner.classList.remove('flipped');
        const front = c.outer.querySelector('.card-front');
        front.style.backgroundImage = '';
        front.textContent = '';
      });
      firstCard = null;
      secondCard = null;
      lockBoard = false;
    }, 300);  // vibration lasts 300ms (match your CSS animation duration)
  }, 1000); // show second image for 1000ms before shaking; adjust as desired
}

function displayFloating(text, dir) {
  const span = document.createElement('span');
  span.textContent = text;
  if (dir === 'up') {
    span.classList.add('float-up');
    span.style.left = `50%`;
    span.style.top = `50%`;
    span.style.transform = 'translate(-50%, -50%)';
  } else {
    span.classList.add('float-down');
    const rectBtn = hintBtn.getBoundingClientRect();
    const rectNav = navbar.getBoundingClientRect();
    const left = rectBtn.left - rectNav.left + rectBtn.width / 2;
    const top = rectBtn.bottom - rectNav.top;
    span.style.left = `${left}px`;
    span.style.top = `${top}px`;
    span.style.transform = 'translateX(-50%)';
  }
  navbar.appendChild(span);
  setTimeout(() => {
    navbar.removeChild(span);
  }, 1000);
}

hintBtn.addEventListener('click', () => {
  if (hintCount <= 0 || lockBoard) return;
  if (firstCard) {
    firstCard.inner.classList.remove('flipped');
    const front = firstCard.outer.querySelector('.card-front');
    front.style.backgroundImage = '';
    firstCard = null;
  }
  lockBoard = true;
  document.querySelectorAll('.boxes:not(.matched)').forEach(outer => {
    const inner = outer.querySelector('.card-inner');
    const front = outer.querySelector('.card-front');
    const idx = outer.dataset.imageIndex;
    front.style.backgroundImage = `url('${image_dictionary[idx]}')`;
    front.style.backgroundSize = 'contain';
    inner.classList.add('flipped');
  });
  // Float -2 near hint button
  displayFloating('-2', 'down');
  score -= 2;
  scoreEl.textContent = `Score: ${score}`;
  hintCount--;
  hintBtn.textContent = `HINT(${hintCount})`;
  if (hintCount <= 0) {
    hintBtn.disabled = true;
  }
  setTimeout(() => {
    document.querySelectorAll('.boxes:not(.matched)').forEach(outer => {
      const inner = outer.querySelector('.card-inner');
      const front = outer.querySelector('.card-front');
      inner.classList.remove('flipped');
      front.style.backgroundImage = '';
      front.textContent = '';
    });
    lockBoard = false;
  }, 2000);
});

// --------------- Intro overlay handling ---------------
// Wait for DOMContentLoaded so intro elements exist
window.addEventListener('DOMContentLoaded', () => {
  const loaderBar = document.querySelector('.loader-bar');
  const intro = document.getElementById('intro');
  if (loaderBar && intro) {
    loaderBar.addEventListener('animationend', () => {
      // After the 5s loading animation completes, fade out the intro
      intro.classList.add('fade-out');
      // After fade-out duration (0.5s in CSS), remove intro
      setTimeout(() => {
        if (intro.parentNode) {
          intro.parentNode.removeChild(intro);
        }
        // The game was already initialized (on window.load). If you wish to
        // initialize only now, you could call preloadImages() and buildBoard() here.
      }, 500);
    });
  }
});

// Existing initialization on window load
window.addEventListener('load', () => {
  preloadImages();
  buildBoard();
});
