const pool = require("../config/db")

// Check In
const checkIn = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const today = new Date().toISOString().split("T")[0]

    const connection = await pool.getConnection()

    // Check if already checked in today
    const [existing] = await connection.query("SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?", [
      user_id,
      today,
    ])

    if (existing.length > 0) {
      connection.release()
      return res.status(400).json({ message: "Already checked in today" })
    }

    // Insert check-in
    await connection.query(
      "INSERT INTO attendance (user_id, check_in, attendance_date, status) VALUES (?, NOW(), ?, 'Present')",
      [user_id, today],
    )

    connection.release()

    res.json({ message: "Checked in successfully" })
  } catch (error) {
    console.error("Check in error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Check Out
const checkOut = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const today = new Date().toISOString().split("T")[0]

    const connection = await pool.getConnection()

    // Update check-out
    await connection.query("UPDATE attendance SET check_out = NOW() WHERE user_id = ? AND attendance_date = ?", [
      user_id,
      today,
    ])

    connection.release()

    res.json({ message: "Checked out successfully" })
  } catch (error) {
    console.error("Check out error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get Attendance Records
const getAttendanceRecords = async (req, res) => {
  try {
    const { user_id, month } = req.query

    const connection = await pool.getConnection()

    let query = "SELECT * FROM attendance WHERE 1=1"
    const params = []

    if (user_id) {
      query += " AND user_id = ?"
      params.push(user_id)
    }

    if (month) {
      query += " AND DATE_FORMAT(attendance_date, '%Y-%m') = ?"
      params.push(month)
    }

    query += " ORDER BY attendance_date DESC"

    const [records] = await connection.query(query, params)

    connection.release()

    res.json(records)
  } catch (error) {
    console.error("Get attendance error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  checkIn,
  checkOut,
  getAttendanceRecords,
}
