const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const { checkIn, checkOut, getAttendanceRecords } = require("../controllers/attendanceController")

const router = express.Router()

// Employee routes
router.post("/check-in", authMiddleware, roleMiddleware(["Employee"]), checkIn)
router.post("/check-out", authMiddleware, roleMiddleware(["Employee"]), checkOut)

// HR routes
router.get("/records", authMiddleware, roleMiddleware(["HR", "Admin"]), getAttendanceRecords)

module.exports = router
