const MaterialChunk = require("../models/MaterialChunk");
const chunkText = require("../utils/chunkText");
const { embedText } = require("./geminiService");

async function indexMaterial(material) {
  const chunks = chunkText(material.content);
  await MaterialChunk.deleteMany({ material: material._id, user: material.user });

  let embedded = 0;
  for (let i = 0; i < chunks.length; i += 1) {
    let embedding;
    try {
      embedding = await embedText(chunks[i]);
      embedded += 1;
    } catch (error) {
      console.warn(`Embedding unavailable for chunk ${i}: ${error.message}`);
    }

    await MaterialChunk.create({
      user: material.user,
      material: material._id,
      chunkIndex: i,
      text: chunks[i],
      embedding
    });
  }

  return { chunkCount: chunks.length, embeddedCount: embedded };
}

module.exports = { indexMaterial };
