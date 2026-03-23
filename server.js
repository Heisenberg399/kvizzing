require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- Session (required by Passport) ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'kvizzing-fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000, sameSite: 'lax' }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname)));

// --- Mongoose Schemas ---

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, default: 'Guest' },
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

const statsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    gamesPlayed: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    lifetimeKnowledge: { type: Number, default: 0 },
    walletPoints: { type: Number, default: 0 }
});

const storeItemSchema = new mongoose.Schema({
    itemId: { type: Number, required: true },
    title: String,
    type: String,
    cost: Number,
    icon: String
});

const userPurchaseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    itemId: { type: Number, required: true }
});

const socialSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: String,
    score: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);
const Stats = mongoose.model('Stats', statsSchema);
const StoreItem = mongoose.model('StoreItem', storeItemSchema);
const UserPurchase = mongoose.model('UserPurchase', userPurchaseSchema);
const SocialEntry = mongoose.model('SocialEntry', socialSchema);

// Weekly score schema
const weeklyScoreSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: String,
    score: { type: Number, default: 0 },
    weekStart: { type: Date, required: true }
});
weeklyScoreSchema.index({ userId: 1, weekStart: 1 }, { unique: true });
const WeeklyScore = mongoose.model('WeeklyScore', weeklyScoreSchema);

// Daily score schema
const dailyScoreSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: String,
    score: { type: Number, default: 0 },
    date: { type: String, required: true } // 'YYYY-MM-DD'
});
dailyScoreSchema.index({ userId: 1, date: 1 }, { unique: true });
const DailyScore = mongoose.model('DailyScore', dailyScoreSchema);

// Community question schema
const communityQuestionSchema = new mongoose.Schema({
    userId: String,
    authorName: String,
    question: { type: String, required: true },
    answer: { type: String, required: true },
    hint: String,
    category: { type: String, default: 'history' },
    difficulty: { type: String, default: 'medium' },
    createdAt: { type: Date, default: Date.now }
});
const CommunityQuestion = mongoose.model('CommunityQuestion', communityQuestionSchema);

// Achievement schema
const userAchievementSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    achievementId: { type: Number, required: true },
    unlockedAt: { type: Date, default: Date.now }
});
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 1, title: 'First Steps', description: 'Complete your first quiz', icon: 'flag', condition: (s) => s.gamesPlayed >= 1 },
    { id: 2, title: 'Quiz Regular', description: 'Complete 10 quizzes', icon: 'sports_esports', condition: (s) => s.gamesPlayed >= 10 },
    { id: 3, title: 'On Fire', description: 'Get a 5 answer streak', icon: 'local_fire_department', condition: (s) => s.highestStreak >= 5 },
    { id: 4, title: 'Unstoppable', description: 'Get a 10 answer streak', icon: 'whatshot', condition: (s) => s.highestStreak >= 10 },
    { id: 5, title: 'Century', description: 'Earn 100 total points', icon: 'military_tech', condition: (s) => s.lifetimeKnowledge >= 100 },
    { id: 6, title: 'Knowledge Seeker', description: 'Earn 500 total points', icon: 'school', condition: (s) => s.lifetimeKnowledge >= 500 },
    { id: 7, title: 'Scholar', description: 'Earn 1000 total points', icon: 'workspace_premium', condition: (s) => s.lifetimeKnowledge >= 1000 },
    { id: 8, title: 'Perfect Round', description: 'Score 10/10 in Quick mode', icon: 'star', condition: (s, extra) => extra && extra.perfectGame }
];

// --- In-memory fallback ---
let useMemoryDb = false;
let memUsers = {};  // userId -> { username, stats, purchases, social }

function getMemUser(userId) {
    if (!memUsers[userId]) {
        memUsers[userId] = {
            username: 'Guest',
            stats: { gamesPlayed: 0, highestStreak: 0, lifetimeKnowledge: 0, walletPoints: 0 },
            purchases: [],
            social: { name: 'Guest', score: 0 },
            achievements: []
        };
    }
    return memUsers[userId];
}

// Seed store items
const STORE_ITEMS = [
    { itemId: 1, title: "Dark Mode Theme", type: "theme", cost: 500, icon: "dark_mode" },
    { itemId: 2, title: "Grandmaster Badge", type: "badge", cost: 1000, icon: "workspace_premium" },
    { itemId: 3, title: "Neon Glow Animations", type: "effect", cost: 1500, icon: "electric_bolt" },
    { itemId: 4, title: "Ruby Avatar Outline", type: "avatar", cost: 2000, icon: "diamond" }
];

