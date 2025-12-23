const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const authMiddleware = require("../authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
    try {
        const docRef = await db.collection("users").doc(req.user.uid).set({ created_at: new Date() });
        res.status(201).json({ id: docRef.id });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection("users").get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const doc = await db.collection("users").doc(req.params.userId).get();
        if (!doc.exists) return res.status(404).json({ message: "User not found" });
        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/me", authMiddleware, async(req, res) => {
    try {
        const name = req.body.name;
        const bio = req.body.bio;

        const updated = { name, bio };

        await db.collection("users").doc(req.user.uid).update(updated);
        res.status(200).json({ message: "Your data was updated! "});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TODO create profile and account delete functionality
