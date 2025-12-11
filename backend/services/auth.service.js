const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Get this from your Google Cloud Console
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const loginWithGoogle = async (googleIdToken) => {
    // 1. Verify the Google Token
    const ticket = await client.verifyIdToken({
        idToken: googleIdToken,
        audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload; // 'sub' is Google's unique user ID

    // 2. Check if user exists in YOUR DB
    let user = await User.findOne({ email });

    if (!user) {
        // 3. Register if new
        user = new User({
            name,
            email,
            google_id: googleId,
            is_premium: false
        });
        await user.save();
    } else if (!user.google_id) {
        // Optional: Link existing user to Google Account if they registered differently before
        user.google_id = googleId;
        await user.save();
    }

    // 4. Generate YOUR App Token (Session Token)
    const token = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            is_premium: user.is_premium
        },
        JWT_SECRET,
        { expiresIn: '7d' } // User stays logged in for 7 days
    );

    return { token, user };
};

module.exports = { loginWithGoogle };