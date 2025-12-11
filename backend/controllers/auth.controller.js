const AuthService = require('../services/auth.service');

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body; // The token from the frontend (Google Button)
        if (!token) throw new Error('Google token is missing');

        const result = await AuthService.loginWithGoogle(token);

        // Send back the App Token and User Info
        res.json(result);
    } catch (error) {
        res.status(401).json({ message: 'Google Authentication Failed: ' + error.message });
    }
};

module.exports = { googleLogin };