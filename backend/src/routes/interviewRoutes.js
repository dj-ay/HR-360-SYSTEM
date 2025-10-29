const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const {
  scheduleInterview,
  getInterviews,
  updateInterviewStatus,
  getDashboardStats,
} = require("../controllers/interviewController")

const router = express.Router()

// HR routes
router.post("/schedule", authMiddleware, roleMiddleware(["HR", "Admin"]), scheduleInterview)
router.get("/list", authMiddleware, roleMiddleware(["HR", "Admin"]), getInterviews)
router.put("/:interview_id", authMiddleware, roleMiddleware(["HR", "Admin"]), updateInterviewStatus)
router.get("/dashboard/stats", authMiddleware, roleMiddleware(["HR", "Admin"]), getDashboardStats)

module.exports = router
