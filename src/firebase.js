const admin = require("firebase-admin");
const serviceAccount = require("../build-hub-b043b-firebase-adminsdk-fbsvc-b6008c7b2f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
