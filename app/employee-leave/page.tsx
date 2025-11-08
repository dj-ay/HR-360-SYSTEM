"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EmployeeLeave() {
  const [user, setUser] = useState<any>(null)
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [leaveData, setLeaveData] = useState({
    type: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: "",
    detailedReason: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "Employee") {
      router.push("/login")
      return
    }

    setUser(parsedUser)

    // Load employee data
    const employees = JSON.parse(localStorage.getItem("employees") || "[]")
    const employee = employees.find((e: any) => e.email === parsedUser.email)
    setEmployeeData(employee)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLeaveData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!employeeData) {
      setError("Employee data not found")
      setLoading(false)
      return
    }

    if (!leaveData.startDate || !leaveData.endDate || !leaveData.reason) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    const startDate = new Date(leaveData.startDate)
    const endDate = new Date(leaveData.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      setError("Start date cannot be in the past")
      setLoading(false)
      return
    }

    if (endDate < startDate) {
      setError("End date must be after start date")
      setLoading(false)
      return
    }

    try {
      // Create leave request
      const leaveRequest = {
        id: Date.now(),
        employeeId: employeeData.id,
        employeeName: employeeData.name,
        employeeEmail: user.email,
        leaveType: leaveData.type,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        reason: leaveData.reason,
        detailedReason: leaveData.detailedReason,
        status: 'Pending',
        appliedAt: new Date().toISOString(),
        days: Math.ceil((new Date(leaveData.endDate).getTime() - new Date(leaveData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      }

      const allLeaveRequests = JSON.parse(localStorage.getItem("leaveRequests") || "[]")
      allLeaveRequests.push(leaveRequest)
      localStorage.setItem("leaveRequests", JSON.stringify(allLeaveRequests))

      // Redirect to employee dashboard
      router.push("/employee-dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to submit leave request")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user.role}
              </span>
              <button
                onClick={() => router.push("/employee-dashboard")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token")
                  localStorage.removeItem("user")
                  router.push("/login")
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                    <select
                      name="type"
                      value={leaveData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Maternity Leave">Maternity Leave</option>
                      <option value="Paternity Leave">Paternity Leave</option>
                      <option value="Emergency Leave">Emergency Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                    <input
                      type="text"
                      value={leaveData.startDate && leaveData.endDate ? Math.ceil((new Date(leaveData.endDate).getTime() - new Date(leaveData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={leaveData.startDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={leaveData.endDate}
                      onChange={handleChange}
                      min={leaveData.startDate || new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason for Leave</label>
                  <input
                    type="text"
                    name="reason"
                    value={leaveData.reason}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief reason (e.g., Medical, Personal)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Detailed Reason</label>
                  <textarea
                    name="detailedReason"
                    value={leaveData.detailedReason}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide detailed reason for your leave request..."
                  />
                </div>

                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Leave Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
