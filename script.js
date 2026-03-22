// --- Configuration & State ---
const CONFIG = {
    animationDuration: 300,
    quickModeCount: 10,
};

let gameState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    highestStreak: 0,
    mode: 'quick', // 'quick' or 'marathon'
    totalQuestions: 0,
    hintUsed: false,
    audioEnabled: true
};

// --- DOM Elements ---
const DOM = {
    startScreen: document.getElementById('start-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    scoreScreen: document.getElementById('score-screen'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    questionCounter: document.getElementById('question-counter'),
    streakText: document.getElementById('streak-text'),
    progressBar: document.getElementById('progress-bar'),
    questionText: document.getElementById('question-text'),
    answerInput: document.getElementById('answer-input'),
    submitBtn: document.getElementById('submit-btn'),
    feedbackText: document.getElementById('feedback-text'),
    hintText: document.getElementById('hint-text'),
    finalScore: document.getElementById('final-score'),
    scoreFeedback: document.getElementById('score-feedback'),
    highestStreakDisplay: document.getElementById('highest-streak'),
    lifetimeStreakDisplay: document.getElementById('lifetime-streak'),
    totalGamesDisplay: document.getElementById('total-games-display'),
    hintBtn: document.getElementById('hint-btn'),
    showAnswerBtn: document.getElementById('show-answer-btn'),
    micBtn: document.getElementById('mic-btn'),
    modeCards: document.querySelectorAll('.mode-card'),
    feedbackContainer: document.getElementById('feedback-container'),
    feedbackIcon: document.getElementById('feedback-icon'),
    hintContainer: document.getElementById('hint-container'),
    finalScoreTotal: document.getElementById('final-score-total')
};

// --- Sound Manager (Web Audio API) ---
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    playTone(freq, type, duration, volume = 0.1) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playCorrect() {
        // Soft major chord upward arpeggio
        const now = this.ctx.currentTime;
        this.playNote(523.25, now, 'sine'); // C5
        this.playNote(659.25, now + 0.1, 'sine'); // E5
        this.playNote(783.99, now + 0.2, 'sine'); // G5
    }

    playIncorrect() {
        // Gentle descending tone
        const now = this.ctx.currentTime;
        this.playNote(392.00, now, 'triangle', 0.15, 0.3); // G4
        this.playNote(349.23, now + 0.2, 'triangle', 0.15, 0.4); // F4
    }

    playNote(freq, time, type = 'sine', duration = 0.3, volume = 0.1) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
    }

    unlock() {
        // Resume context on first user interaction
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}

const audio = new SoundManager();

// --- Persistence ---
const Storage = {
    get: (key, limit) => parseInt(localStorage.getItem(key) || 0),
    set: (key, value) => localStorage.setItem(key, value),
    saveGame: (score, streak) => {
        const currentGames = Storage.get('kvizzing_games_played');
        Storage.set('kvizzing_games_played', currentGames + 1);

        const bestStreak = Storage.get('kvizzing_best_streak');
        if (streak > bestStreak) {
            Storage.set('kvizzing_best_streak', streak);
        }
    }
};

// --- Game Logic ---

function init() {
    DOM.totalGamesDisplay.textContent = Storage.get('kvizzing_games_played');
    DOM.lifetimeStreakDisplay.textContent = Storage.get('kvizzing_best_streak');

    // Select default mode
    selectMode('quick');

    // Speech Recognition Setup
    setupSpeechRecognition();
}

