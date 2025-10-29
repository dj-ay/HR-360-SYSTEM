"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { attendanceAPI, payrollAPI, leaveAPI } from "../services/api"

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("attendance")
  const [attendanceStatus, setAttendanceStatus] = useState("")
  const [payslips, setPayslips] = useState([])
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "Casual",
    start_date: "",
    end_date: "",
    reason: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    loadPayslips()
  }, [])

  const loadPayslips = async () => {
    try {
      const response = await payrollAPI.getPayslips()
      setPayslips(response.data)
    } catch (error) {
      console.error("Error loading payslips:", error)
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      await attendanceAPI.checkIn()
      setAttendanceStatus("Checked in successfully")
    } catch (error: any) {
      setAttendanceStatus(error.response?.data?.message || "Check-in failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      await attendanceAPI.checkOut()
      setAttendanceStatus("Checked out successfully")
    } catch (error: any) {
      setAttendanceStatus(error.response?.data?.message || "Check-out failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await leaveAPI.applyLeave(leaveForm)
      setLeaveForm({ leave_type: "Casual", start_date: "", end_date: "", reason: "" })
      alert("Leave application submitted successfully")
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit leave")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">HR-360</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-700">{user?.name}</span>
            <button
              onClick={() => {
                localStorage.clear()
                window.location.href = "/login"
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Welcome, {user?.name}</h2>
          <p className="text-slate-600">Role: {user?.role}</p>
        </div>

        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 font-medium ${
              activeTab === "attendance"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab("payroll")}
            className={`px-4 py-2 font-medium ${
              activeTab === "payroll"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Payroll
          </button>
          <button
            onClick={() => setActiveTab("leave")}
            className={`px-4 py-2 font-medium ${
              activeTab === "leave" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Leave
          </button>
        </div>

        {activeTab === "attendance" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Attendance</h3>
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Check In
              </button>
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Check Out
              </button>
            </div>
            {attendanceStatus && <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">{attendanceStatus}</div>}
          </div>
        )}

        {activeTab === "payroll" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Payslips</h3>
            <div className="space-y-3">
              {payslips.length > 0 ? (
                payslips.map((payslip: any) => (
                  <div key={payslip.payroll_id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">{payslip.month}</p>
                        <p className="text-sm text-slate-600">Net Salary: Rs. {payslip.net_salary}</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">No payslips available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "leave" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Apply for Leave</h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Leave Type</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Casual</option>
                  <option>Sick</option>
                  <option>Annual</option>
                  <option>Maternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Leave Application"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
