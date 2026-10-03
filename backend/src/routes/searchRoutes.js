const router = require("express").Router();
const { protect, allowRoles } = require("../middleware/auth");
const { keyword, semantic } = require("../controllers/searchController");

router.use(protect, allowRoles("student"));

router.get("/", keyword);
router.post("/semantic", semantic);

module.exports = router;
