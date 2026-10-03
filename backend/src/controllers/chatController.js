const ChatSession = require("../models/ChatSession");
const MaterialChunk = require("../models/MaterialChunk");
const { embedText, generateText } = require("../services/geminiService");

function cleanAiText(text = "") {
  return String(text)
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*\*\s+/gm, "- ")
    .replace(/^\s*---+\s*$/gm, "")
    .replace(/^\s*\*{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function retrieveContext(userId, question) {
  try {
    const queryVector = await embedText(question);

    return await MaterialChunk.aggregate([
      {
        $vectorSearch: {
          index:
            process.env.ATLAS_VECTOR_INDEX ||
            "study_material_vector",
          path: "embedding",
          queryVector,
          numCandidates: 100,
          limit: 6,
          filter: {
            user: userId
          }
        }
      },
      {
        $project: {
          text: 1,
          material: 1,
          score: {
            $meta: "vectorSearchScore"
          }
        }
      }
    ]);
  } catch (error) {
    console.warn(
      `RAG retrieval skipped: ${error.message}`
    );

    return [];
  }
}

async function chat(req, res) {
  const { message, sessionId } = req.body;

  const normalizedMessage = String(message || "").trim();

  if (!normalizedMessage) {
    return res.status(400).json({
      message: "Message is required"
    });
  }

  let session = null;

  if (sessionId) {
    session = await ChatSession.findOne({
      _id: sessionId,
      user: req.user._id
    });
  }

  if (!session) {
    session = await ChatSession.create({
      user: req.user._id,
      title: normalizedMessage.slice(0, 60),
      messages: []
    });
  }

  const context = await retrieveContext(
    req.user._id,
    normalizedMessage
  );

  const contextText = context
    .map(
      (item, index) =>
        `[Retrieved Context ${index + 1}]\n${item.text}`
    )
    .join("\n\n");

  const recent = session.messages
    .slice(-8)
    .map(
      (item) =>
        `${item.role.toUpperCase()}: ${item.content}`
    )
    .join("\n");

  const prompt = `You are the AI StudyBuddy Study Assistant.

Your purpose is education and study support.

RULES:
1. Prefer retrieved study context when available.
2. Do not claim that the retrieved context contains information that it does not contain.
3. If saved study context is insufficient, clearly say that and distinguish any general explanation.
4. Keep the answer concise, clear, structured and student-friendly.
5. Do not behave like a general entertainment chatbot.
6. Do not invent facts from the student's notes.
7. When answering from retrieved context, stay faithful to that context.

OUTPUT FORMAT:
- Return clean plain text only.
- Do not use Markdown.
- Do not use #, ##, **, *, backticks or Markdown tables.
- Do not use decorative separators such as *** or ---.
- Use simple headings only when useful.
- Use hyphens for short lists.
- Keep answers easy to read inside the application chat UI.

Retrieved study context:
${contextText || "No matching saved context was retrieved."}

Recent conversation:
${recent || "No previous messages."}

Student question:
${normalizedMessage}`;

  const generatedAnswer = await generateText(prompt);
  const answer = cleanAiText(generatedAnswer);

  session.messages.push({
    role: "user",
    content: normalizedMessage
  });

  session.messages.push({
    role: "assistant",
    content: answer
  });

  await session.save();

  res.json({
    sessionId: session._id,
    answer,
    sources: context.map((item) => ({
      materialId: item.material,
      score: item.score
    }))
  });
}

async function sessions(req, res) {
  const items = await ChatSession.find({
    user: req.user._id
  })
    .sort({
      updatedAt: -1
    })
    .limit(30);

  res.json({
    sessions: items
  });
}

module.exports = {
  chat,
  sessions
};