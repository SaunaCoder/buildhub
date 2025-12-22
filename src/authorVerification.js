const admin = require('./firebase');

/*async function authorVerificationMiddleware(req, res, next) {
    const user_id = req.user.uid;
    const author_id = req.params.author_id;

    if (user_id != author_id) {
        return res.status(403).json({ err: "You are not the author!" })
    }

    next()
    
}*/

async function authorVerification(old_doc, user_id) {
    const snapshot = await old_doc.get();

    if (!snapshot.exists) {
        return false;
    }

    const author_id = snapshot.data().author_id;

    if (user_id != author_id) {
        return false;
    }
    return true;
}

module.exports = authorVerification;