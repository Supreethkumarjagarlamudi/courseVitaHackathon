import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
    },
    method: {
        type: String,
        enum: ["google", "local"],
        default: "local"
    },
    createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema);
export default User;