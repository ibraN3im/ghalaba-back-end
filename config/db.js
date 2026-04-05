import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️  MONGODB_URI not set. Database features will be unavailable.');
            return;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn('⚠️  Server will run without database. Some features may not work.');
        // Don't exit, let the server run anyway
    }
};

export default connectDB;
