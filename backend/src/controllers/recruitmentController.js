const pool = require("../config/db")
const axios = require("axios")
const fs = require("fs")
const path = require("path")

// Create Job Post
const createJobPost = async (req, res) => {
  try {
    const { title, department, description, skills, deadline } = req.body
    const created_by = req.user.user_id

    if (!title || !department || !description || !skills || !deadline) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const connection = await pool.getConnection()

    await connection.query(
      "INSERT INTO job_posts (title, department, description, skills, deadline, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [title, department, description, skills, deadline, created_by],
    )

    connection.release()

    res.status(201).json({ message: "Job post created successfully" })
  } catch (error) {
    console.error("Create job post error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get All Job Posts
const getJobPosts = async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [jobs] = await connection.query("SELECT * FROM job_posts WHERE status = 'Open' ORDER BY created_at DESC")

    connection.release()

    res.json(jobs)
  } catch (error) {
    console.error("Get job posts error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Apply for Job
const applyForJob = async (req, res) => {
  try {
    const { job_id } = req.body
    const candidate_id = req.user.user_id
    const resume = req.file ? req.file.filename : null

    if (!job_id) {
      return res.status(400).json({ message: "Job ID is required" })
    }

    const connection = await pool.getConnection()

    // Check if already applied
    const [existingApplication] = await connection.query(
      "SELECT * FROM applications WHERE candidate_id = ? AND job_id = ?",
      [candidate_id, job_id],
    )

    if (existingApplication.length > 0) {
      connection.release()
      return res.status(400).json({ message: "Already applied for this job" })
    }

    // Insert application
    await connection.query("INSERT INTO applications (candidate_id, job_id, resume) VALUES (?, ?, ?)", [
      candidate_id,
      job_id,
      resume,
    ])

    connection.release()

    res.status(201).json({ message: "Application submitted successfully" })
  } catch (error) {
    console.error("Apply for job error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get Applications for Job
const getApplications = async (req, res) => {
  try {
    const { job_id } = req.params

    const connection = await pool.getConnection()

    const [applications] = await connection.query(
      `SELECT a.*, u.name, u.email FROM applications a 
       JOIN users u ON a.candidate_id = u.user_id 
       WHERE a.job_id = ? ORDER BY a.applied_at DESC`,
      [job_id],
    )

    connection.release()

    res.json(applications)
  } catch (error) {
    console.error("Get applications error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update Application Status
const updateApplicationStatus = async (req, res) => {
  try {
    const { application_id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const connection = await pool.getConnection()

    await connection.query("UPDATE applications SET status = ? WHERE application_id = ?", [status, application_id])

    connection.release()

    res.json({ message: "Application status updated" })
  } catch (error) {
    console.error("Update application error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Parse Resume (calls Python backend)
const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" })
    }

    // Call Python resume parser API
    const formData = new FormData()
    formData.append("file", fs.createReadStream(req.file.path))

    const response = await axios.post("http://localhost:5001/parse-resume", formData, {
      headers: formData.getHeaders(),
    })

    res.json(response.data)
  } catch (error) {
    console.error("Parse resume error:", error)
    res.status(500).json({ message: "Error parsing resume" })
  }
}

module.exports = {
  createJobPost,
  getJobPosts,
  applyForJob,
  getApplications,
  updateApplicationStatus,
  parseResume,
}
