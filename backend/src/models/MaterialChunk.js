const mongoose = require("mongoose");

const materialChunkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true, index: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], default: undefined }
  },
  { timestamps: true }
);

materialChunkSchema.index({ material: 1, chunkIndex: 1 }, { unique: true });

module.exports = mongoose.model("MaterialChunk", materialChunkSchema);
