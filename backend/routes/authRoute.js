import express from 'express'
import '../middlewares/auth/auth.js'
import passport from 'passport';
import { isLoggedIn, requireAuth, isNotLoggedIn } from '../middlewares/middleware.js';
import { 
    register, 
    localAuth, 
    getCurrentUser, 
    logout, 
    updateProfile 
} from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post("/register", isNotLoggedIn, register);
authRouter.post("/login", isNotLoggedIn, localAuth);

authRouter.get("/googleOauth", isNotLoggedIn, passport.authenticate('google', {scope: ['email', 'profile']}));
authRouter.get("/google/callback", passport.authenticate('google', {
    successRedirect: "http://localhost:3001/",
    failureRedirect: "http://localhost:3001/login?auth=false"
}));

authRouter.get("/me", requireAuth, getCurrentUser);
authRouter.post("/logout", requireAuth, logout);
authRouter.put("/profile", requireAuth, updateProfile);

authRouter.get("/status", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ 
            authenticated: true, 
            user: req.user.toJSON() 
        });
    } else {
        res.json({ authenticated: false });
    }
});

export default authRouter;