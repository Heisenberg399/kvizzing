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
    audioEnabled: true,
    selectedCategories: ['all'],
    difficulty: 'medium',
    pointMultiplier: 2
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

// --- Sound Toggle ---
window.toggleSound = function() {
    audio.enabled = !audio.enabled;
    localStorage.setItem('kvizzing_sound', audio.enabled ? 'on' : 'off');
    const btn = document.getElementById('sound-toggle');
    if (btn) {
        btn.textContent = audio.enabled ? 'volume_up' : 'volume_off';
        btn.classList.toggle('muted', !audio.enabled);
    }
};

// Restore sound preference
(function() {
    const pref = localStorage.getItem('kvizzing_sound');
    if (pref === 'off') {
        audio.enabled = false;
        const btn = document.getElementById('sound-toggle');
        if (btn) {
            btn.textContent = 'volume_off';
            btn.classList.add('muted');
        }
    }
})();

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

    // Filter by category
    let filtered = [...quizData];
    if (!gameState.selectedCategories.includes('all')) {
        filtered = filtered.filter(q => gameState.selectedCategories.includes(q.category));
    }
    // Filter by difficulty
    if (gameState.difficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty === gameState.difficulty);
    }
    // Fallback: if no questions match, use all
    if (filtered.length === 0) filtered = [...quizData];

    // Fisher-Yates Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }

    if (gameState.mode === 'quick') {
        gameState.questions = filtered.slice(0, CONFIG.quickModeCount);
    } else {
        gameState.questions = filtered;
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
    DOM.feedbackContainer.classList.remove('bg-error-container/20', 'border-error', 'bg-tertiary-container/20', 'border-tertiary', 'feedback-slide-in');
    
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
    if (window.innerWidth >= 768) DOM.answerInput.focus();
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
        DOM.answerInput.classList.add('correct', 'answer-correct-anim');
        DOM.feedbackContainer.classList.remove('hidden', 'opacity-0');
        DOM.feedbackContainer.classList.add('bg-tertiary-container/20', 'border-tertiary', 'feedback-slide-in');
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
        DOM.answerInput.classList.add('incorrect', 'answer-incorrect-anim');
        DOM.feedbackContainer.classList.remove('hidden', 'opacity-0');
        DOM.feedbackContainer.classList.add('bg-error-container/20', 'border-error', 'feedback-slide-in');
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
    const perfectGame = (gameState.mode === 'quick' && gameState.score === CONFIG.quickModeCount);
    const totalScore = gameState.score * gameState.pointMultiplier;
    DOM.finalScore.textContent = totalScore;
    DOM.finalScoreTotal.textContent = `/ ${gameState.totalQuestions * gameState.pointMultiplier}`;
    fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score: totalScore, streak: gameState.highestStreak, perfectGame })
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
    score: document.getElementById('score-screen'),
    community: document.getElementById('community-screen')
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
        loadSocial('weekly');
    } else if (tabName === 'community') {
        screens.community.classList.remove('hidden');
        loadCommunity();
    }
};

async function loadStats() {
    try {
        const res = await fetch(`${API_BASE}/stats`, { credentials: 'include' });
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

        // Update rank display
        updateRankDisplay(stats.lifetimeKnowledge);

        // Load achievements
        loadAchievements();
    } catch (e) {
        console.error(e);
    }
}

async function loadStore() {
    try {
        const resStats = await fetch(`${API_BASE}/stats`, { credentials: 'include' });
        const stats = await resStats.json();
        const bal = document.getElementById('store-balance');
        if(bal) bal.textContent = stats.lifetimeKnowledge;
        
        const resStore = await fetch(`${API_BASE}/store`, { credentials: 'include' });
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
            credentials: 'include',
            body: JSON.stringify({ itemId })
        });
        const data = await res.json();
        if (data.success) {
            triggerConfetti(0.5, { particleCount: 100, spread: 70 });
            // Apply dark theme if user bought Dark Mode (itemId 1)
            if (itemId === 1) applyDarkTheme(true);
            loadStore();
        } else {
            alert(data.error);
        }
    } catch (e) {
        console.error(e);
    }
};

