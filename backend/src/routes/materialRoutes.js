const router = require("express").Router();
const upload = require("../middleware/upload");
const { protect, allowRoles } = require("../middleware/auth");
const material = require("../controllers/materialController");
const { summarize } = require("../controllers/aiController");

router.use(protect, allowRoles("student"));

router.get("/", material.list);
router.post("/", upload.single("file"), material.create);
router.get("/:id", material.getOne);
router.put("/:id", material.update);
router.delete("/:id", material.remove);
router.post("/:id/summarize", summarize);

module.exports = router;
