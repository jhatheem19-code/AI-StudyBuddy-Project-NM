const pdfParse = require("pdf-parse");
const Material = require("../models/Material");
const MaterialChunk = require("../models/MaterialChunk");
const { indexMaterial } = require("../services/indexingService");

async function fileText(file) {
  if (!file) return "";
  if (file.mimetype === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    return parsed.text || "";
  }
  return file.buffer.toString("utf8");
}

async function list(req, res) {
  const materials = await Material.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select("-content");
  res.json({ materials });
}

async function getOne(req, res) {
  const material = await Material.findOne({ _id: req.params.id, user: req.user._id });
  if (!material) return res.status(404).json({ message: "Study material not found" });
  res.json({ material });
}

async function create(req, res) {
  const uploadedText = await fileText(req.file);
  const content = String(req.body.content || uploadedText || "").trim();

  if (!req.body.title || !req.body.subject || !content) {
    return res.status(400).json({
      message: "Title, subject and study content or a supported file are required"
    });
  }

  const material = await Material.create({
    user: req.user._id,
    title: req.body.title,
    subject: req.body.subject,
    content,
    filename: req.file?.originalname
  });

  const indexing = await indexMaterial(material);
  res.status(201).json({ message: "Study material created", material, indexing });
}

async function update(req, res) {
  const material = await Material.findOne({ _id: req.params.id, user: req.user._id });
  if (!material) return res.status(404).json({ message: "Study material not found" });

  const allowed = ["title", "subject", "content"];
  let reindex = false;

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      material[key] = req.body[key];
      if (key === "content") reindex = true;
    }
  }

  await material.save();
  const indexing = reindex ? await indexMaterial(material) : null;
  res.json({ message: "Study material updated", material, indexing });
}

async function remove(req, res) {
  const material = await Material.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!material) return res.status(404).json({ message: "Study material not found" });

  await MaterialChunk.deleteMany({ material: material._id, user: req.user._id });
  res.json({ message: "Study material deleted" });
}

module.exports = { list, getOne, create, update, remove };
