import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
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
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    profilePicture: {
        type: String,
        default: ""
    },
    events: [{
        type: String,
    }],
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now }
})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);
export default User;