async function seedData() {
    const storeCount = await StoreItem.countDocuments();
    if (storeCount === 0) {
        await StoreItem.insertMany(STORE_ITEMS);
    }
}

// --- Middleware: extract userId from cookie ---
function getUserId(req) {
    return req.cookies?.kvizzing_uid || null;
}

// --- PASSPORT GOOGLE STRATEGY ---
passport.serializeUser((user, done) => done(null, user.userId));
passport.deserializeUser(async (userId, done) => {
    try {
        if (useMemoryDb) {
            const u = memUsers[userId];
            return done(null, u ? { userId, username: u.username } : null);
        }
        const u = await User.findOne({ userId });
        done(null, u ? { userId: u.userId, username: u.username } : null);
    } catch (e) { done(e, null); }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${appUrl}/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const googleId = profile.id;
            const displayName = profile.displayName || 'Google User';
            const avatar = profile.photos?.[0]?.value || null;

            if (useMemoryDb) {
                // Find existing by googleId
                let existingUid = Object.keys(memUsers).find(uid => memUsers[uid].googleId === googleId);
                if (existingUid) {
                    const u = memUsers[existingUid];
                    u.username = displayName;
                    u.avatar = avatar;
                    return done(null, { userId: existingUid, username: displayName });
                }
                const userId = uuidv4();
                const u = getMemUser(userId);
                u.username = displayName;
                u.googleId = googleId;
                u.avatar = avatar;
                u.social.name = displayName;
                return done(null, { userId, username: displayName });
            }

            // MongoDB: find-or-create
            let user = await User.findOne({ googleId });
            if (user) {
                user.username = displayName;
                user.avatar = avatar;
                await user.save();
            } else {
                const userId = uuidv4();
                user = await User.create({ userId, username: displayName, googleId, avatar });
                await Stats.create({ userId });
                await SocialEntry.create({ userId, name: displayName, score: 0 });
            }
            done(null, { userId: user.userId, username: user.username });
        } catch (e) { done(e, null); }
    }));
    console.log('✅ Google OAuth configured');
} else {
    console.warn('⚠️  No GOOGLE_CLIENT_ID — Google OAuth disabled, using username fallback');
}

// --- AUTH ROUTES ---

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Set cookie so the rest of the API can use getUserId()
        const cookieOpts = { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000, sameSite: 'lax' };
        res.cookie('kvizzing_uid', req.user.userId, cookieOpts);
        res.redirect('/');
    }
);

// Username fallback login
app.post('/api/auth/login', async (req, res) => {
    const { username } = req.body;
    if (!username || !username.trim()) {
        return res.status(400).json({ error: 'Username required' });
    }

    const userId = uuidv4();
    const cookieOpts = { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000, sameSite: 'lax' };

    if (useMemoryDb) {
        const user = getMemUser(userId);
        user.username = username.trim();
        user.social.name = username.trim();
        res.cookie('kvizzing_uid', userId, cookieOpts);
        return res.json({ userId, username: user.username });
    }

    try {
        const user = await User.create({ userId, username: username.trim() });
        await Stats.create({ userId });
        await SocialEntry.create({ userId, name: username.trim(), score: 0 });
        res.cookie('kvizzing_uid', userId, cookieOpts);
        res.json({ userId, username: user.username });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.logout?.(() => {});
    res.clearCookie('kvizzing_uid');
    res.json({ success: true });
});

app.get('/api/auth/me', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.json({ loggedIn: false });

    if (useMemoryDb) {
        const user = memUsers[userId];
        if (!user) return res.json({ loggedIn: false });
        return res.json({ loggedIn: true, username: user.username, userId, avatar: user.avatar || null });
    }

    try {
        const user = await User.findOne({ userId });
        if (!user) return res.json({ loggedIn: false });
        res.json({ loggedIn: true, username: user.username, userId, avatar: user.avatar || null });
    } catch (e) {
        res.json({ loggedIn: false });
    }
});

// Check if Google OAuth is available (frontend uses this)
app.get('/api/auth/providers', (req, res) => {
    res.json({ google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) });
});

