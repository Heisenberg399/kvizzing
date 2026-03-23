require('dotenv').config();
const mongoose = require('mongoose');

if (!process.env.MONGODB_URI) {
    console.log("No MONGODB_URI found, nothing to purge.");
    process.exit(0);
}

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB. Purging scoreboards and resetting stats...');
    
    try {
        await mongoose.connection.collection('socialentries').deleteMany({});
        await mongoose.connection.collection('weeklyscores').deleteMany({});
        await mongoose.connection.collection('dailyscores').deleteMany({});
        console.log('Scoreboards (All-time, Weekly, Daily) have been purged.');

        // Reset all user stats to 0 so they don't immediately regain top spots with old XP
        await mongoose.connection.collection('stats').updateMany({}, { 
            $set: { lifetimeKnowledge: 0, walletPoints: 0, highestStreak: 0, gamesPlayed: 0 } 
        });
        // Also clear purchases since wallet is 0
        await mongoose.connection.collection('userpurchases').deleteMany({});
        
        console.log('All user Stats (XP, Points, Streaks) and store purchases have been reset to 0.');

    } catch (e) {
        console.error('Error purging collections:', e);
    }
    
    mongoose.disconnect();
    console.log('Database Purge Complete.');
});
