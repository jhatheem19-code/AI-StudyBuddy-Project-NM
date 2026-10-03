const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  { question: String, answer: String },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    answer: String,
    explanation: String
  },
  { _id: false }
);

const materialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    subject: { type: String, required: true, trim: true, maxlength: 120, index: true },
    content: { type: String, required: true },
    filename: String,
    summary: String,
    flashcards: [flashcardSchema],
    quiz: [quizSchema],
    aiUsageCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
