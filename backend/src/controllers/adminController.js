const mongoose = require("mongoose");
const User = require("../models/User");
const Material = require("../models/Material");
const MaterialChunk = require("../models/MaterialChunk");
const StudyPlan = require("../models/StudyPlan");
const ChatSession = require("../models/ChatSession");

async function dashboard(req, res) {
  const [users, students, admins, activeUsers, materials, studyPlans, chatSessions] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ active: true }),
      Material.countDocuments(),
      StudyPlan.countDocuments(),
      ChatSession.countDocuments()
    ]);

  res.json({
    stats: { users, students, admins, activeUsers, materials, studyPlans, chatSessions }
  });
}

async function users(req, res) {
  const items = await User.find().sort({ createdAt: -1 }).select("-password");
  res.json({ users: items });
}

async function toggleUser(req, res) {
  if (String(req.user._id) === String(req.params.id)) {
    return res.status(400).json({ message: "You cannot disable your current admin account" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.active = !user.active;
  await user.save();

  res.json({
    message: user.active ? "User enabled" : "User disabled",
    user: { id: user._id, name: user.name, email: user.email, role: user.role, active: user.active }
  });
}

async function materials(req, res) {
  const items = await Material.find()
    .populate("user", "name email role")
    .sort({ updatedAt: -1 })
    .select("-content");

  res.json({ materials: items });
}

async function reports(req, res) {
  const aiUsageBySubject = await Material.aggregate([
    {
      $group: {
        _id: "$subject",
        materials: { $sum: 1 },
        aiUsage: { $sum: "$aiUsageCount" }
      }
    },
    { $sort: { aiUsage: -1 } }
  ]);

  const registrations = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        registrations: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 30 }
  ]);

  res.json({ aiUsageBySubject, registrations });
}

async function systemHealth(req, res) {
  const dbConnected = mongoose.connection.readyState === 1;

  const [users, materials, chunks] = await Promise.all([
    User.countDocuments(),
    Material.countDocuments(),
    MaterialChunk.countDocuments()
  ]);

  res.json({
    status: dbConnected ? "healthy" : "degraded",
    database: dbConnected ? "connected" : "disconnected",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    atlasSearchIndex: process.env.ATLAS_SEARCH_INDEX || "study_material_search",
    atlasVectorIndex: process.env.ATLAS_VECTOR_INDEX || "study_material_vector",
    uptimeSeconds: Math.round(process.uptime()),
    counts: { users, materials, chunks },
    timestamp: new Date().toISOString()
  });
}

module.exports = { dashboard, users, toggleUser, materials, reports, systemHealth };