function selectMode(mode) {
    gameState.mode = mode;
    DOM.modeCards.forEach(card => {
        if (card.id === `mode-${mode}`) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
    // Add logic to select card visually
}

function startQuiz() {
    audio.unlock(); // Ensure audio context is ready

    // Prepare questions
    const allQuestions = [...quizData];
    // Fisher-Yates Shuffle
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    if (gameState.mode === 'quick') {
        gameState.questions = allQuestions.slice(0, CONFIG.quickModeCount);
    } else {
        gameState.questions = allQuestions;
    }

    gameState.totalQuestions = gameState.questions.length;
    gameState.currentIndex = 0;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.highestStreak = 0;

    // UI Transition
    DOM.startScreen.classList.add('hidden');
    DOM.scoreScreen.classList.add('hidden');
    DOM.quizScreen.classList.remove('hidden');

    updateStreak();
    loadQuestion();
}

function loadQuestion() {
    const currentQ = gameState.questions[gameState.currentIndex];

    // Animate content out (optional polish, keep simple for now)
    DOM.questionText.textContent = currentQ.question;

    // Update Progress
    DOM.questionCounter.innerHTML = `${gameState.currentIndex + 1}&nbsp;<span class="text-primary-container text-2xl">/${gameState.totalQuestions}</span>`;
    const progress = (gameState.currentIndex / gameState.totalQuestions) * 100;
    DOM.progressBar.style.width = `${progress}%`;

    // Reset Inputs
    DOM.answerInput.value = '';
    DOM.answerInput.className = 'answer-input'; // Reset classes
    DOM.answerInput.disabled = false;
    DOM.submitBtn.disabled = false;
    DOM.hintBtn.disabled = false;
    DOM.showAnswerBtn.disabled = false;

    // Reset Feedback
    DOM.feedbackText.textContent = '';
    DOM.feedbackContainer.classList.add('hidden', 'opacity-0');
    DOM.feedbackContainer.classList.remove('bg-error-container/20', 'border-error', 'bg-tertiary-container/20', 'border-tertiary');
    
    DOM.hintText.textContent = '';
    DOM.hintContainer.classList.add('hidden', 'opacity-0');

    gameState.hintUsed = false;

    // Mic Button State
    if (recognition) {
        DOM.micBtn.classList.remove('listening');
        DOM.micBtn.disabled = false;
        DOM.micBtn.classList.remove('hidden');
        DOM.micBtn.style.display = 'flex';
    } else {
        // Show disabled mic if not supported, so user knows it exists
        DOM.micBtn.classList.remove('hidden');
        DOM.micBtn.style.display = 'flex';
        DOM.micBtn.disabled = true;
        DOM.micBtn.title = "Speech Recognition not supported in this browser";
        DOM.micBtn.style.opacity = '0.5';
    }

    // Focus input
    DOM.answerInput.focus();
}

function normalize(str) {
    return str.toLowerCase()
        .replace(/\b(the|a|an)\b/g, '')
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
        .replace(/\s+/g, ' ').trim();
}

function checkAnswer() {
    const userVal = DOM.answerInput.value.trim();
    if (!userVal) return;

    if (recognition) recognition.stop();

    const currentQ = gameState.questions[gameState.currentIndex];
    const isCorrect = isAnswerClose(userVal, currentQ.answer);

    handleResult(isCorrect, currentQ.answer);
}

function handleResult(isCorrect, correctAnswer) {
    // Disable inputs
    DOM.answerInput.disabled = true;
    DOM.submitBtn.disabled = true;
    DOM.hintBtn.disabled = true;
    DOM.showAnswerBtn.disabled = true;
    if (recognition) DOM.micBtn.disabled = true;

    // Visual Feedback
    if (isCorrect) {
        DOM.answerInput.classList.add('correct');
        DOM.feedbackContainer.classList.remove('hidden', 'opacity-0');
        DOM.feedbackContainer.classList.add('bg-tertiary-container/20', 'border-tertiary');
        DOM.feedbackIcon.textContent = "check_circle";
        DOM.feedbackIcon.className = "material-symbols-outlined mt-0.5 text-tertiary text-3xl";
        DOM.feedbackText.textContent = "Correct!";
        DOM.feedbackText.className = "text-xl font-bold text-tertiary transition-all duration-300";
        audio.playCorrect();

        gameState.score++;
        if (!gameState.hintUsed) gameState.streak++;

        // Mini confetti for streak milestones
        if (gameState.streak > 0 && gameState.streak % 5 === 0) {
            triggerConfetti(0.5, { particleCount: 50, spread: 60 });
        }
    } else {
        gameState.streak = 0;
        DOM.answerInput.classList.add('incorrect');
        DOM.feedbackContainer.classList.remove('hidden', 'opacity-0');
        DOM.feedbackContainer.classList.add('bg-error-container/20', 'border-error');
        DOM.feedbackIcon.textContent = "cancel";
        DOM.feedbackIcon.className = "material-symbols-outlined mt-0.5 text-error text-3xl";
        DOM.feedbackText.innerHTML = `The correct answer was <span class="text-error font-extrabold uppercase">${correctAnswer}</span>`;
        DOM.feedbackText.className = "text-xl font-medium text-on-surface transition-all duration-300";
        audio.playIncorrect();
    }

    updateStreak();

    setTimeout(() => {
        nextQuestion();
    }, 2000); // 2 seconds delay to read feedback
}

function showHint() {
    gameState.hintUsed = true;
    DOM.hintText.textContent = gameState.questions[gameState.currentIndex].hint;
    DOM.hintContainer.classList.remove('hidden');
    setTimeout(() => DOM.hintContainer.classList.remove('opacity-0'), 10);
    DOM.hintBtn.disabled = true;
}

function showAnswer() {
    gameState.streak = 0;
    updateStreak();
    handleResult(false, gameState.questions[gameState.currentIndex].answer);
}

function updateStreak() {
    if (gameState.streak > gameState.highestStreak) {
        gameState.highestStreak = gameState.streak;
    }
    DOM.streakText.textContent = gameState.streak;
}

function nextQuestion() {
    gameState.currentIndex++;
    if (gameState.currentIndex < gameState.totalQuestions) {
        loadQuestion();
    } else {
        endGame();
    }
}

function endGame() {
    DOM.quizScreen.classList.add('hidden');
    DOM.scoreScreen.classList.remove('hidden');

    // Update UI
    DOM.finalScore.textContent = gameState.score;
    DOM.finalScoreTotal.textContent = `/ ${gameState.totalQuestions}`;
    
    // Post to backend
    const username = localStorage.getItem('kvizzing_username') || 'Anonymous';
    fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: gameState.score, streak: gameState.highestStreak, username })
    }).then(res => res.json()).then(data => {
        DOM.highestStreakDisplay.textContent = gameState.highestStreak;
        DOM.lifetimeStreakDisplay.textContent = data.highestStreak;
        const totalDisp = document.getElementById('total-games-display');
        if (totalDisp) totalDisp.textContent = data.lifetimeKnowledge;
        updateWalletDisplay(data.lifetimeKnowledge);
    }).catch(e => console.error("Could not sync stats to backend", e));

    // Update Persistence
    Storage.saveGame(gameState.score, gameState.highestStreak);
    DOM.totalGamesDisplay.textContent = Storage.get('kvizzing_games_played');

    // Celebration
    const scorePct = gameState.score / gameState.totalQuestions;
    if (scorePct >= 0.8) {
        DOM.scoreFeedback.textContent = "Outstanding Performance!";
        triggerConfetti(2, { particleCount: 150, spread: 100 });
        audio.playCorrect();
        // Play a little melody?
    } else if (scorePct >= 0.5) {
        DOM.scoreFeedback.textContent = "Well done!";
    } else {
        DOM.scoreFeedback.textContent = "Good effort! Keep learning.";
    }
}