async function loadSocial(timeframe = 'weekly') {
    // Update active tab styling
    document.querySelectorAll('.lb-tab').forEach(tab => tab.classList.remove('active', 'border-primary'));
    const activeTab = document.getElementById(`lb-tab-${timeframe}`);
    if (activeTab) activeTab.classList.add('active', 'border-primary');

    let endpoint = '/social';
    if (timeframe === 'weekly') endpoint = '/social/weekly';
    else if (timeframe === 'daily') endpoint = '/daily/leaderboard';

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, { credentials: 'include' });
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

// Global current username (set on login/session check)
let currentUsername = 'Guest';

window.openRenameModal = function() {
    const modal = document.getElementById('rename-modal');
    const input = document.getElementById('rename-input');
    if (modal) modal.classList.remove('hidden');
    if (input) {
        input.value = currentUsername;
        input.focus();
    }
};

window.closeRenameModal = function() {
    const modal = document.getElementById('rename-modal');
    if (modal) modal.classList.add('hidden');
};

window.saveNewUsername = async function() {
    const input = document.getElementById('rename-input');
    const newName = input ? input.value.trim() : '';
    if (!newName) return;

    try {
        const res = await fetch(`${API_BASE}/auth/rename`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: newName })
        });
        const data = await res.json();
        if (data.success) {
            currentUsername = data.username;
            localStorage.setItem('kvizzing_username', data.username);
            const profileName = document.getElementById('profile-username');
            if (profileName) profileName.textContent = data.username;
        }
    } catch (e) {
        console.error('Rename failed:', e);
    }
    closeRenameModal();
};

window.logoutUser = async function() {
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStorage.removeItem('kvizzing_username');
    window.location.reload();
};

// Expose endGame to global scope for the End Quiz button
window.endGame = endGame;

// Initial hydration — check session via cookie
window.addEventListener('DOMContentLoaded', async () => {
    // Check if user has a session
    let loggedIn = false;
    try {
        const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
        const me = await meRes.json();
        if (me.loggedIn) {
            loggedIn = true;
            currentUsername = me.username;
            localStorage.setItem('kvizzing_username', me.username);
        }
    } catch (e) {}

    if (!loggedIn) {
        // Show login modal
        document.getElementById('username-modal').classList.remove('hidden');
    }

    // Username modal → calls auth/login
    const submitBtn = document.getElementById('username-submit');
    const uInput = document.getElementById('username-input');
    if (submitBtn && uInput) {
        submitBtn.addEventListener('click', async () => {
            const name = uInput.value.trim();
            if (!name) return;
            try {
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ username: name })
                });
                const data = await res.json();
                if (data.username) {
                    currentUsername = data.username;
                    localStorage.setItem('kvizzing_username', data.username);
                    document.getElementById('username-modal').classList.add('hidden');
                    // Refresh stats
                    hydrateFromBackend();
                }
            } catch (e) {
                console.error('Login failed:', e);
            }
        });
        uInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitBtn.click();
        });
    }

    // Initial data hydration
    if (loggedIn) hydrateFromBackend();
});

async function hydrateFromBackend() {
    try {
        const res = await fetch(`${API_BASE}/stats`, { credentials: 'include' });
        const stats = await res.json();
        const display = document.getElementById('total-games-display');
        if (display) display.textContent = stats.lifetimeKnowledge;
        updateWalletDisplay(stats.lifetimeKnowledge);
    } catch(e) {}
    // Check if user owns Dark Mode theme
    checkOwnedThemes();
}

// --- Dark Theme ---
function applyDarkTheme(enabled) {
    if (enabled) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('kvizzing_theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.removeItem('kvizzing_theme');
    }
}

