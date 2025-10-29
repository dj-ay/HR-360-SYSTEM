const pool = require("../config/db")

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query

    const connection = await pool.getConnection()

    let query = "SELECT user_id, name, email, role, department, designation, created_at FROM users WHERE 1=1"
    const params = []

    if (role) {
      query += " AND role = ?"
      params.push(role)
    }

    query += " ORDER BY created_at DESC"

    const [users] = await connection.query(query, params)

    connection.release()

    res.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const { user_id } = req.params
    const { name, department, designation, phone } = req.body

    const connection = await pool.getConnection()

    await connection.query("UPDATE users SET name = ?, department = ?, designation = ?, phone = ? WHERE user_id = ?", [
      name,
      department,
      designation,
      phone,
      user_id,
    ])

    connection.release()

    res.json({ message: "User profile updated" })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get System Statistics
const getSystemStats = async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [totalUsers] = await connection.query("SELECT COUNT(*) as count FROM users")
    const [employees] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'Employee'")
    const [candidates] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'Candidate'")
    const [totalJobs] = await connection.query("SELECT COUNT(*) as count FROM job_posts")
    const [totalApplications] = await connection.query("SELECT COUNT(*) as count FROM applications")
    const [totalPayroll] = await connection.query("SELECT SUM(net_salary) as total FROM payroll")

    connection.release()

    res.json({
      totalUsers: totalUsers[0].count,
      employees: employees[0].count,
      candidates: candidates[0].count,
      totalJobs: totalJobs[0].count,
      totalApplications: totalApplications[0].count,
      totalPayroll: totalPayroll[0].total || 0,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create KPI Record
const createKPI = async (req, res) => {
  try {
    const { user_id, evaluation_period, rating, remarks } = req.body

    if (!user_id || !evaluation_period || !rating) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    const connection = await pool.getConnection()

    await connection.query("INSERT INTO kpi (user_id, evaluation_period, rating, remarks) VALUES (?, ?, ?, ?)", [
      user_id,
      evaluation_period,
      rating,
      remarks,
    ])

    connection.release()

    res.status(201).json({ message: "KPI record created" })
  } catch (error) {
    console.error("Create KPI error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get KPI Records
const getKPIRecords = async (req, res) => {
  try {
    const { user_id } = req.query

    const connection = await pool.getConnection()

    let query = "SELECT k.*, u.name, u.email FROM kpi k JOIN users u ON k.user_id = u.user_id WHERE 1=1"
    const params = []

    if (user_id) {
      query += " AND k.user_id = ?"
      params.push(user_id)
    }

    query += " ORDER BY k.created_at DESC"

    const [records] = await connection.query(query, params)

    connection.release()

    res.json(records)
  } catch (error) {
    console.error("Get KPI error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getAllUsers,
  updateUserProfile,
  getSystemStats,
  createKPI,
  getKPIRecords,
}
