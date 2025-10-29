const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const {
  createPayroll,
  getPayrollRecords,
  getPayslip,
  calculateSalary,
  updatePayroll,
} = require("../controllers/payrollController")

const router = express.Router()

// HR routes
router.post("/create", authMiddleware, roleMiddleware(["HR", "Admin"]), createPayroll)
router.get("/records", authMiddleware, roleMiddleware(["HR", "Admin"]), getPayrollRecords)
router.post("/calculate", authMiddleware, roleMiddleware(["HR", "Admin"]), calculateSalary)
router.put("/:payroll_id", authMiddleware, roleMiddleware(["HR", "Admin"]), updatePayroll)

// Employee routes
router.get("/payslip/:payroll_id", authMiddleware, roleMiddleware(["Employee"]), getPayslip)

module.exports = router