// --- Confetti Wrapper ---
function triggerConfetti(durationSeconds, options) {
    if (typeof confetti === 'function') {
        confetti({
            origin: { y: 0.6 },
            colors: ['#81e6d9', '#ed64a6', '#f6e05e', '#63b3ed'], // Pastel colors
            ...options
        });
    }
}

// --- Speech Recognition ---
let recognition;
function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        DOM.micBtn.classList.remove('hidden');
        DOM.micBtn.style.display = 'flex';

        recognition.onstart = () => DOM.micBtn.classList.add('listening');
        recognition.onend = () => DOM.micBtn.classList.remove('listening');
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            DOM.answerInput.value = transcript;
            DOM.answerInput.focus();
        };

        DOM.micBtn.addEventListener('click', () => {
            if (DOM.micBtn.classList.contains('listening')) recognition.stop();
            else recognition.start();
        });
    } else {
        // Fallback for non-supported browsers
        DOM.micBtn.classList.remove('hidden');
        DOM.micBtn.style.display = 'flex';
        DOM.micBtn.disabled = true;
        DOM.micBtn.title = "Speech Recognition not supported in this browser";
        DOM.micBtn.style.opacity = '0.5';
    }
}

// --- Event Listeners ---
DOM.startBtn.addEventListener('click', startQuiz);
DOM.restartBtn.addEventListener('click', () => {
    DOM.scoreScreen.classList.add('hidden');
    DOM.startScreen.classList.remove('hidden');
    init(); // Refresh stats
});
DOM.submitBtn.addEventListener('click', checkAnswer);
DOM.hintBtn.addEventListener('click', showHint);
DOM.showAnswerBtn.addEventListener('click', showAnswer);
DOM.answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

// Initialize
init();

// Expose selecting mode to global scope for HTML onclick
window.selectMode = selectMode;

// --- NAVIGATION & API SYSTEM ---
const API_BASE = '/api';

const screens = {
    start: document.getElementById('start-screen'),
    quiz: document.getElementById('quiz-screen'),
    stats: document.getElementById('stats-screen'),
    store: document.getElementById('store-screen'),
    social: document.getElementById('social-screen'),
    score: document.getElementById('score-screen')
};