// Check theme on load
(function() {
    if (localStorage.getItem('kvizzing_theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }
})();

// Also check store purchases for theme on hydration
async function checkOwnedThemes() {
    try {
        const res = await fetch(`${API_BASE}/store`, { credentials: 'include' });
        const items = await res.json();
        const darkMode = items.find(i => i.id === 1 && i.purchased);
        if (darkMode) {
            applyDarkTheme(true);
        }
    } catch(e) {}
}

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

// --- XP Rank System ---
const RANKS = [
    { name: 'Bronze', icon: 'shield', color: '#cd7f32', minPoints: 0, maxPoints: 499 },
    { name: 'Silver', icon: 'shield', color: '#c0c0c0', minPoints: 500, maxPoints: 1499 },
    { name: 'Gold', icon: 'military_tech', color: '#ffd700', minPoints: 1500, maxPoints: 3999 },
    { name: 'Diamond', icon: 'diamond', color: '#b9f2ff', minPoints: 4000, maxPoints: Infinity }
];

function getRank(points) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (points >= RANKS[i].minPoints) return { ...RANKS[i], index: i };
    }
    return { ...RANKS[0], index: 0 };
}

function updateRankDisplay(points) {
    const rank = getRank(points);
    const nextRank = RANKS[rank.index + 1];
    
    const rankIcon = document.getElementById('rank-icon');
    const rankName = document.getElementById('rank-name');
    const progressBar = document.getElementById('rank-progress-bar');
    const progressText = document.getElementById('rank-progress-text');
    
    if (rankIcon) {
        rankIcon.textContent = rank.icon;
        rankIcon.style.color = rank.color;
    }
    if (rankName) {
        rankName.textContent = rank.name;
        rankName.style.color = rank.color;
    }
    if (progressBar && nextRank) {
        const progress = ((points - rank.minPoints) / (nextRank.minPoints - rank.minPoints)) * 100;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    } else if (progressBar) {
        progressBar.style.width = '100%';
    }
    if (progressText) {
        if (nextRank) {
            progressText.textContent = `${points} / ${nextRank.minPoints} to ${nextRank.name}`;
        } else {
            progressText.textContent = `${points} pts — Max Rank!`;
        }
    }
}

