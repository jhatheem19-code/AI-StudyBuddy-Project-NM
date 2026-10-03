const Material = require("../models/Material");
const StudyPlan = require("../models/StudyPlan");
const { generateText } = require("../services/geminiService");
const parseGeminiJson = require("../utils/parseJson");

async function ownedMaterial(userId, materialId) {
  const material = await Material.findOne({
    _id: materialId,
    user: userId
  });

  if (!material) {
    const error = new Error("Study material not found");
    error.status = 404;
    throw error;
  }

  return material;
}

/**
 * Removes common Markdown formatting returned by Gemini so that
 * plain-text UI components do not display raw #, **, *, or backticks.
 */
function cleanAiText(text = "") {
  return String(text)
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*\*\s+/gm, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * AI SUMMARY
 */
async function summarize(req, res) {
  const material = await ownedMaterial(
    req.user._id,
    req.params.id
  );

  const prompt = `You are AI StudyBuddy.

Generate a concise, exam-oriented summary using ONLY the supplied study material.

Subject: ${material.subject}
Title: ${material.title}

STRICT OUTPUT RULES:
- Return clean plain text only.
- Do not use Markdown.
- Do not use #, ##, **, *, backticks, Markdown tables or code blocks.
- Use simple section headings.
- Use hyphens for important points.
- Keep definitions short and exam-friendly.
- Do not add unrelated facts.
- Base the summary only on the supplied study material.

Suggested structure:

Exam-Oriented Summary

1. Main Concept

Definition:
- Important point
- Important point

2. Important Terms

- Term: definition
- Term: definition

3. Key Revision Points

- Important point
- Important point

Study material:
${material.content}`;

  const generatedSummary = await generateText(prompt);

  material.summary = cleanAiText(generatedSummary);
  material.aiUsageCount += 1;

  await material.save();

  res.json({
    summary: material.summary
  });
}

/**
 * AI FLASHCARDS
 */
async function flashcards(req, res) {
  const material = await ownedMaterial(
    req.user._id,
    req.body.materialId
  );

  const count = Math.min(
    Math.max(Number(req.body.count) || 10, 3),
    30
  );

  const prompt = `You are AI StudyBuddy.

Create ${count} revision flashcards using ONLY the supplied study material.

STRICT RULES:
- Return ONLY valid JSON.
- Do not include Markdown.
- Do not include code fences.
- Keep questions short and focused.
- Keep answers concise and accurate.
- Do not add information unrelated to the material.

Return exactly this JSON structure:

[
  {
    "question": "short focused question",
    "answer": "concise accurate answer"
  }
]

Study material:
${material.content}`;

  const generated = await generateText(prompt);
  const data = parseGeminiJson(generated);

  if (!Array.isArray(data)) {
    const error = new Error(
      "Gemini flashcard response is not an array"
    );
    error.status = 502;
    throw error;
  }

  material.flashcards = data
    .slice(0, count)
    .map((card) => ({
      question: String(card.question || "").trim(),
      answer: String(card.answer || "").trim()
    }))
    .filter((card) => card.question && card.answer);

  material.aiUsageCount += 1;

  await material.save();

  res.json({
    flashcards: material.flashcards
  });
}

/**
 * AI QUIZ
 */
async function quiz(req, res) {
  const material = await ownedMaterial(
    req.user._id,
    req.body.materialId
  );

  const count = Math.min(
    Math.max(Number(req.body.count) || 5, 3),
    20
  );

  const prompt = `You are AI StudyBuddy.

Create ${count} multiple-choice questions using ONLY the supplied study material.

STRICT RULES:
- Return ONLY valid JSON.
- Do not include Markdown.
- Do not include code fences.
- Each question must contain exactly 4 options.
- The answer must exactly match one option.
- Keep the explanation short and useful.
- Do not add unrelated information.

Return exactly this JSON structure:

[
  {
    "question": "question text",
    "options": [
      "option 1",
      "option 2",
      "option 3",
      "option 4"
    ],
    "answer": "exact option text",
    "explanation": "short explanation"
  }
]

Study material:
${material.content}`;

  const generated = await generateText(prompt);
  const data = parseGeminiJson(generated);

  if (!Array.isArray(data)) {
    const error = new Error(
      "Gemini quiz response is not an array"
    );
    error.status = 502;
    throw error;
  }

  material.quiz = data
    .slice(0, count)
    .map((item) => ({
      question: String(item.question || "").trim(),
      options: Array.isArray(item.options)
        ? item.options
            .slice(0, 4)
            .map((option) => String(option).trim())
        : [],
      answer: String(item.answer || "").trim(),
      explanation: String(item.explanation || "").trim()
    }))
    .filter(
      (item) =>
        item.question &&
        item.options.length === 4 &&
        item.answer
    );

  material.aiUsageCount += 1;

  await material.save();

  res.json({
    quiz: material.quiz
  });
}

/**
 * AI STUDY PLAN
 */
async function studyPlan(req, res) {
  const {
    goal,
    subjects = [],
    examDate,
    hoursPerDay = 2
  } = req.body;

  if (!goal || !String(goal).trim()) {
    return res.status(400).json({
      message: "Goal is required"
    });
  }

  const normalizedSubjects = (
    Array.isArray(subjects) ? subjects : [subjects]
  )
    .map((subject) => String(subject).trim())
    .filter(Boolean);

  const normalizedHours = Number(hoursPerDay);

  if (
    !Number.isFinite(normalizedHours) ||
    normalizedHours <= 0 ||
    normalizedHours > 24
  ) {
    return res.status(400).json({
      message: "Hours per day must be between 1 and 24"
    });
  }

  const now = new Date();

  const currentDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  let parsedExamDate = null;

  if (examDate) {
    parsedExamDate = new Date(
      `${examDate}T00:00:00`
    );

    if (Number.isNaN(parsedExamDate.getTime())) {
      return res.status(400).json({
        message: "Invalid exam date"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedExamDate < today) {
      return res.status(400).json({
        message: "Exam date cannot be in the past"
      });
    }
  }

  const sameDayExam =
    parsedExamDate &&
    parsedExamDate.getFullYear() === now.getFullYear() &&
    parsedExamDate.getMonth() === now.getMonth() &&
    parsedExamDate.getDate() === now.getDate();

  const dateInstruction = !examDate
    ? "No exam date was provided. Do not invent calendar dates."
    : sameDayExam
      ? "The exam is today. Create a realistic same-day revision plan only. Do not create a multi-week schedule."
      : `Create the schedule only between ${currentDate} and ${examDate}. Never use a date before ${currentDate} or after ${examDate}.`;

  const prompt = `You are AI StudyBuddy.

Create a practical, personalized and realistic study plan.

Current date: ${currentDate}
Goal: ${String(goal).trim()}
Subjects: ${normalizedSubjects.join(", ") || "Not specified"}
Exam date: ${examDate || "Not specified"}
Available hours per day: ${normalizedHours}

STRICT DATE RULES:
${dateInstruction}

PLAN REQUIREMENTS:
- Use the actual available time before the exam.
- Never invent past dates.
- Never schedule study sessions after the exam date.
- Include active recall.
- Include flashcard review.
- Include quiz or practice-question sessions.
- Include revision and reasonable breaks.
- Prioritize important topics closer to the exam.
- Keep the plan realistic and exam-oriented.

OUTPUT FORMAT:
- Return clean plain text only.
- Do not use Markdown.
- Do not use #, ##, **, *, backticks or Markdown tables.
- Use simple headings.
- Use numbered items or hyphens.
- Keep the schedule easy to read in the application UI.`;

  const generatedPlan = await generateText(prompt);
  const cleanedPlan = cleanAiText(generatedPlan);

  const saved = await StudyPlan.create({
    user: req.user._id,
    goal: String(goal).trim(),
    subjects: normalizedSubjects,
    examDate: examDate || undefined,
    hoursPerDay: normalizedHours,
    plan: cleanedPlan
  });

  res.status(201).json({
    studyPlan: saved
  });
}

module.exports = {
  summarize,
  flashcards,
  quiz,
  studyPlan
};