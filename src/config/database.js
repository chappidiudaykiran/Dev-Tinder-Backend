const mongoose = require('mongoose');

let cached = global.__mongooseCache;
if (!cached) {
    cached = global.__mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
        throw new Error('MONGODB_URI is not configured');
    }

    try {
        if (!cached.promise) {
            cached.promise = mongoose.connect(dbUri);
        }

        cached.conn = await cached.promise;
        return cached.conn;
    } catch (err) {
        cached.promise = null;
        console.error('MongoDB connection error:', err.message);
        throw err;
    }
};

module.exports = connectDB; 