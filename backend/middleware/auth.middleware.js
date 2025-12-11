const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Use env in production

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <TOKEN>"

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // Attaches { _id: "...", email: "..." } to req
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid Token' });
    }
};

module.exports = verifyToken;