const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" })
})

const authRoutes = require("./routes/authRoutes")
const recruitmentRoutes = require("./routes/recruitmentRoutes")
const interviewRoutes = require("./routes/interviewRoutes")
const attendanceRoutes = require("./routes/attendanceRoutes")
const payrollRoutes = require("./routes/payrollRoutes")
const leaveRoutes = require("./routes/leaveRoutes")
const exitRoutes = require("./routes/exitRoutes")
const adminRoutes = require("./routes/adminRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/recruitment", recruitmentRoutes)
app.use("/api/interviews", interviewRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/payroll", payrollRoutes)
app.use("/api/leave", leaveRoutes)
app.use("/api/exit", exitRoutes)
app.use("/api/admin", adminRoutes)

module.exports = app
