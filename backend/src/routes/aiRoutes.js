const router = require("express").Router();
const { protect, allowRoles } = require("../middleware/auth");
const { flashcards, quiz, studyPlan } = require("../controllers/aiController");

router.use(protect, allowRoles("student"));

router.post("/flashcards", flashcards);
router.post("/quiz", quiz);
router.post("/study-plan", studyPlan);

module.exports = router;
