const router = require("express").Router();
const { protect, allowRoles } = require("../middleware/auth");
const admin = require("../controllers/adminController");

router.use(protect, allowRoles("admin"));

router.get("/dashboard", admin.dashboard);
router.get("/users", admin.users);
router.patch("/users/:id/toggle-active", admin.toggleUser);
router.get("/materials", admin.materials);
router.get("/reports", admin.reports);
router.get("/system-health", admin.systemHealth);

module.exports = router;
