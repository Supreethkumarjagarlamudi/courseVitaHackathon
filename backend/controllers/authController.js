import passport from "passport"
import '../middlewares/auth/auth.js'
import User from '../models/userModel.js'

export const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({
            fullName,
            email,
            password,
            method: "local"
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.method !== "local") {
            return res.status(401).json({ message: "Please use Google OAuth to login" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        user.lastLogin = new Date();
        await user.save();

        res.json({
            message: "Login successful",
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const localAuth = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: info.message || "Invalid credentials" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            user.lastLogin = new Date();
            user.save();
            
            res.json({
                message: "Login successful",
                user: user.toJSON()
            });
        });
    })(req, res, next);
};

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ message: "Logout failed" });
            }
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ message: "Session destruction failed" });
                }
                res.json({ message: "Logged out successfully" });
            });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { fullName, profilePicture } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (fullName) user.fullName = fullName;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};