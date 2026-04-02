document.addEventListener('DOMContentLoaded', () => {
  /* ===== DOM refs ===== */
  const startScreen    = document.getElementById('start-screen');
  const scene          = document.getElementById('scene');
  const playBtn        = document.getElementById('play-btn');
  const gameScreen     = document.getElementById('game-screen');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText    = document.getElementById('loading-text');
  const loadingBarFill = document.getElementById('loading-bar-fill');
  const backBtn        = document.getElementById('back-btn');
  const letsPlayBtn    = document.getElementById('lets-play-btn');
  const rulesScreen    = document.getElementById('rules-screen');
  const gameBoard      = document.getElementById('game-board');
  const cardGrid       = document.getElementById('card-grid');
  const timerEl        = document.getElementById('timer');
  const pairsEl        = document.getElementById('pairs-counter');

  // End screens
  const endWin         = document.getElementById('end-win');
  const endPartial     = document.getElementById('end-partial');
  const endDefeat      = document.getElementById('end-defeat');
  const endWinTime     = document.getElementById('end-win-time');
  const endPartialPairs = document.getElementById('end-partial-pairs');
  const retryPartialBtn = document.getElementById('retry-partial-btn');
  const retryDefeatBtn  = document.getElementById('retry-defeat-btn');

  /* ===== Game state ===== */
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let lockBoard = false;
  let timerInterval = null;
  let timeLeft = 90;
  const TOTAL_TIME = 90;

  const promoAt = { 2: 'promo-1', 6: 'promo-2', 8: 'promo-3' };

  /* ===== Helpers ===== */
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `TIME ${m}:${s}`;
  }

  function formatTimePlain(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  /* ======================================================
     START SCREEN → GAME SCREEN
     ====================================================== */
  playBtn.addEventListener('click', () => {
    playBtn.classList.add('fade-out');
    setTimeout(() => {
      loadingOverlay.classList.remove('hidden');
      startZoomSequence();
    }, 300);
  });

  function startZoomSequence() {
    const duration = 3000;
    const startScale = 1;
    const endScale = 7;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(raw);
      scene.style.transform = `scale(${startScale + (endScale - startScale) * eased})`;

      const pct = Math.floor(eased * 100);
      loadingText.textContent = `LOADING... ${pct}%`;
      loadingBarFill.style.width = `${pct}%`;

      if (raw < 1) {
        requestAnimationFrame(animate);
      } else {
        finishTransition();
      }
    }
    requestAnimationFrame(animate);
  }

  function finishTransition() {
    const flash = document.createElement('div');
    flash.className = 'white-flash';
    document.body.appendChild(flash);
    requestAnimationFrame(() => flash.classList.add('active'));

    setTimeout(() => {
      startScreen.style.display = 'none';
      gameScreen.classList.remove('hidden');
      flash.classList.remove('active');
      setTimeout(() => flash.remove(), 400);
    }, 350);
  }

  /* ======================================================
     BACK BUTTON → return to start
     ====================================================== */
  backBtn.addEventListener('click', () => {
    stopTimer();
    hideAllEndScreens();
    gameScreen.classList.add('hidden');
    startScreen.style.display = '';
    scene.style.transform = '';
    playBtn.classList.remove('fade-out');
    loadingOverlay.classList.add('hidden');
    loadingBarFill.style.width = '0%';
    loadingText.textContent = 'LOADING... 0%';
    rulesScreen.classList.remove('hidden');
    gameBoard.classList.add('hidden');
    resetGame();
  });

  /* ======================================================
     LET'S PLAY → start the memo game
     ====================================================== */
  const gameLoader = document.getElementById('game-loader');

  letsPlayBtn.addEventListener('click', () => {
    rulesScreen.classList.add('hidden');
    gameLoader.classList.remove('hidden');
    setTimeout(() => {
      gameLoader.classList.add('hidden');
      gameBoard.classList.remove('hidden');
      initGame();
    }, 1200);
  });

  /* ======================================================
     RETRY buttons
     ====================================================== */
  retryPartialBtn.addEventListener('click', () => retryGame());
  retryDefeatBtn.addEventListener('click', () => retryGame());

  function retryGame() {
    hideAllEndScreens();
    gameBoard.classList.remove('hidden');
    initGame();
  }

  /* ======================================================
     GAME LOGIC
     ====================================================== */
  function initGame() {
    resetGame();
    buildCards();
    startTimer();
  }

  function resetGame() {
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    lockBoard = false;
    timeLeft = TOTAL_TIME;
    timerEl.textContent = formatTime(timeLeft);
    pairsEl.textContent = 'PAIRS 0/8';
    cardGrid.innerHTML = '';

    document.getElementById('promo-1').classList.add('hidden');
    document.getElementById('promo-2').classList.add('hidden');
    document.getElementById('promo-3').classList.add('hidden');
  }

  function hideAllEndScreens() {
    endWin.classList.add('hidden');
    endPartial.classList.add('hidden');
    endDefeat.classList.add('hidden');
  }

  function buildCards() {
    const ids = [];
    for (let i = 1; i <= 8; i++) { ids.push(i, i); }
    shuffle(ids);

    ids.forEach((imgId) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.cardId = imgId;

      card.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-back">
            <img src="image/обложкакарты.png" alt="Card back">
          </div>
          <div class="card-face card-front">
            <img src="image/${imgId}.png" alt="Card ${imgId}">
          </div>
        </div>
      `;

      card.addEventListener('click', () => flipCard(card));
      cardGrid.appendChild(card);
      cards.push(card);
    });
  }

  function flipCard(card) {
    if (lockBoard) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      lockBoard = true;
      checkMatch();
    }
  }

  function checkMatch() {
    const [a, b] = flippedCards;
    const isMatch = a.dataset.cardId === b.dataset.cardId;

    if (isMatch) {
      a.classList.add('matched');
      b.classList.add('matched');
      matchedPairs++;
      pairsEl.textContent = `PAIRS ${matchedPairs}/8`;

      if (promoAt[matchedPairs]) {
        document.getElementById(promoAt[matchedPairs]).classList.remove('hidden');
      }

      flippedCards = [];
      lockBoard = false;

      // All 8 pairs → full win
      if (matchedPairs === 8) {
        stopTimer();
        setTimeout(() => showEndScreen(), 600);
      }
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flippedCards = [];
        lockBoard = false;
      }, 900);
    }
  }

  /* ===== Timer ===== */
  function startTimer() {
    timerEl.textContent = formatTime(timeLeft);
    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = formatTime(timeLeft);
      if (timeLeft <= 0) {
        stopTimer();
        lockBoard = true;
        setTimeout(() => showEndScreen(), 400);
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  /* ======================================================
     END SCREEN LOGIC
     ====================================================== */
  function showEndScreen() {
    gameBoard.classList.add('hidden');

    if (matchedPairs === 8) {
      // Full win
      const elapsed = TOTAL_TIME - timeLeft;
      endWinTime.textContent = `Time: ${formatTimePlain(elapsed)}`;
      showWinPromos();
      endWin.classList.remove('hidden');
    } else if (matchedPairs > 0) {
      // Partial win
      endPartialPairs.textContent = `Pairs: ${matchedPairs}/8`;
      showPartialPromos();
      endPartial.classList.remove('hidden');
    } else {
      // Defeat
      endDefeat.classList.remove('hidden');
    }
  }

  /* Show all 3 prize cards on the full-win screen */
  function showWinPromos() {
    // All prizes are always visible in HTML for full win
  }

  /* Build partial promos dynamically based on earned codes */
  function showPartialPromos() {
    const container = document.getElementById('end-partial-promos');
    container.innerHTML = '';

    const earned = [];
    if (matchedPairs >= 2) earned.push({ n: 1, code: 'KICK10', desc: '10% off your first order' });
    if (matchedPairs >= 6) earned.push({ n: 2, code: 'MATCHDAY15', desc: '15% off any kit' });

    earned.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'prize-card';
      card.innerHTML = `
        <div class="prize-header">Your prize #${p.n}</div>
        <div class="prize-body">
          <div class="prize-row">
            <span class="prize-code">${p.code}</span>
            <span class="prize-desc">${p.desc}</span>
          </div>
          <button class="copy-btn" data-code="${p.code}">Copy promo</button>
        </div>
      `;
      container.appendChild(card);
    });

    // Attach copy handlers for dynamically created buttons
    container.querySelectorAll('.copy-btn').forEach(attachCopyHandler);
  }

  /* ===== Copy promo to clipboard ===== */
  function attachCopyHandler(btn) {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '✓';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy promo';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  // Attach copy handlers for static prize cards (full-win screen)
  document.querySelectorAll('#end-win-promos .copy-btn').forEach(attachCopyHandler);
});
