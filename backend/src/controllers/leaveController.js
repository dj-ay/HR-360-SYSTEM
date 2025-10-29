const pool = require("../config/db")

// Apply for Leave
const applyLeave = async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body
    const user_id = req.user.user_id

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    const connection = await pool.getConnection()

    await connection.query(
      "INSERT INTO leaves (user_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)",
      [user_id, leave_type, start_date, end_date, reason],
    )

    connection.release()

    res.status(201).json({ message: "Leave application submitted" })
  } catch (error) {
    console.error("Apply leave error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get Leave Applications
const getLeaveApplications = async (req, res) => {
  try {
    const { user_id, status } = req.query

    const connection = await pool.getConnection()

    let query = "SELECT l.*, u.name, u.email FROM leaves l JOIN users u ON l.user_id = u.user_id WHERE 1=1"
    const params = []

    if (user_id) {
      query += " AND l.user_id = ?"
      params.push(user_id)
    }

    if (status) {
      query += " AND l.status = ?"
      params.push(status)
    }

    query += " ORDER BY l.applied_at DESC"

    const [leaves] = await connection.query(query, params)

    connection.release()

    res.json(leaves)
  } catch (error) {
    console.error("Get leave applications error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Approve/Reject Leave
const updateLeaveStatus = async (req, res) => {
  try {
    const { leave_id } = req.params
    const { status } = req.body
    const approved_by = req.user.user_id

    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const connection = await pool.getConnection()

    await connection.query("UPDATE leaves SET status = ?, approved_by = ? WHERE leave_id = ?", [
      status,
      approved_by,
      leave_id,
    ])

    // If approved, update attendance status
    if (status === "Approved") {
      const [leaveData] = await connection.query("SELECT * FROM leaves WHERE leave_id = ?", [leave_id])

      if (leaveData.length > 0) {
        const leave = leaveData[0]
        const start = new Date(leave.start_date)
        const end = new Date(leave.end_date)

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0]
          await connection.query(
            "INSERT INTO attendance (user_id, attendance_date, status) VALUES (?, ?, 'Leave') ON DUPLICATE KEY UPDATE status = 'Leave'",
            [leave.user_id, dateStr],
          )
        }
      }
    }

    connection.release()

    res.json({ message: "Leave status updated" })
  } catch (error) {
    console.error("Update leave status error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  applyLeave,
  getLeaveApplications,
  updateLeaveStatus,
}
