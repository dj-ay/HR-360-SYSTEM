const pool = require("../config/db")

// Submit Resignation
const submitResignation = async (req, res) => {
  try {
    const { resignation_date, reason, feedback } = req.body
    const user_id = req.user.user_id

    if (!resignation_date || !reason) {
      return res.status(400).json({ message: "Resignation date and reason are required" })
    }

    const connection = await pool.getConnection()

    // Check if already resigned
    const [existing] = await connection.query(
      "SELECT * FROM resignations WHERE user_id = ? AND status != 'Completed'",
      [user_id],
    )

    if (existing.length > 0) {
      connection.release()
      return res.status(400).json({ message: "You already have a pending resignation" })
    }

    await connection.query(
      "INSERT INTO resignations (user_id, resignation_date, reason, feedback) VALUES (?, ?, ?, ?)",
      [user_id, resignation_date, reason, feedback],
    )

    connection.release()

    res.status(201).json({ message: "Resignation submitted successfully" })
  } catch (error) {
    console.error("Submit resignation error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get Resignations
const getResignations = async (req, res) => {
  try {
    const { status } = req.query

    const connection = await pool.getConnection()

    let query =
      "SELECT r.*, u.name, u.email, u.department FROM resignations r JOIN users u ON r.user_id = u.user_id WHERE 1=1"
    const params = []

    if (status) {
      query += " AND r.status = ?"
      params.push(status)
    }

    query += " ORDER BY r.submitted_at DESC"

    const [resignations] = await connection.query(query, params)

    connection.release()

    res.json(resignations)
  } catch (error) {
    console.error("Get resignations error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Approve Resignation
const approveResignation = async (req, res) => {
  try {
    const { resignation_id } = req.params

    const connection = await pool.getConnection()

    await connection.query("UPDATE resignations SET status = 'Approved' WHERE resignation_id = ?", [resignation_id])

    connection.release()

    res.json({ message: "Resignation approved" })
  } catch (error) {
    console.error("Approve resignation error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Submit Clearance
const submitClearance = async (req, res) => {
  try {
    const { user_id, department } = req.body

    if (!user_id || !department) {
      return res.status(400).json({ message: "User ID and department are required" })
    }

    const connection = await pool.getConnection()

    // Check if clearance already exists
    const [existing] = await connection.query("SELECT * FROM clearances WHERE user_id = ? AND department = ?", [
      user_id,
      department,
    ])

    if (existing.length > 0) {
      connection.release()
      return res.status(400).json({ message: "Clearance already submitted for this department" })
    }

    await connection.query("INSERT INTO clearances (user_id, department) VALUES (?, ?)", [user_id, department])

    connection.release()

    res.status(201).json({ message: "Clearance submitted" })
  } catch (error) {
    console.error("Submit clearance error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get Clearances
const getClearances = async (req, res) => {
  try {
    const { user_id, status } = req.query

    const connection = await pool.getConnection()

    let query = "SELECT c.*, u.name, u.email FROM clearances c JOIN users u ON c.user_id = u.user_id WHERE 1=1"
    const params = []

    if (user_id) {
      query += " AND c.user_id = ?"
      params.push(user_id)
    }

    if (status) {
      query += " AND c.status = ?"
      params.push(status)
    }

    query += " ORDER BY c.status DESC"

    const [clearances] = await connection.query(query, params)

    connection.release()

    res.json(clearances)
  } catch (error) {
    console.error("Get clearances error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Approve Clearance
const approveClearance = async (req, res) => {
  try {
    const { clearance_id } = req.params
    const { approval_feedback } = req.body

    const connection = await pool.getConnection()

    await connection.query(
      "UPDATE clearances SET status = 'Approved', approval_feedback = ?, approved_at = NOW() WHERE clearance_id = ?",
      [approval_feedback || null, clearance_id],
    )

    connection.release()

    res.json({ message: "Clearance approved" })
  } catch (error) {
    console.error("Approve clearance error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  submitResignation,
  getResignations,
  approveResignation,
  submitClearance,
  getClearances,
  approveClearance,
}
