import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("Database Connection Established");
        });
        
        mongoose.connection.on('error', (err) => {
            console.error("Database connection error:", err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log("Database Connection Disconnected");
        });
        
        await mongoose.connect(`${process.env.MONGODB_URI}/Occasio`);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        // Don't throw error in production, let the app continue
        if (process.env.NODE_ENV === 'development') {
            throw error;
        }
    }
}

export default connectDB;