app.post('/api/auth/rename', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Not logged in' });

    const { username } = req.body;
    if (!username || !username.trim()) return res.status(400).json({ error: 'Username required' });

    if (useMemoryDb) {
        const user = getMemUser(userId);
        user.username = username.trim();
        user.social.name = username.trim();
        return res.json({ success: true, username: user.username });
    }

    try {
        await User.updateOne({ userId }, { username: username.trim() });
        await SocialEntry.updateOne({ userId }, { name: username.trim() });
        res.json({ success: true, username: username.trim() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- STATS ---

app.get('/api/stats', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.json({ gamesPlayed: 0, highestStreak: 0, lifetimeKnowledge: 0, walletPoints: 0 });

    if (useMemoryDb) return res.json(getMemUser(userId).stats);

    try {
        let stats = await Stats.findOne({ userId });
        if (!stats) stats = await Stats.create({ userId });
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/stats', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Not logged in' });

    const { score, streak } = req.body;
    if (score === undefined || streak === undefined) {
        return res.status(400).json({ error: 'Missing score or streak' });
    }

    if (useMemoryDb) {
        const user = getMemUser(userId);
        user.stats.gamesPlayed += 1;
        user.stats.lifetimeKnowledge += score;
        user.stats.walletPoints = (user.stats.walletPoints || 0) + score;
        if (streak > user.stats.highestStreak) user.stats.highestStreak = streak;
        user.social.score = user.stats.lifetimeKnowledge;
        // Track weekly score
        const weekKey = getWeekStart().toISOString();
        if (!user.weeklyScores) user.weeklyScores = {};
        user.weeklyScores[weekKey] = (user.weeklyScores[weekKey] || 0) + score;
        // Check achievements in memory
        const extra = { perfectGame: req.body.perfectGame || false };
        for (const ach of ACHIEVEMENTS) {
            if (!user.achievements.includes(ach.id) && ach.condition(user.stats, extra)) {
                user.achievements.push(ach.id);
            }
        }
        return res.json(user.stats);
    }

    try {
        let stats = await Stats.findOne({ userId });
        if (!stats) stats = await Stats.create({ userId });
        stats.gamesPlayed += 1;
        stats.lifetimeKnowledge += score;
        stats.walletPoints = (stats.walletPoints || 0) + score;
        if (streak > stats.highestStreak) stats.highestStreak = streak;
        await stats.save();

        // Update social entry
        await SocialEntry.updateOne({ userId }, { score: stats.lifetimeKnowledge });

        // Update weekly score
        const weekStart = getWeekStart();
        const user = await User.findOne({ userId });
        await WeeklyScore.updateOne(
            { userId, weekStart },
            { $inc: { score }, $set: { name: user ? user.username : 'Guest' } },
            { upsert: true }
        );

        // Check achievements
        const extra = { perfectGame: req.body.perfectGame || false };
        await checkAchievements(userId, stats, extra);

        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- HINT COST ---

app.post('/api/stats/deduct-hint', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Not logged in' });

    const cost = req.body.cost || 5;

    if (useMemoryDb) {
        const user = getMemUser(userId);
        user.stats.walletPoints = user.stats.walletPoints || 0;
        if (user.stats.walletPoints < cost) {
            return res.json({ success: false, error: 'Not enough points', remainingPoints: user.stats.walletPoints });
        }
        user.stats.walletPoints -= cost;
        // Do NOT decrease user.social.score (XP)
        return res.json({ success: true, remainingPoints: user.stats.walletPoints });
    }

    try {
        let stats = await Stats.findOne({ userId });
        if (!stats) stats = await Stats.create({ userId });
        stats.walletPoints = stats.walletPoints || 0;
        if (stats.walletPoints < cost) {
            return res.json({ success: false, error: 'Not enough points', remainingPoints: stats.walletPoints });
        }
        stats.walletPoints -= cost;
        await stats.save();
        // Do NOT decrease SocialEntry.score (XP)
        res.json({ success: true, remainingPoints: stats.walletPoints });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- STORE ---

app.get('/api/store', async (req, res) => {
    const userId = getUserId(req);

    if (useMemoryDb) {
        const purchases = userId ? (getMemUser(userId).purchases || []) : [];
        return res.json(STORE_ITEMS.map(i => ({ ...i, id: i.itemId, purchased: purchases.includes(i.itemId) })));
    }

    try {
        const items = await StoreItem.find().sort({ itemId: 1 });
        const purchases = userId ? await UserPurchase.find({ userId }) : [];
        const purchasedIds = purchases.map(p => p.itemId);
        res.json(items.map(i => ({
            id: i.itemId, title: i.title, type: i.type, cost: i.cost, icon: i.icon,
            purchased: purchasedIds.includes(i.itemId)
        })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/store/buy', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Not logged in' });

    const { itemId } = req.body;

    if (useMemoryDb) {
        const user = getMemUser(userId);
        const item = STORE_ITEMS.find(i => i.itemId === itemId);
        if (!item) return res.status(404).json({ error: 'Item not found.' });
        if (user.purchases.includes(itemId)) return res.status(400).json({ error: 'Already purchased.' });
        user.stats.walletPoints = user.stats.walletPoints || 0;
        if (user.stats.walletPoints < item.cost) return res.status(400).json({ error: 'Not enough points.' });
        user.stats.walletPoints -= item.cost;
        user.purchases.push(itemId);
        return res.json({ success: true, remainingPoints: user.stats.walletPoints });
    }

    try {
        const item = await StoreItem.findOne({ itemId });
        if (!item) return res.status(404).json({ error: 'Item not found.' });

        const alreadyBought = await UserPurchase.findOne({ userId, itemId });
        if (alreadyBought) return res.status(400).json({ error: 'Already purchased.' });

        const stats = await Stats.findOne({ userId });
        if (!stats || (stats.walletPoints || 0) < item.cost) {
            return res.status(400).json({ error: 'Not enough points.' });
        }

        stats.walletPoints -= item.cost;
        await stats.save();
        await UserPurchase.create({ userId, itemId });

        res.json({ success: true, remainingPoints: stats.walletPoints });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- SOCIAL (Global Leaderboard) ---

app.get('/api/social', async (req, res) => {
    const userId = getUserId(req);

    if (useMemoryDb) {
        const allUsers = Object.entries(memUsers).map(([uid, u]) => ({
            name: u.username, score: u.social.score, isCurrentUser: uid === userId
        }));
        allUsers.sort((a, b) => b.score - a.score);
        return res.json(allUsers.map((e, i) => ({ ...e, rank: i + 1 })));
    }

    try {
        const realUsers = await SocialEntry.find();
        const users = realUsers.map(u => ({
            name: u.name, score: u.score, isCurrentUser: u.userId === userId
        }));
        users.sort((a, b) => b.score - a.score);
        res.json(users.map((e, i) => ({ ...e, rank: i + 1 })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- ACHIEVEMENTS ---

async function checkAchievements(userId, stats, extra = {}) {
    if (useMemoryDb) {
        const user = getMemUser(userId);
        for (const ach of ACHIEVEMENTS) {
            if (!user.achievements.includes(ach.id) && ach.condition(stats, extra)) {
                user.achievements.push(ach.id);
            }
        }
        return;
    }
    for (const ach of ACHIEVEMENTS) {
        if (ach.condition(stats, extra)) {
            try {
                await UserAchievement.updateOne(
                    { userId, achievementId: ach.id },
                    { $setOnInsert: { userId, achievementId: ach.id, unlockedAt: new Date() } },
                    { upsert: true }
                );
            } catch (e) { /* duplicate key, ignore */ }
        }
    }
}

app.get('/api/achievements', async (req, res) => {
    const userId = getUserId(req);

    if (useMemoryDb) {
        const userAchs = userId ? (getMemUser(userId).achievements || []) : [];
        return res.json(ACHIEVEMENTS.map(a => ({
            id: a.id, title: a.title, description: a.description, icon: a.icon,
            unlocked: userAchs.includes(a.id)
        })));
    }

    try {
        const userAchs = userId ? await UserAchievement.find({ userId }) : [];
        const unlockedIds = userAchs.map(a => a.achievementId);
        res.json(ACHIEVEMENTS.map(a => ({
            id: a.id, title: a.title, description: a.description, icon: a.icon,
            unlocked: unlockedIds.includes(a.id)
        })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- WEEKLY LEADERBOARD ---

function getWeekStart() {
    const now = new Date();
    const day = now.getUTCDay(); // 0=Sun, 1=Mon
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0));
    return monday;
}

app.get('/api/social/weekly', async (req, res) => {
    const userId = getUserId(req);
    const weekStart = getWeekStart();

    if (useMemoryDb) {
        const weekKey = weekStart.toISOString();
        const allUsers = Object.entries(memUsers)
            .filter(([uid, u]) => u.weeklyScores && u.weeklyScores[weekKey])
            .map(([uid, u]) => ({
                name: u.username, score: u.weeklyScores[weekKey], isCurrentUser: uid === userId
            }));
        allUsers.sort((a, b) => b.score - a.score);
        return res.json(allUsers.map((e, i) => ({ ...e, rank: i + 1 })));
    }

    try {
        const entries = await WeeklyScore.find({ weekStart });
        const users = entries.map(e => ({
            name: e.name, score: e.score, isCurrentUser: e.userId === userId
        }));
        users.sort((a, b) => b.score - a.score);
        res.json(users.map((e, i) => ({ ...e, rank: i + 1 })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- DAILY CHALLENGE ---

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function seededShuffle(arr, seed) {
    // Simple seeded PRNG (mulberry32)
    let t = seed | 0;
    const rng = () => { t = (t + 0x6D2B79F5) | 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

app.get('/api/daily', async (req, res) => {
    const userId = getUserId(req);
    const today = getTodayStr();
    // Convert date string to a numeric seed
    const seed = today.split('-').join('') | 0;

    // Import questions from questions.js (use require for simplicity)
    let quizData;
    try {
        delete require.cache[require.resolve('./questions.js')];
        // questions.js uses `const quizData = [...]` — we need to extract it
        const fs = require('fs');
        const code = fs.readFileSync(require.resolve('./questions.js'), 'utf8');
        const fn = new Function(code + '; return quizData;');
        quizData = fn();
    } catch(e) {
        return res.status(500).json({ error: 'Failed to load questions' });
    }

    const shuffled = seededShuffle(quizData, seed);
    const dailyQuestions = shuffled.slice(0, 5);

    // Check if user already played today
    let alreadyPlayed = false;
    if (userId) {
        if (useMemoryDb) {
            const user = getMemUser(userId);
            alreadyPlayed = user.dailyScores && user.dailyScores[today] !== undefined;
        } else {
            const existing = await DailyScore.findOne({ userId, date: today });
            alreadyPlayed = !!existing;
        }
    }

    res.json({
        date: today,
        alreadyPlayed,
        questions: dailyQuestions.map(q => ({
            question: q.question,
            answer: q.answer,
            hint: q.hint,
            category: q.category || 'history',
            difficulty: q.difficulty || 'medium'
        }))
    });
});

app.post('/api/daily', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Not logged in' });
    const { score } = req.body;
    const today = getTodayStr();

    if (useMemoryDb) {
        const user = getMemUser(userId);
        if (!user.dailyScores) user.dailyScores = {};
        if (user.dailyScores[today] !== undefined) {
            return res.status(400).json({ error: 'Already played today' });
        }
        user.dailyScores[today] = score;
        return res.json({ success: true, score });
    }

    try {
        const existing = await DailyScore.findOne({ userId, date: today });
        if (existing) return res.status(400).json({ error: 'Already played today' });
        const user = await User.findOne({ userId });
        await DailyScore.create({ userId, name: user ? user.username : 'Guest', score, date: today });
        res.json({ success: true, score });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/daily/leaderboard', async (req, res) => {
    const userId = getUserId(req);
    const today = getTodayStr();

    if (useMemoryDb) {
        const allUsers = Object.entries(memUsers)
            .filter(([uid, u]) => u.dailyScores && u.dailyScores[today] !== undefined)
            .map(([uid, u]) => ({
                name: u.username, score: u.dailyScores[today], isCurrentUser: uid === userId
            }));
        allUsers.sort((a, b) => b.score - a.score);
        return res.json(allUsers.map((e, i) => ({ ...e, rank: i + 1 })));
    }

    try {
        const entries = await DailyScore.find({ date: today });
        const users = entries.map(e => ({
            name: e.name, score: e.score, isCurrentUser: e.userId === userId
        }));
        users.sort((a, b) => b.score - a.score);
        res.json(users.map((e, i) => ({ ...e, rank: i + 1 })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- COMMUNITY QUESTIONS ---

app.post('/api/community/submit', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Not logged in' });
    const { question, answer, hint, category, difficulty } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });

    if (useMemoryDb) {
        if (!global.memCommunityQuestions) global.memCommunityQuestions = [];
        const user = getMemUser(userId);
        global.memCommunityQuestions.push({
            id: Date.now(),
            userId, authorName: user.username,
            question, answer, hint: hint || '',
            category: category || 'history', difficulty: difficulty || 'medium',
            createdAt: new Date()
        });
        return res.json({ success: true });
    }

    try {
        const user = await User.findOne({ userId });
        await CommunityQuestion.create({
            userId, authorName: user ? user.username : 'Guest',
            question, answer, hint: hint || '',
            category: category || 'history', difficulty: difficulty || 'medium'
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/community/questions', async (req, res) => {
    if (useMemoryDb) {
        return res.json(global.memCommunityQuestions || []);
    }
    try {
        const questions = await CommunityQuestion.find().sort({ createdAt: -1 }).limit(50);
        res.json(questions);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Connect & Start ---

const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
    if (MONGODB_URI) {
        try {
            await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
            console.log('✅ Connected to MongoDB Atlas');
            await seedData();
        } catch (err) {
            console.warn('⚠️  MongoDB connection failed:', err.message);
            console.warn('⚠️  Running with in-memory database (data will not persist)');
            useMemoryDb = true;
        }
    } else {
        console.warn('⚠️  No MONGODB_URI set — running with in-memory database');
        useMemoryDb = true;
    }

    app.listen(PORT, () => {
        console.log(`KVizzing Server running on http://localhost:${PORT}`);
    });
}

startServer();
