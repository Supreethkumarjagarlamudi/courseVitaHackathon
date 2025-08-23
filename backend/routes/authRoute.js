import express from 'express'
import '../middlewares/auth/auth.js'
import passport from 'passport';
import { isLoggedIn } from '../middlewares/middleware.js';

const authRouter = express.Router();

authRouter.get("/googleOauth", passport.authenticate('google', {scope: ['email', 'profile']}));
authRouter.get("/google/callback", passport.authenticate('google', {
    successRedirect: "http://localhost:3000/api/auth/success",
    failureRedirect: "http://localhost:3000/api/auth/failure"
}));

authRouter.get("/success", isLoggedIn,  (req, res) => {
    return res.redirect(`http://localhost:3001?&auth=true`)
})

authRouter.get("/failure", (req, res) => {
    return res.redirect(`http://localhost:3001?&auth=false`)
})

export default authRouter;