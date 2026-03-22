require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- Mongoose Schemas ---

const statsSchema = new mongoose.Schema({
    gamesPlayed: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    lifetimeKnowledge: { type: Number, default: 0 }
});

const storeItemSchema = new mongoose.Schema({
    itemId: { type: Number, required: true, unique: true },
    title: String,
    type: String,
    cost: Number,
    purchased: { type: Boolean, default: false },
    icon: String
});

const socialSchema = new mongoose.Schema({
    rank: { type: Number, default: 99 },
    name: String,
    score: { type: Number, default: 0 },
    isCurrentUser: { type: Boolean, default: false }
});

const Stats = mongoose.model('Stats', statsSchema);
const StoreItem = mongoose.model('StoreItem', storeItemSchema);
const SocialEntry = mongoose.model('SocialEntry', socialSchema);

// --- In-memory fallback database (used when MongoDB is unavailable) ---
let useMemoryDb = false;
let memDb = {
    stats: { gamesPlayed: 0, highestStreak: 0, lifetimeKnowledge: 0 },
    store: [
        { id: 1, title: "Dark Mode Theme", type: "theme", cost: 500, purchased: false, icon: "dark_mode" },
        { id: 2, title: "Grandmaster Badge", type: "badge", cost: 1000, purchased: false, icon: "workspace_premium" },
        { id: 3, title: "Neon Glow Animations", type: "effect", cost: 1500, purchased: false, icon: "electric_bolt" },
        { id: 4, title: "Ruby Avatar Outline", type: "avatar", cost: 2000, purchased: false, icon: "diamond" }
    ],
    social: [
        { rank: 1, name: "KvizzMaster99", score: 15420 },
        { rank: 2, name: "TriviaNinja", score: 14200 },
        { rank: 3, name: "Brainiac21", score: 12500 },
        { rank: 4, name: "You (Guest)", score: 0, isCurrentUser: true },
        { rank: 5, name: "QuizWhiz", score: 8400 }
    ]
};

// --- Seed default data if MongoDB collections are empty ---
async function seedData() {
    const statsCount = await Stats.countDocuments();
    if (statsCount === 0) {
        await Stats.create({ gamesPlayed: 0, highestStreak: 0, lifetimeKnowledge: 0 });
    }
    const storeCount = await StoreItem.countDocuments();
    if (storeCount === 0) {
        await StoreItem.insertMany([
            { itemId: 1, title: "Dark Mode Theme", type: "theme", cost: 500, purchased: false, icon: "dark_mode" },
            { itemId: 2, title: "Grandmaster Badge", type: "badge", cost: 1000, purchased: false, icon: "workspace_premium" },
            { itemId: 3, title: "Neon Glow Animations", type: "effect", cost: 1500, purchased: false, icon: "electric_bolt" },
            { itemId: 4, title: "Ruby Avatar Outline", type: "avatar", cost: 2000, purchased: false, icon: "diamond" }
        ]);
    }
    const socialCount = await SocialEntry.countDocuments();
    if (socialCount === 0) {
        await SocialEntry.insertMany([
            { rank: 1, name: "KvizzMaster99", score: 15420 },
            { rank: 2, name: "TriviaNinja", score: 14200 },
            { rank: 3, name: "Brainiac21", score: 12500 },
            { rank: 4, name: "You (Guest)", score: 0, isCurrentUser: true },
            { rank: 5, name: "QuizWhiz", score: 8400 }
        ]);
    }
}

// --- API ROUTES ---

// 1. STATS
app.get('/api/stats', async (req, res) => {
    if (useMemoryDb) return res.json(memDb.stats);
    try {
        let stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({});
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/stats', async (req, res) => {
    const { score, streak, username } = req.body;
    if (score === undefined || streak === undefined) {
        return res.status(400).json({ error: "Missing score or streak in body" });
    }

    if (useMemoryDb) {
        memDb.stats.gamesPlayed += 1;
        memDb.stats.lifetimeKnowledge += score;
        if (streak > memDb.stats.highestStreak) memDb.stats.highestStreak = streak;
        const userEntry = memDb.social.find(u => u.isCurrentUser);
        if (userEntry) {
            userEntry.score = memDb.stats.lifetimeKnowledge;
            if (username) userEntry.name = username;
            memDb.social.sort((a, b) => b.score - a.score);
            memDb.social.forEach((u, i) => u.rank = i + 1);
        }
        return res.json(memDb.stats);
    }

    try {
        let stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({});
        stats.gamesPlayed += 1;
        stats.lifetimeKnowledge += score;
        if (streak > stats.highestStreak) stats.highestStreak = streak;
        await stats.save();

        const userEntry = await SocialEntry.findOne({ isCurrentUser: true });
        if (userEntry) {
            userEntry.score = stats.lifetimeKnowledge;
            if (username) userEntry.name = username;
            await userEntry.save();
            const allEntries = await SocialEntry.find().sort({ score: -1 });
            for (let i = 0; i < allEntries.length; i++) {
                allEntries[i].rank = i + 1;
                await allEntries[i].save();
            }
        }
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. STORE
app.get('/api/store', async (req, res) => {
    if (useMemoryDb) return res.json(memDb.store);
    try {
        const items = await StoreItem.find().sort({ itemId: 1 });
        res.json(items.map(i => ({ id: i.itemId, title: i.title, type: i.type, cost: i.cost, purchased: i.purchased, icon: i.icon })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/store/buy', async (req, res) => {
    const { itemId } = req.body;

    if (useMemoryDb) {
        const item = memDb.store.find(i => i.id === itemId);
        if (!item) return res.status(404).json({ error: "Item not found." });
        if (item.purchased) return res.status(400).json({ error: "Item already purchased." });
        if (memDb.stats.lifetimeKnowledge < item.cost) return res.status(400).json({ error: "Not enough knowledge points." });
        memDb.stats.lifetimeKnowledge -= item.cost;
        item.purchased = true;
        return res.json({ success: true, item, remainingPoints: memDb.stats.lifetimeKnowledge });
    }

    try {
        const item = await StoreItem.findOne({ itemId });
        if (!item) return res.status(404).json({ error: "Item not found." });
        if (item.purchased) return res.status(400).json({ error: "Item already purchased." });
        const stats = await Stats.findOne();
        if (!stats || stats.lifetimeKnowledge < item.cost) return res.status(400).json({ error: "Not enough knowledge points." });
        stats.lifetimeKnowledge -= item.cost;
        item.purchased = true;
        await stats.save();
        await item.save();
        res.json({ success: true, item: { id: item.itemId, title: item.title }, remainingPoints: stats.lifetimeKnowledge });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. SOCIAL
app.get('/api/social', async (req, res) => {
    if (useMemoryDb) return res.json(memDb.social);
    try {
        const entries = await SocialEntry.find().sort({ score: -1 });
        res.json(entries.map((e, i) => ({ rank: i + 1, name: e.name, score: e.score, isCurrentUser: e.isCurrentUser || false })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Connect to MongoDB, fallback to in-memory ---

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
