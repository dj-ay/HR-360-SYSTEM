const pool = require("../config/db")

// Schedule Interview
const scheduleInterview = async (req, res) => {
  try {
    const { application_id, mode, interview_date, interview_time } = req.body

    if (!application_id || !mode || !interview_date || !interview_time) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const connection = await pool.getConnection()

    // Check if application exists
    const [applications] = await connection.query("SELECT * FROM applications WHERE application_id = ?", [
      application_id,
    ])

    if (applications.length === 0) {
      connection.release()
      return res.status(404).json({ message: "Application not found" })
    }

    // Insert interview
    await connection.query(
      "INSERT INTO interviews (application_id, mode, interview_date, interview_time) VALUES (?, ?, ?, ?)",
      [application_id, mode, interview_date, interview_time],
    )

    // Update application status
    await connection.query("UPDATE applications SET status = 'Interview' WHERE application_id = ?", [application_id])

    connection.release()

    res.status(201).json({ message: "Interview scheduled successfully" })
  } catch (error) {
    console.error("Schedule interview error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get Interviews
const getInterviews = async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [interviews] = await connection.query(
      `SELECT i.*, a.candidate_id, u.name, u.email, jp.title 
       FROM interviews i
       JOIN applications a ON i.application_id = a.application_id
       JOIN users u ON a.candidate_id = u.user_id
       JOIN job_posts jp ON a.job_id = jp.job_id
       ORDER BY i.interview_date DESC`,
    )

    connection.release()

    res.json(interviews)
  } catch (error) {
    console.error("Get interviews error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update Interview Status
const updateInterviewStatus = async (req, res) => {
  try {
    const { interview_id } = req.params
    const { status, feedback } = req.body

    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const connection = await pool.getConnection()

    await connection.query("UPDATE interviews SET status = ?, feedback = ? WHERE interview_id = ?", [
      status,
      feedback || null,
      interview_id,
    ])

    connection.release()

    res.json({ message: "Interview status updated" })
  } catch (error) {
    console.error("Update interview error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get HR Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const connection = await pool.getConnection()

    // Total applications
    const [totalApps] = await connection.query("SELECT COUNT(*) as count FROM applications")

    // Pending applications
    const [pendingApps] = await connection.query("SELECT COUNT(*) as count FROM applications WHERE status = 'Pending'")

    // Shortlisted
    const [shortlisted] = await connection.query(
      "SELECT COUNT(*) as count FROM applications WHERE status = 'Shortlisted'",
    )

    // Interviews scheduled
    const [interviews] = await connection.query("SELECT COUNT(*) as count FROM interviews WHERE status = 'Scheduled'")

    // Total employees
    const [employees] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'Employee'")

    connection.release()

    res.json({
      totalApplications: totalApps[0].count,
      pendingApplications: pendingApps[0].count,
      shortlistedCandidates: shortlisted[0].count,
      scheduledInterviews: interviews[0].count,
      totalEmployees: employees[0].count,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  scheduleInterview,
  getInterviews,
  updateInterviewStatus,
  getDashboardStats,
}