window.switchTab = function(tabName) {
    Object.values(screens).forEach(screen => {
        if(screen) screen.classList.add('hidden');
    });
    
    document.querySelectorAll('#desktop-nav .nav-link').forEach(el => {
        if(el.dataset.tab === tabName) {
            el.classList.remove('text-slate-500', 'dark:text-slate-400');
            el.classList.add('text-violet-700', 'dark:text-violet-300', 'bg-violet-100', 'dark:bg-violet-800/50');
        } else {
            el.classList.add('text-slate-500', 'dark:text-slate-400');
            el.classList.remove('text-violet-700', 'dark:text-violet-300', 'bg-violet-100', 'dark:bg-violet-800/50');
        }
    });
    
    document.querySelectorAll('#mobile-nav .nav-icon').forEach(el => {
        if(el.dataset.tab === tabName) {
            el.classList.remove('text-slate-500');
            el.classList.add('bg-violet-200', 'text-violet-800', 'rounded-[2rem]');
        } else {
            el.classList.add('text-slate-500');
            el.classList.remove('bg-violet-200', 'text-violet-800', 'rounded-[2rem]');
        }
    });

    if (tabName === 'start') {
        screens.start.classList.remove('hidden');
    } else if (tabName === 'stats') {
        screens.stats.classList.remove('hidden');
        loadStats();
    } else if (tabName === 'store') {
        screens.store.classList.remove('hidden');
        loadStore();
    } else if (tabName === 'social') {
        screens.social.classList.remove('hidden');
        loadSocial();
    }
};

async function loadStats() {
    try {
        const res = await fetch(`${API_BASE}/stats`);
        const stats = await res.json();
        // Stat cards
        const ePlayed = document.getElementById('stat-games-played');
        const eScore = document.getElementById('stat-lifetime-score');
        const eStreak = document.getElementById('stat-best-streak');
        const eAvg = document.getElementById('stat-avg-score');
        if(ePlayed) ePlayed.textContent = stats.gamesPlayed;
        if(eScore) eScore.textContent = stats.lifetimeKnowledge;
        if(eStreak) eStreak.textContent = stats.highestStreak;
        if(eAvg) eAvg.textContent = stats.gamesPlayed > 0 ? Math.round(stats.lifetimeKnowledge / stats.gamesPlayed) : 0;

        // Profile card
        const profileName = document.getElementById('profile-username');
        const profileWallet = document.getElementById('profile-wallet');
        const username = localStorage.getItem('kvizzing_username') || 'Guest';
        if (profileName) profileName.textContent = username;
        if (profileWallet) profileWallet.textContent = stats.lifetimeKnowledge;

        // Update header wallet too
        updateWalletDisplay(stats.lifetimeKnowledge);
    } catch (e) {
        console.error(e);
    }
}

async function loadStore() {
    try {
        const resStats = await fetch(`${API_BASE}/stats`);
        const stats = await resStats.json();
        const bal = document.getElementById('store-balance');
        if(bal) bal.textContent = stats.lifetimeKnowledge;
        
        const resStore = await fetch(`${API_BASE}/store`);
        const storeItems = await resStore.json();
        
        const grid = document.getElementById('store-grid');
        if(!grid) return;
        grid.innerHTML = '';
        storeItems.forEach(item => {
            const canAfford = stats.lifetimeKnowledge >= item.cost;
            const btnClass = item.purchased ? "bg-surface-container-highest text-outline cursor-not-allowed" : 
                (canAfford ? "bg-primary text-on-primary hover:bg-primary-dim shadow-md transform hover:scale-105" : "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-50");
            const btnText = item.purchased ? "Owned" : `${item.cost} Pts`;
            
            grid.innerHTML += `
                <div class="bg-surface-container rounded-xl p-6 flex flex-col items-center justify-between text-center gap-4 shadow-sm border border-transparent hover:border-outline-variant transition-all">
                    <div class="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1;">${item.icon}</span>
                    </div>
                    <div>
                        <h3 class="font-headline font-bold text-on-surface mb-1">${item.title}</h3>
                        <p class="text-xs font-label text-on-surface-variant uppercase tracking-wider">${item.type}</p>
                    </div>
                    <button onclick="buyItem(${item.id})" class="w-full py-3 rounded-xl font-bold font-headline transition-all ${btnClass}" ${item.purchased || !canAfford ? 'disabled' : ''}>
                        ${btnText}
                    </button>
                </div>
            `;
        });
    } catch (e) {
        console.error(e);
    }
}

