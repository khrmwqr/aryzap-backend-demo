const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Assuming "Bearer <token>" format
    const validToken = process.env.APPS_SECRET_KEY; // Replace with your API key or token

    if (token !== validToken) {
        return res.status(403).json({ error: 'invalid token' });
    }

    next(); // Proceed to the next middleware or route handler
};

module.exports = authMiddleware;