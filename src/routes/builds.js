const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

// =========================
// BUILDS CRUD
// =========================

// CREATE build
router.post("/", async (req, res) => {
  try {
    const { name, description, author_id } = req.body;
    const now = new Date();
    const build = { name, description, author_id, created_at: now, updated_at: now };
    const docRef = await db.collection("builds").add(build);
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all builds
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("builds").get();
    const builds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(builds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single build
router.get("/:buildId", async (req, res) => {
  try {
    const doc = await db.collection("builds").doc(req.params.buildId).get();
    if (!doc.exists) return res.status(404).json({ message: "Build not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE build
router.put("/:buildId", async (req, res) => {
  try {
    const updated = { ...req.body, updated_at: new Date() };
    await db.collection("builds").doc(req.params.buildId).update(updated);
    res.json({ message: "Build updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE build
router.delete("/:buildId", async (req, res) => {
  try {
    await db.collection("builds").doc(req.params.buildId).delete();
    res.json({ message: "Build deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// LEVELS CRUD (subcollection)
// =========================

// CREATE level
router.post("/:buildId/levels", async (req, res) => {
  try {
    const { className, feats = [], cantrips = [], spells = [], comment = "" } = req.body;
    const levelData = { class: className, feats, cantrips, spells, comment };
    const docRef = await db.collection("builds").doc(req.params.buildId)
      .collection("levels").add(levelData);
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all levels
router.get("/:buildId/levels", async (req, res) => {
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
router.get("/:buildId/levels/:levelId", async (req, res) => {
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
router.put("/:buildId/levels/:levelId", async (req, res) => {
  try {
    await db.collection("builds").doc(req.params.buildId)
      .collection("levels").doc(req.params.levelId).update(req.body);
    res.json({ message: "Level updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE level
router.delete("/:buildId/levels/:levelId", async (req, res) => {
  try {
    await db.collection("builds").doc(req.params.buildId)
      .collection("levels").doc(req.params.levelId).delete();
    res.json({ message: "Level deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