// --- Category Selection ---
window.toggleCategory = function(cat) {
    if (cat === 'all') {
        gameState.selectedCategories = ['all'];
    } else {
        // Remove 'all' if selecting a specific category
        gameState.selectedCategories = gameState.selectedCategories.filter(c => c !== 'all');
        const idx = gameState.selectedCategories.indexOf(cat);
        if (idx >= 0) {
            gameState.selectedCategories.splice(idx, 1);
        } else {
            gameState.selectedCategories.push(cat);
        }
        // If empty, revert to all
        if (gameState.selectedCategories.length === 0) {
            gameState.selectedCategories = ['all'];
        }
    }
    // Update chip visuals
    document.querySelectorAll('.category-chip').forEach(chip => {
        const chipCat = chip.dataset.cat;
        if (gameState.selectedCategories.includes(chipCat)) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
};

// --- Difficulty Selection ---
window.selectDifficulty = function(diff) {
    gameState.difficulty = diff;
    gameState.pointMultiplier = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        if (btn.dataset.diff === diff) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
};

// --- Achievements ---
async function loadAchievements() {
    try {
        const res = await fetch(`${API_BASE}/achievements`, { credentials: 'include' });
        const achievements = await res.json();
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;
        grid.innerHTML = '';
        achievements.forEach(ach => {
            const statusClass = ach.unlocked ? 'unlocked' : 'locked';
            grid.innerHTML += `
                <div class="achievement-card ${statusClass} bg-surface-container rounded-xl p-4 sm:p-5 flex flex-col items-center text-center gap-2">
                    <div class="w-12 h-12 rounded-full ${ach.unlocked ? 'bg-primary-container' : 'bg-surface-container-highest'} flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl ${ach.unlocked ? 'text-primary' : 'text-outline'}" style="font-variation-settings: 'FILL' 1;">${ach.icon}</span>
                    </div>
                    <h4 class="font-headline font-bold text-sm text-on-surface">${ach.title}</h4>
                    <p class="text-[10px] font-label text-on-surface-variant">${ach.description}</p>
                </div>
            `;
        });
    } catch (e) {
        console.error('Failed to load achievements:', e);
    }
}

// --- Daily Challenge ---
window.startDailyChallenge = async function() {
    audio.unlock();
    try {
        const res = await fetch(`${API_BASE}/daily`, { credentials: 'include' });
        const data = await res.json();
        if (data.alreadyPlayed) {
            alert("You've already played today's challenge! Check the daily leaderboard.");
            switchTab('social');
            loadSocial('daily');
            return;
        }
        
        gameState.mode = 'daily';
        gameState.questions = data.questions;
        gameState.totalQuestions = gameState.questions.length;
        gameState.currentIndex = 0;
        gameState.score = 0;
        gameState.streak = 0;
        gameState.highestStreak = 0;
        gameState.hintUsed = false;
        gameState.pointMultiplier = 1; // Base scoring for parity
        
        DOM.startScreen.classList.add('hidden');
        DOM.scoreScreen.classList.add('hidden');
        DOM.quizScreen.classList.remove('hidden');
        
        updateUI();
        showQuestion();
    } catch (e) {
        alert("Failed to load daily challenge");
        console.error(e);
    }
};

// --- Community Questions ---
window.loadCommunity = async function() {
    try {
        const res = await fetch(`${API_BASE}/community/questions`);
        const questions = await res.json();
        const list = document.getElementById('community-list');
        if (!list) return;
        list.innerHTML = '';
        questions.forEach(q => {
            list.innerHTML += `
                <div class="bg-surface-container border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <span class="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">${q.category}</span>
                            <span class="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">${q.difficulty}</span>
                        </div>
                        <p class="font-body text-on-surface mb-6 italic line-clamp-4">"${q.question}"</p>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-xs font-label text-on-surface-variant">By ${q.authorName || 'Anonymous'}</span>
                        <button onclick="playCommunityQuestion('${encodeURIComponent(JSON.stringify(q))}')" class="text-primary font-headline font-bold text-sm bg-primary-container/20 px-4 py-2 rounded-lg hover:bg-primary-container/30 transition-colors">Play</button>
                    </div>
                </div>
            `;
        });
    } catch(e) { console.error('Failed to load community questions:', e); }
};

window.playCommunityQuestion = function(qJson) {
    const q = JSON.parse(decodeURIComponent(qJson));
    audio.unlock();
    gameState.mode = 'community';
    gameState.questions = [{
        question: q.question,
        answer: q.answer,
        hint: q.hint || "No hint given by community member",
        category: q.category,
        difficulty: q.difficulty
    }];
    gameState.totalQuestions = 1;
    gameState.currentIndex = 0;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.highestStreak = 0;
    gameState.hintUsed = false;
    gameState.pointMultiplier = q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1;
    
    switchTab('start'); // to reset state visually just in case
    DOM.startScreen.classList.add('hidden');
    DOM.scoreScreen.classList.add('hidden');
    
    const commScreen = document.getElementById('community-screen');
    if (commScreen) commScreen.classList.add('hidden');
    
    DOM.quizScreen.classList.remove('hidden');
    
    updateUI();
    showQuestion();
};

window.openCommunityModal = () => document.getElementById('community-modal').classList.remove('hidden');
window.closeCommunityModal = () => document.getElementById('community-modal').classList.add('hidden');

window.submitCommunityQuestion = async function() {
    const qtext = document.getElementById('comm-question').value;
    const ans = document.getElementById('comm-answer').value;
    const hint = document.getElementById('comm-hint').value;
    const cat = document.getElementById('comm-cat').value;
    const diff = document.getElementById('comm-diff').value;
    
    if (!qtext.trim() || !ans.trim()) return alert('Question and answer are required.');
    
    const btn = document.getElementById('comm-submit-btn');
    btn.textContent = 'Submitting...';
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_BASE}/community/submit`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ question: qtext, answer: ans, hint, category: cat, difficulty: diff })
        });
        if (res.ok) {
            closeCommunityModal();
            triggerConfetti(0.5);
            loadCommunity();
            // Reset form
            document.getElementById('comm-question').value = '';
            document.getElementById('comm-answer').value = '';
            document.getElementById('comm-hint').value = '';
        } else {
            const err = await res.json();
            alert(err.error || 'Failed to submit.');
        }
    } catch(e) {
        console.error(e);
        alert('Failed to submit question.');
    } finally {
        btn.textContent = 'Submit to Community';
        btn.disabled = false;
    }
};

// --- Daily Challenge ---
window.startDailyChallenge = async function() {
    audio.unlock();
    try {
        const res = await fetch(`${API_BASE}/daily`, { credentials: 'include' });
        const data = await res.json();
        if (data.alreadyPlayed) {
            alert("You've already played today's challenge! Check the daily leaderboard.");
            switchTab('social');
            loadSocial('daily');
            return;
        }
        
        gameState.mode = 'daily';
        gameState.questions = data.questions;
        gameState.totalQuestions = gameState.questions.length;
        gameState.currentIndex = 0;
        gameState.score = 0;
        gameState.streak = 0;
        gameState.highestStreak = 0;
        gameState.hintUsed = false;
        gameState.pointMultiplier = 1; // Base scoring for parity
        
        DOM.startScreen.classList.add('hidden');
        DOM.scoreScreen.classList.add('hidden');
        DOM.quizScreen.classList.remove('hidden');
        
        updateUI();
        showQuestion();
    } catch (e) {
        alert("Failed to load daily challenge");
        console.error(e);
    }
};

// --- Community Questions ---
window.loadCommunity = async function() {
    try {
        const res = await fetch(`${API_BASE}/community/questions`);
        const questions = await res.json();
        const list = document.getElementById('community-list');
        if (!list) return;
        list.innerHTML = '';
        questions.forEach(q => {
            list.innerHTML += `
                <div class="bg-surface-container border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <span class="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">${q.category}</span>
                            <span class="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">${q.difficulty}</span>
                        </div>
                        <p class="font-body text-on-surface mb-6 italic line-clamp-4">"${q.question}"</p>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <span class="text-xs font-label text-on-surface-variant">By ${q.authorName || 'Anonymous'}</span>
                        <button onclick="playCommunityQuestion('${encodeURIComponent(JSON.stringify(q))}')" class="text-primary font-headline font-bold text-sm bg-primary-container/20 px-4 py-2 rounded-lg hover:bg-primary-container/30 transition-colors">Play</button>
                    </div>
                </div>
            `;
        });
    } catch(e) { console.error('Failed to load community questions:', e); }
};

window.playCommunityQuestion = function(qJson) {
    const q = JSON.parse(decodeURIComponent(qJson));
    audio.unlock();
    gameState.mode = 'community';
    gameState.questions = [{
        question: q.question,
        answer: q.answer,
        hint: q.hint || "No hint given by community member",
        category: q.category,
        difficulty: q.difficulty
    }];
    gameState.totalQuestions = 1;
    gameState.currentIndex = 0;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.highestStreak = 0;
    gameState.hintUsed = false;
    gameState.pointMultiplier = q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1;
    
    switchTab('start'); // to reset state visually just in case
    DOM.startScreen.classList.add('hidden');
    DOM.scoreScreen.classList.add('hidden');
    DOM.communityScreen.classList.add('hidden'); // if we added it to screens obj
    DOM.quizScreen.classList.remove('hidden');
    
    updateUI();
    showQuestion();
};

window.openCommunityModal = () => document.getElementById('community-modal').classList.remove('hidden');
window.closeCommunityModal = () => document.getElementById('community-modal').classList.add('hidden');

window.submitCommunityQuestion = async function() {
    const qtext = document.getElementById('comm-question').value;
    const ans = document.getElementById('comm-answer').value;
    const hint = document.getElementById('comm-hint').value;
    const cat = document.getElementById('comm-cat').value;
    const diff = document.getElementById('comm-diff').value;
    
    if (!qtext.trim() || !ans.trim()) return alert('Question and answer are required.');
    
    const btn = document.getElementById('comm-submit-btn');
    btn.textContent = 'Submitting...';
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_BASE}/community/submit`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ question: qtext, answer: ans, hint, category: cat, difficulty: diff })
        });
        if (res.ok) {
            closeCommunityModal();
            triggerConfetti(0.5);
            loadCommunity();
            // Reset form
            document.getElementById('comm-question').value = '';
            document.getElementById('comm-answer').value = '';
            document.getElementById('comm-hint').value = '';
        } else {
            const err = await res.json();
            alert(err.error || 'Failed to submit.');
        }
    } catch(e) {
        console.error(e);
        alert('Failed to submit question.');
    } finally {
        btn.textContent = 'Submit to Community';
        btn.disabled = false;
    }
};
