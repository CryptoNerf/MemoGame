document.addEventListener('DOMContentLoaded', () => {
  /* ======================================================
     TRANSLATIONS
     Static text: elements with data-i18n="key" (plain text)
     or data-i18n-html="key" (text with <br>).
     Dynamic text (timer, pairs, loading...) is built in render().
     ====================================================== */
  const I18N = {
    en: {
      play: 'PLAY GAME',
      loading: 'LOADING...',
      back: '<-- Back',
      time: 'TIME',
      pairs: 'PAIRS',
      rules: "Hey player! Let's play MEMO. Match all 8 pairs to win exclusive promo codes. 3 prizes are hidden inside. Can you find them all?",
      letsPlay: "LET'S PLAY",
      dealing: 'DEALING CARDS...',
      promo1Header: 'PromoCode#1',
      promo2Header: 'PromoCode#2',
      promo3Header: 'PromoCode#3',
      promo1Body: 'KICK10 — «10% off your first order»',
      promo2Body: 'MATCHDAY15 — «15% off any kit»',
      promo3Body: 'SEASON25 — «25% off sitewide. Season special.»',
      winHeader: 'Congratulations!',
      winTitle: 'YOU WIN!',
      winTime: 'Time',
      winText: 'New season. New kit. MATCHDAY.<br>Use your promo codes at checkout.',
      shopNow: 'SHOP NOW',
      prize1Header: 'Your prize #1',
      prize2Header: 'Your prize #2',
      prize3Header: 'Your prize #3',
      prize1Desc: '10% off your first order',
      prize2Desc: '15% off any kit',
      prize3Desc: '25% off. Season special.',
      copy: 'Copy promo',
      partialHeader: 'Not bad!',
      partialTitle: 'ALMOST!',
      partialPairs: 'Pairs',
      partialTextEarned: 'You earned some promo codes!<br>But you can win more. Try again?',
      partialTextNone: 'Match 2 pairs to unlock your first promo code.<br>Try again?',
      retryPartial: 'RETRY',
      defeatHeader: 'Try again!',
      defeatTitle: 'Defeat',
      defeatText: "Time's up.",
      retryDefeat: 'Retry',
      copyright: 'copyright "MATCHDAY" company.',
    },
    ru: {
      play: 'ИГРАТЬ',
      loading: 'ЗАГРУЗКА...',
      back: '<-- Назад',
      time: 'ВРЕМЯ',
      pairs: 'ПАРЫ',
      rules: 'Привет, игрок! Давай сыграем в MEMO. Найди все 8 пар и получи эксклюзивные промокоды. Внутри спрятаны 3 приза. Сможешь найти их все?',
      letsPlay: 'ПОГНАЛИ',
      dealing: 'РАЗДАЁМ КАРТЫ...',
      promo1Header: 'Промокод #1',
      promo2Header: 'Промокод #2',
      promo3Header: 'Промокод #3',
      promo1Body: 'KICK10 — «−10% на первый заказ»',
      promo2Body: 'MATCHDAY15 — «−15% на любую форму»',
      promo3Body: 'SEASON25 — «−25% на весь ассортимент. Сезонное предложение.»',
      winHeader: 'Поздравляем!',
      winTitle: 'ПОБЕДА!',
      winTime: 'Время',
      winText: 'Новый сезон. Новая форма. MATCHDAY.<br>Используй промокоды при оформлении заказа.',
      shopNow: 'В МАГАЗИН',
      prize1Header: 'Твой приз #1',
      prize2Header: 'Твой приз #2',
      prize3Header: 'Твой приз #3',
      prize1Desc: '−10% на первый заказ',
      prize2Desc: '−15% на любую форму',
      prize3Desc: '−25%. Сезонное предложение.',
      copy: 'Скопировать',
      partialHeader: 'Неплохо!',
      partialTitle: 'ПОЧТИ!',
      partialPairs: 'Пары',
      partialTextEarned: 'Промокоды уже у тебя!<br>Но можно выиграть больше. Ещё раз?',
      partialTextNone: 'Найди 2 пары, чтобы открыть первый промокод.<br>Ещё раз?',
      retryPartial: 'ЕЩЁ РАЗ',
      defeatHeader: 'Попробуй ещё!',
      defeatTitle: 'Поражение',
      defeatText: 'Время вышло.',
      retryDefeat: 'Ещё раз',
      copyright: '© компания «MATCHDAY».',
    },
  };

  const LANG_KEY = 'matchday-memo-lang';
  let lang = detectLang();

  function detectLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && I18N[saved]) return saved;
    } catch (e) { /* storage blocked — fall through */ }
    const browser = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    return /^(ru|be|uk|kk)\b/i.test(browser) ? 'ru' : 'en';
  }

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? key;
  }

  function setLang(next) {
    if (!I18N[next]) return;
    lang = next;
    try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* ignore */ }
    applyLang();
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      // don't overwrite a copy button while it shows "✓"
      if (el.classList.contains('copied')) return;
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('.lang-switch button').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
    render();
  }

  document.querySelectorAll('.lang-switch button').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  /* ===== DOM refs ===== */
  const startScreen    = document.getElementById('start-screen');
  const scene          = document.getElementById('scene');
  const playBtn        = document.getElementById('play-btn');
  const langSwitchStart = document.getElementById('lang-switch-start');
  const gameScreen     = document.getElementById('game-screen');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText    = document.getElementById('loading-text');
  const loadingBarFill = document.getElementById('loading-bar-fill');
  const backBtn        = document.getElementById('back-btn');
  const letsPlayBtn    = document.getElementById('lets-play-btn');
  const rulesScreen    = document.getElementById('rules-screen');
  const gameLoader     = document.getElementById('game-loader');
  const gameBoard      = document.getElementById('game-board');
  const cardGrid       = document.getElementById('card-grid');
  const timerEl        = document.getElementById('timer');
  const pairsEl        = document.getElementById('pairs-counter');

  // End screens
  const endWin          = document.getElementById('end-win');
  const endPartial      = document.getElementById('end-partial');
  const endDefeat       = document.getElementById('end-defeat');
  const endWinTime      = document.getElementById('end-win-time');
  const endPartialPairs = document.getElementById('end-partial-pairs');
  const endPartialText  = document.getElementById('end-partial-text');
  const retryPartialBtn = document.getElementById('retry-partial-btn');
  const retryDefeatBtn  = document.getElementById('retry-defeat-btn');

  /* ===== Game state ===== */
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let lockBoard = false;
  let timerInterval = null;
  const TOTAL_TIME = 90;
  let timeLeft = TOTAL_TIME;
  let loadPct = 0;

  const promoAt = { 2: 'promo-1', 6: 'promo-2', 8: 'promo-3' };

  const PRIZES = [
    { n: 1, code: 'KICK10',     minPairs: 2 },
    { n: 2, code: 'MATCHDAY15', minPairs: 6 },
  ];

  // Preload card faces so the first flip never shows an empty card
  ['обложкакарты', 1, 2, 3, 4, 5, 6, 7, 8].forEach((name) => {
    new Image().src = `image/${name}.png`;
  });

  /* ===== Delayed actions that belong to the current game =====
     Cleared on Back / restart so a stale timeout can't start a game
     or pop an end screen after the player has left. */
  const pendingTimeouts = new Set();

  function later(fn, ms) {
    const id = setTimeout(() => {
      pendingTimeouts.delete(id);
      fn();
    }, ms);
    pendingTimeouts.add(id);
  }

  function clearPending() {
    pendingTimeouts.forEach(clearTimeout);
    pendingTimeouts.clear();
  }

  /* ===== Helpers ===== */
  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function mmss(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  /* All text that depends on game state + current language */
  function render() {
    timerEl.textContent = `${t('time')} ${mmss(timeLeft)}`;
    pairsEl.textContent = `${t('pairs')} ${matchedPairs}/8`;
    loadingText.textContent = `${t('loading')} ${loadPct}%`;
    endWinTime.textContent = `${t('winTime')}: ${mmss(TOTAL_TIME - timeLeft)}`;
    endPartialPairs.textContent = `${t('partialPairs')}: ${matchedPairs}/8`;
    const earnedAny = PRIZES.some((p) => matchedPairs >= p.minPairs);
    endPartialText.innerHTML = t(earnedAny ? 'partialTextEarned' : 'partialTextNone');
  }

  /* ======================================================
     START SCREEN → GAME SCREEN
     ====================================================== */
  playBtn.addEventListener('click', () => {
    playBtn.classList.add('fade-out');
    langSwitchStart.classList.add('fade-out');
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

      loadPct = Math.floor(eased * 100);
      loadingText.textContent = `${t('loading')} ${loadPct}%`;
      loadingBarFill.style.width = `${loadPct}%`;

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
    clearPending();
    hideAllEndScreens();
    gameLoader.classList.add('hidden');
    gameScreen.classList.add('hidden');
    startScreen.style.display = '';
    scene.style.transform = '';
    playBtn.classList.remove('fade-out');
    langSwitchStart.classList.remove('fade-out');
    loadingOverlay.classList.add('hidden');
    loadingBarFill.style.width = '0%';
    loadPct = 0;
    rulesScreen.classList.remove('hidden');
    gameBoard.classList.add('hidden');
    resetGame();
  });

  /* ======================================================
     LET'S PLAY → start the memo game
     ====================================================== */
  letsPlayBtn.addEventListener('click', () => {
    rulesScreen.classList.add('hidden');
    gameLoader.classList.remove('hidden');
    later(() => {
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
    stopTimer();
    clearPending();
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    lockBoard = false;
    timeLeft = TOTAL_TIME;
    cardGrid.innerHTML = '';
    render();

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
            <img src="image/обложкакарты.png" alt="">
          </div>
          <div class="card-face card-front">
            <img src="image/${imgId}.png" alt="">
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
      render();

      if (promoAt[matchedPairs]) {
        document.getElementById(promoAt[matchedPairs]).classList.remove('hidden');
      }

      flippedCards = [];
      lockBoard = false;

      // All 8 pairs → full win
      if (matchedPairs === 8) {
        stopTimer();
        lockBoard = true;
        later(() => showEndScreen(), 600);
      }
    } else {
      later(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flippedCards = [];
        lockBoard = false;
      }, 900);
    }
  }

  /* ===== Timer ===== */
  function startTimer() {
    stopTimer(); // never run two intervals at once
    render();
    timerInterval = setInterval(() => {
      timeLeft--;
      render();
      if (timeLeft <= 0) {
        stopTimer();
        clearPending(); // drop a pending "flip back" so it can't unlock the board
        lockBoard = true;
        later(() => showEndScreen(), 400);
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
    render();

    if (matchedPairs === 8) {
      endWin.classList.remove('hidden');
    } else if (matchedPairs > 0) {
      showPartialPromos();
      endPartial.classList.remove('hidden');
    } else {
      endDefeat.classList.remove('hidden');
    }
  }

  /* Build partial promos dynamically based on earned codes */
  function showPartialPromos() {
    const container = document.getElementById('end-partial-promos');
    container.innerHTML = '';

    PRIZES.filter((p) => matchedPairs >= p.minPairs).forEach((p) => {
      const card = document.createElement('div');
      card.className = 'prize-card';
      card.innerHTML = `
        <div class="prize-header" data-i18n="prize${p.n}Header">${t(`prize${p.n}Header`)}</div>
        <div class="prize-body">
          <div class="prize-row">
            <span class="prize-code">${p.code}</span>
            <span class="prize-desc" data-i18n="prize${p.n}Desc">${t(`prize${p.n}Desc`)}</span>
          </div>
          <button class="copy-btn" data-code="${p.code}" data-i18n="copy">${t('copy')}</button>
        </div>
      `;
      container.appendChild(card);
    });

    // Attach copy handlers for dynamically created buttons
    container.querySelectorAll('.copy-btn').forEach(attachCopyHandler);
  }

  /* ===== Copy promo to clipboard ===== */
  /* navigator.clipboard only exists on https / localhost — fall back otherwise */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function attachCopyHandler(btn) {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      copyText(code)
        .then(() => {
          btn.textContent = '✓';
          btn.classList.add('copied');
        })
        .catch(() => {
          btn.textContent = code; // at least show the code so it can be typed
        })
        .finally(() => {
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = t('copy');
          }, 2000);
        });
    });
  }

  // Attach copy handlers for static prize cards (full-win screen)
  document.querySelectorAll('#end-win-promos .copy-btn').forEach(attachCopyHandler);

  // Initial language pass
  applyLang();
});
