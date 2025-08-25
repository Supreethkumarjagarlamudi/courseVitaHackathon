import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../../models/userModel.js";
import "dotenv/config";

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        if (user.method !== 'local') {
            return done(null, false, { message: 'Please use Google OAuth to login' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://occasio-backend-cyop.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails?.[0]?.value,
            method: "google",
            isEmailVerified: true,
            profilePicture: profile.photos?.[0]?.value || ""
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
