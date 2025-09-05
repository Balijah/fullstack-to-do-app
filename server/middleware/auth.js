const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        req.user = { id: payload.id };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = auth;




