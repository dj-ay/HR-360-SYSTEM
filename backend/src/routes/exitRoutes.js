const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const {
  submitResignation,
  getResignations,
  approveResignation,
  submitClearance,
  getClearances,
  approveClearance,
} = require("../controllers/exitController")

const router = express.Router()

// Employee routes
router.post("/resign", authMiddleware, roleMiddleware(["Employee"]), submitResignation)

// HR routes
router.get("/resignations", authMiddleware, roleMiddleware(["HR", "Admin"]), getResignations)
router.put("/resign/:resignation_id", authMiddleware, roleMiddleware(["HR", "Admin"]), approveResignation)
router.post("/clearance", authMiddleware, roleMiddleware(["HR", "Admin"]), submitClearance)
router.get("/clearances", authMiddleware, roleMiddleware(["HR", "Admin"]), getClearances)
router.put("/clearance/:clearance_id", authMiddleware, roleMiddleware(["HR", "Admin"]), approveClearance)

module.exports = router
