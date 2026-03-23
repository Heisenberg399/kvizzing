require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// --- Mongoose Schemas ---

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, default: 'Guest' },
    createdAt: { type: Date, default: Date.now }
});

const statsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    gamesPlayed: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    lifetimeKnowledge: { type: Number, default: 0 }
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
            stats: { gamesPlayed: 0, highestStreak: 0, lifetimeKnowledge: 0 },
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

// --- AUTH ROUTES ---

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
    res.clearCookie('kvizzing_uid');
    res.json({ success: true });
});

app.get('/api/auth/me', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.json({ loggedIn: false });

    if (useMemoryDb) {
        const user = memUsers[userId];
        if (!user) return res.json({ loggedIn: false });
        return res.json({ loggedIn: true, username: user.username, userId });
    }

    try {
        const user = await User.findOne({ userId });
        if (!user) return res.json({ loggedIn: false });
        res.json({ loggedIn: true, username: user.username, userId });
    } catch (e) {
        res.json({ loggedIn: false });
    }
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
    if (!userId) return res.json({ gamesPlayed: 0, highestStreak: 0, lifetimeKnowledge: 0 });

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
        if (streak > user.stats.highestStreak) user.stats.highestStreak = streak;
        user.social.score = user.stats.lifetimeKnowledge;
        return res.json(user.stats);
    }

    try {
        let stats = await Stats.findOne({ userId });
        if (!stats) stats = await Stats.create({ userId });
        stats.gamesPlayed += 1;
        stats.lifetimeKnowledge += score;
        if (streak > stats.highestStreak) stats.highestStreak = streak;
        await stats.save();

        // Update social entry
        await SocialEntry.updateOne({ userId }, { score: stats.lifetimeKnowledge });

        // Check achievements
        const extra = { perfectGame: req.body.perfectGame || false };
        await checkAchievements(userId, stats, extra);

        res.json(stats);
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
        if (user.stats.lifetimeKnowledge < item.cost) return res.status(400).json({ error: 'Not enough points.' });
        user.stats.lifetimeKnowledge -= item.cost;
        user.purchases.push(itemId);
        return res.json({ success: true, remainingPoints: user.stats.lifetimeKnowledge });
    }

    try {
        const item = await StoreItem.findOne({ itemId });
        if (!item) return res.status(404).json({ error: 'Item not found.' });

        const alreadyBought = await UserPurchase.findOne({ userId, itemId });
        if (alreadyBought) return res.status(400).json({ error: 'Already purchased.' });

        const stats = await Stats.findOne({ userId });
        if (!stats || stats.lifetimeKnowledge < item.cost) {
            return res.status(400).json({ error: 'Not enough points.' });
        }

        stats.lifetimeKnowledge -= item.cost;
        await stats.save();
        await UserPurchase.create({ userId, itemId });

        res.json({ success: true, remainingPoints: stats.lifetimeKnowledge });
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
