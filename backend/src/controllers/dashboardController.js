const Material = require("../models/Material");
const StudyPlan = require("../models/StudyPlan");
const ChatSession = require("../models/ChatSession");

async function studentDashboard(req, res) {
  const [materials, studyPlans, chats, recentMaterials] = await Promise.all([
    Material.countDocuments({ user: req.user._id }),
    StudyPlan.countDocuments({ user: req.user._id }),
    ChatSession.countDocuments({ user: req.user._id }),
    Material.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title subject updatedAt")
  ]);

  const usage = await Material.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: null, total: { $sum: "$aiUsageCount" } } }
  ]);

  res.json({
    stats: {
      materials,
      studyPlans,
      chatSessions: chats,
      aiGenerations: usage[0]?.total || 0
    },
    recentMaterials
  });
}

module.exports = { studentDashboard };
