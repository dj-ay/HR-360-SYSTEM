const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const { applyLeave, getLeaveApplications, updateLeaveStatus } = require("../controllers/leaveController")

const router = express.Router()

// Employee routes
router.post("/apply", authMiddleware, roleMiddleware(["Employee"]), applyLeave)

// HR routes
router.get("/applications", authMiddleware, roleMiddleware(["HR", "Admin"]), getLeaveApplications)
router.put("/:leave_id", authMiddleware, roleMiddleware(["HR", "Admin"]), updateLeaveStatus)

module.exports = router
