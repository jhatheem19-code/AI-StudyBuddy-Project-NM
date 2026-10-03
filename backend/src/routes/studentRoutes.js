const router = require("express").Router();
const { protect, allowRoles } = require("../middleware/auth");
const { studentDashboard } = require("../controllers/dashboardController");

router.get("/dashboard", protect, allowRoles("student"), studentDashboard);

module.exports = router;
