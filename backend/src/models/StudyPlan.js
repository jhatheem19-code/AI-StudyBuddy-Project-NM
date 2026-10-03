const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    goal: { type: String, required: true },
    subjects: [String],
    examDate: Date,
    hoursPerDay: Number,
    plan: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
