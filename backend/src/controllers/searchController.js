const mongoose = require("mongoose");
const Material = require("../models/Material");
const MaterialChunk = require("../models/MaterialChunk");
const { embedText } = require("../services/geminiService");

async function keyword(req, res) {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ message: "Search query is required" });

  try {
    const results = await Material.aggregate([
      {
        $search: {
          index: process.env.ATLAS_SEARCH_INDEX || "study_material_search",
          compound: {
            filter: [{ equals: { path: "user", value: req.user._id } }],
            should: [
              { text: { query: q, path: "title", fuzzy: {} } },
              { text: { query: q, path: "subject", fuzzy: {} } },
              { text: { query: q, path: "content" } }
            ],
            minimumShouldMatch: 1
          }
        }
      },
      { $limit: 12 },
      {
        $project: {
          title: 1,
          subject: 1,
          createdAt: 1,
          score: { $meta: "searchScore" }
        }
      }
    ]);
    res.json({ mode: "atlas-search", results });
  } catch (error) {
    const results = await Material.find({
      user: req.user._id,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ]
    }).limit(12).select("title subject createdAt");

    res.json({
      mode: "regex-fallback",
      warning: "Atlas Search index was unavailable; regex fallback used.",
      results
    });
  }
}

async function semantic(req, res) {
  const { query, materialId } = req.body;
  const limit = Math.min(Number(req.body.limit) || 6, 12);

  if (!query) return res.status(400).json({ message: "Query is required" });

  const vector = await embedText(query);
  const filter = { user: req.user._id };

  if (materialId) {
    if (!mongoose.isValidObjectId(materialId)) {
      return res.status(400).json({ message: "Invalid materialId" });
    }
    filter.material = new mongoose.Types.ObjectId(materialId);
  }

  try {
    const results = await MaterialChunk.aggregate([
      {
        $vectorSearch: {
          index: process.env.ATLAS_VECTOR_INDEX || "study_material_vector",
          path: "embedding",
          queryVector: vector,
          numCandidates: 100,
          limit,
          filter
        }
      },
      {
        $project: {
          text: 1,
          material: 1,
          chunkIndex: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    res.json({ mode: "atlas-vector-search", results });
  } catch (error) {
    error.status = 503;
    error.message =
      "Atlas Vector Search is not available. Create the supplied vector index and wait until it becomes ACTIVE.";
    throw error;
  }
}

module.exports = { keyword, semantic };
