const router = require("express").Router();
const { protect, allowRoles } = require("../middleware/auth");
const { chat, sessions } = require("../controllers/chatController");

router.use(protect, allowRoles("student"));

router.post("/chat", chat);
router.get("/sessions", sessions);

module.exports = router;
