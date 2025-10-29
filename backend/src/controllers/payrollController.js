const pool = require("../config/db")

// Create Payroll Record
const createPayroll = async (req, res) => {
  try {
    const { user_id, month, basic_salary, bonus, deductions } = req.body

    if (!user_id || !month || !basic_salary) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    const net_salary = basic_salary + (bonus || 0) - (deductions || 0)

    const connection = await pool.getConnection()

    // Check if payroll already exists for this month
    const [existing] = await connection.query("SELECT * FROM payroll WHERE user_id = ? AND month = ?", [user_id, month])

    if (existing.length > 0) {
      connection.release()
      return res.status(400).json({ message: "Payroll already exists for this month" })
    }

    await connection.query(
      "INSERT INTO payroll (user_id, month, basic_salary, bonus, deductions, net_salary) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, month, basic_salary, bonus || 0, deductions || 0, net_salary],
    )

    connection.release()

    res.status(201).json({ message: "Payroll created successfully", net_salary })
  } catch (error) {
    console.error("Create payroll error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get Payroll Records
const getPayrollRecords = async (req, res) => {
  try {
    const { user_id, month } = req.query

    const connection = await pool.getConnection()

    let query = "SELECT p.*, u.name, u.email FROM payroll p JOIN users u ON p.user_id = u.user_id WHERE 1=1"
    const params = []

    if (user_id) {
      query += " AND p.user_id = ?"
      params.push(user_id)
    }

    if (month) {
      query += " AND p.month = ?"
      params.push(month)
    }

    query += " ORDER BY p.generated_at DESC"

    const [records] = await connection.query(query, params)

    connection.release()

    res.json(records)
  } catch (error) {
    console.error("Get payroll error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get Employee Payslip
const getPayslip = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const { payroll_id } = req.params

    const connection = await pool.getConnection()

    const [payslips] = await connection.query(
      "SELECT p.*, u.name, u.email, u.designation FROM payroll p JOIN users u ON p.user_id = u.user_id WHERE p.payroll_id = ? AND p.user_id = ?",
      [payroll_id, user_id],
    )

    connection.release()

    if (payslips.length === 0) {
      return res.status(404).json({ message: "Payslip not found" })
    }

    res.json(payslips[0])
  } catch (error) {
    console.error("Get payslip error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Calculate Salary with Attendance
const calculateSalary = async (req, res) => {
  try {
    const { user_id, month, basic_salary } = req.body

    if (!user_id || !month || !basic_salary) {
      return res.status(400).json({ message: "Required fields missing" })
    }

    const connection = await pool.getConnection()

    // Get attendance count for the month
    const [attendance] = await connection.query(
      "SELECT COUNT(*) as present_days FROM attendance WHERE user_id = ? AND DATE_FORMAT(attendance_date, '%Y-%m') = ? AND status = 'Present'",
      [user_id, month],
    )

    // Get leave count for the month
    const [leaves] = await connection.query(
      "SELECT COUNT(*) as leave_days FROM leaves WHERE user_id = ? AND DATE_FORMAT(start_date, '%Y-%m') = ? AND status = 'Approved'",
      [user_id, month],
    )

    const present_days = attendance[0].present_days
    const leave_days = leaves[0].leave_days
    const working_days = 22 // Standard working days per month

    // Calculate deductions for absent days
    const absent_days = working_days - present_days - leave_days
    const daily_rate = basic_salary / working_days
    const deductions = absent_days > 0 ? absent_days * daily_rate : 0

    connection.release()

    res.json({
      present_days,
      leave_days,
      absent_days,
      daily_rate: daily_rate.toFixed(2),
      deductions: deductions.toFixed(2),
      net_salary: (basic_salary - deductions).toFixed(2),
    })
  } catch (error) {
    console.error("Calculate salary error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update Payroll
const updatePayroll = async (req, res) => {
  try {
    const { payroll_id } = req.params
    const { bonus, deductions } = req.body

    const connection = await pool.getConnection()

    // Get current payroll
    const [payrolls] = await connection.query("SELECT * FROM payroll WHERE payroll_id = ?", [payroll_id])

    if (payrolls.length === 0) {
      connection.release()
      return res.status(404).json({ message: "Payroll not found" })
    }

    const payroll = payrolls[0]
    const net_salary = payroll.basic_salary + (bonus || payroll.bonus) - (deductions || payroll.deductions)

    await connection.query("UPDATE payroll SET bonus = ?, deductions = ?, net_salary = ? WHERE payroll_id = ?", [
      bonus || payroll.bonus,
      deductions || payroll.deductions,
      net_salary,
      payroll_id,
    ])

    connection.release()

    res.json({ message: "Payroll updated successfully" })
  } catch (error) {
    console.error("Update payroll error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  createPayroll,
  getPayrollRecords,
  getPayslip,
  calculateSalary,
  updatePayroll,
}
