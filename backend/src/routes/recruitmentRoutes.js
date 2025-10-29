const express = require("express")
const multer = require("multer")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const {
  createJobPost,
  getJobPosts,
  applyForJob,
  getApplications,
  updateApplicationStatus,
  parseResume,
} = require("../controllers/recruitmentController")

const router = express.Router()

// File upload configuration
const upload = multer({ dest: "uploads/resumes/" })

// Public routes
router.get("/jobs", getJobPosts)

// Candidate routes
router.post("/apply", authMiddleware, roleMiddleware(["Candidate"]), upload.single("resume"), applyForJob)
router.post("/parse-resume", authMiddleware, upload.single("resume"), parseResume)

// HR routes
router.post("/job-post", authMiddleware, roleMiddleware(["HR", "Admin"]), createJobPost)
router.get("/applications/:job_id", authMiddleware, roleMiddleware(["HR", "Admin"]), getApplications)
router.put("/application/:application_id", authMiddleware, roleMiddleware(["HR", "Admin"]), updateApplicationStatus)

module.exports = router
