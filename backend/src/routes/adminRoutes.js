const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const {
  getAllUsers,
  updateUserProfile,
  getSystemStats,
  createKPI,
  getKPIRecords,
} = require("../controllers/adminController")

const router = express.Router()

// Admin routes
router.get("/users", authMiddleware, roleMiddleware(["Admin"]), getAllUsers)
router.put("/users/:user_id", authMiddleware, roleMiddleware(["Admin"]), updateUserProfile)
router.get("/stats", authMiddleware, roleMiddleware(["Admin"]), getSystemStats)
router.post("/kpi", authMiddleware, roleMiddleware(["Admin"]), createKPI)
router.get("/kpi", authMiddleware, roleMiddleware(["Admin"]), getKPIRecords)

module.exports = router
