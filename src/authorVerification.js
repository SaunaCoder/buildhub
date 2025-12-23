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