window.buyItem = async function(itemId) {
    try {
        const res = await fetch(`${API_BASE}/store/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId })
        });
        const data = await res.json();
        if (data.success) {
            triggerConfetti(0.5, { particleCount: 100, spread: 70 });
            loadStore();
        } else {
            alert(data.error);
        }
    } catch (e) {
        console.error(e);
    }
};

async function loadSocial() {
    try {
        const res = await fetch(`${API_BASE}/social`);
        const social = await res.json();
        const list = document.getElementById('leaderboard-list');
        if(!list) return;
        list.innerHTML = '';
        social.forEach(user => {
            const isMe = user.isCurrentUser || user.name === 'You (Guest)';
            const displayName = isMe ? (localStorage.getItem('kvizzing_username') || user.name) : user.name;
            const rowClass = isMe ? "bg-primary-container/10" : "hover:bg-surface-container-high";
            const nameClass = isMe ? "text-primary font-black" : "text-on-surface font-bold";
            const rankIcon = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`;
            
            list.innerHTML += `
                <li class="flex items-center justify-between p-6 transition-colors ${rowClass}">
                    <div class="flex items-center gap-4">
                        <span class="text-2xl w-10 text-center font-headline font-black text-on-surface-variant">${rankIcon}</span>
                        <div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shadow-inner">
                            <span class="material-symbols-outlined text-on-surface-variant">person</span>
                        </div>
                        <span class="${nameClass} font-headline text-lg">${displayName}</span>
                    </div>
                    <span class="font-headline font-black text-2xl text-primary">${user.score}</span>
                </li>
            `;
        });
    } catch (e) {
        console.error(e);
    }
}

// --- Wallet & Profile Helpers ---
function updateWalletDisplay(points) {
    const headerBal = document.getElementById('header-wallet-balance');
    if (headerBal) headerBal.textContent = points;
    const profileBal = document.getElementById('profile-wallet');
    if (profileBal) profileBal.textContent = points;
    const storeBal = document.getElementById('store-balance');
    if (storeBal) storeBal.textContent = points;
}

window.openRenameModal = function() {
    const modal = document.getElementById('rename-modal');
    const input = document.getElementById('rename-input');
    if (modal) modal.classList.remove('hidden');
    if (input) {
        input.value = localStorage.getItem('kvizzing_username') || '';
        input.focus();
    }
};

window.closeRenameModal = function() {
    const modal = document.getElementById('rename-modal');
    if (modal) modal.classList.add('hidden');
};

window.saveNewUsername = function() {
    const input = document.getElementById('rename-input');
    const newName = input ? input.value.trim() : '';
    if (!newName) return;
    localStorage.setItem('kvizzing_username', newName);
    const profileName = document.getElementById('profile-username');
    if (profileName) profileName.textContent = newName;
    closeRenameModal();
    // Sync to backend on next stat post
};

// Expose endGame to global scope for the End Quiz button
window.endGame = endGame;

// Initial hydration
window.addEventListener('DOMContentLoaded', async () => {
    // Username modal handling
    const savedName = localStorage.getItem('kvizzing_username');
    if (!savedName) {
        document.getElementById('username-modal').classList.remove('hidden');
    }

    const submitBtn = document.getElementById('username-submit');
    const uInput = document.getElementById('username-input');
    if (submitBtn && uInput) {
        submitBtn.addEventListener('click', () => {
            const input = uInput.value.trim();
            if (input) {
                localStorage.setItem('kvizzing_username', input);
                document.getElementById('username-modal').classList.add('hidden');
            }
        });
        uInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitBtn.click();
        });
    }

    // Hydrate stats and wallet from backend
    try {
        const res = await fetch(`${API_BASE}/stats`);
        const stats = await res.json();
        const display = document.getElementById('total-games-display');
        if (display) display.textContent = stats.lifetimeKnowledge;
        updateWalletDisplay(stats.lifetimeKnowledge);
    } catch(e) {}
});

// Levenshtein distance for spelling forgiveness
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

function isAnswerClose(userStr, correctStr) {
    const normUser = normalize(userStr);
    const normCorrect = normalize(correctStr);
    if (normCorrect.includes(normUser) && normUser.length > 2) return true;
    if (normUser.includes(normCorrect)) return true;
    const dist = levenshteinDistance(normUser, normCorrect);
    if (normCorrect.length <= 4) return dist <= 1;
    else if (normCorrect.length <= 8) return dist <= 2;
    else return dist <= 3;
}
