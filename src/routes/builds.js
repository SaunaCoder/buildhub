const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const authMiddleware = require('../authMiddleware');
const authorVerification = require('../authorVerification');
const { FieldValue } = require("firebase-admin/firestore");

// =========================
// BUILDS CRUD
// =========================

// CREATE build
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const author_id = req.user.uid;
    const likes_count = 0;
    const now = new Date();
    const build = { name, description, author_id, likes_count, created_at: now, updated_at: now };
    const docRef = await db.collection("builds").add(build);
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all builds
router.get("/", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("builds").get();
    const builds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(builds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single build
router.get("/:buildId", authMiddleware, async (req, res) => {
  try {
    const doc = await db.collection("builds").doc(req.params.buildId).get();
    const levels_snapshot = await db.collection("builds").doc(req.params.buildId).collection("levels").get();
    const levels = levels_snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (!doc.exists) return res.status(404).json({ message: "Build not found" });
    res.json({ id: doc.id, ...doc.data(), levels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE build
router.put("/:buildId", authMiddleware, async (req, res) => {
  try {
    const old_doc = db.collection("builds").doc(req.params.buildId);
    const isAuthor = await authorVerification(old_doc, req.user.uid);

    if (isAuthor) {
      const updated = { ...req.body, updated_at: new Date() };
      await db.collection("builds").doc(req.params.buildId).update(updated);
      res.json({ message: "Build updated" });
    }
    else {
      res.status(403).json({ error: "You are not the author!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE build
router.delete("/:buildId", authMiddleware, async (req, res) => {
  try {
    const old_doc = db.collection("builds").doc(req.params.buildId);
    const isAuthor = await authorVerification(old_doc, req.user.uid);

    if (isAuthor) {
      await db.collection("builds").doc(req.params.buildId).delete();
      res.json({ message: "Build deleted" });
    }
    else {
      res.status(403).json({ error: "You are not the author!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// LEVELS CRUD (subcollection)
// =========================

// CREATE level
router.post("/:buildId/levels", authMiddleware, async (req, res) => {
  try {
    const { className, feats = [], cantrips = [], spells = [], comment = "" } = req.body;
    const levelData = { class: className, feats, cantrips, spells, comment };
    const build = await db.collection("builds").doc(req.params.buildId);
    const isAuthor = await authorVerification(build, req.user.uid);
    if (isAuthor) {
      build.collection("levels").doc(req.params.levelId).add(levelData);
      res.status(201).json({ id: docRef.id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all levels
router.get("/:buildId/levels", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("builds").doc(req.params.buildId)
      .collection("levels").get();
    const levels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single level
router.get("/:buildId/levels/:levelId", authMiddleware, async (req, res) => {
  try {
    const doc = await db.collection("builds").doc(req.params.buildId)
      .collection("levels").doc(req.params.levelId).get();
    if (!doc.exists) return res.status(404).json({ message: "Level not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE level
router.put("/:buildId/levels/:levelId", authMiddleware, async (req, res) => {
  try {
    const build = await db.collection("builds").doc(req.params.buildId);
    const isAuthor = await authorVerification(build, req.user.uid);
    if (isAuthor) {
      build.collection("levels").doc(req.params.levelId).update(req.body);
      res.json({ message: "Level updated" });
    }
    else {
      res.status(403).json({ error: "You are not the author!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE level
router.delete("/:buildId/levels/:levelId", authMiddleware, async (req, res) => {
  try {
    const build = await db.collection("builds").doc(req.params.buildId);
    const isAuthor = await authorVerification(build, req.user.uid);
    if (isAuthor) {
      build.collection("levels").doc(req.params.levelId).delete();
      res.json({ message: "Level deleted" });
    }
    else {
      res.status(403).json({ error: "You are not the author!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE like
router.post("/:buildId/likes", authMiddleware, async (req, res) => {
  try {
    const build = db.collection("builds").doc(req.params.buildId);
    const like = build.collection("likes").doc(req.user.uid);

    await db.runTransaction(async (tx) => {
      const build_snapshot = await tx.get(build);
      if (!build_snapshot.exists) {
        throw new Error("Build not found");
      }

      const like_snapshot = await tx.get(like);

      if (like_snapshot.exists) {
        tx.delete(like);
        tx.update(build, {
          likes_count: FieldValue.increment(-1),
        });
      } else {
        tx.set(like, { created_at: new Date() });
        tx.update(build, {
          likes_count: FieldValue.increment(1),
        });
      }
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
