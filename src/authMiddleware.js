const { admin } = require('./firebase');

async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // uid, email и т.д.
        next();
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}

module.exports = authMiddleware;
