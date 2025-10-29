"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HRPerformance() {
  const [user, setUser] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [performanceRecords, setPerformanceRecords] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: "",
    reviewPeriod: "",
    kpis: "",
    rating: "",
    feedback: "",
    goals: ""
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "Admin" && parsedUser.role !== "HR") {
      router.push("/login")
      return
    }

    setUser(parsedUser)

    // Load employees and performance records
    const employeeData = JSON.parse(localStorage.getItem("employees") || "[]")
    const performanceData = JSON.parse(localStorage.getItem("performance") || "[]")
    setEmployees(employeeData)
    setPerformanceRecords(performanceData)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const employee = employees.find(emp => emp.id.toString() === formData.employeeId)
    if (!employee) return

    const newRecord = {
      id: Date.now(),
      employeeId: parseInt(formData.employeeId),
      employeeName: employee.name,
      employeeEmail: employee.email,
      reviewPeriod: formData.reviewPeriod,
      kpis: formData.kpis,
      rating: parseFloat(formData.rating),
      feedback: formData.feedback,
      goals: formData.goals,
      status: "Completed",
      reviewedBy: user.email,
      reviewedAt: new Date().toISOString()
    }

    const updatedRecords = [...performanceRecords, newRecord]
    setPerformanceRecords(updatedRecords)
    localStorage.setItem("performance", JSON.stringify(updatedRecords))

    setFormData({
      employeeId: "",
      reviewPeriod: "",
      kpis: "",
      rating: "",
      feedback: "",
      goals: ""
    })
    setShowForm(false)
  }

  const getPerformanceStats = () => {
    const total = performanceRecords.length
    const excellent = performanceRecords.filter(r => r.rating >= 4.5).length
    const good = performanceRecords.filter(r => r.rating >= 3.5 && r.rating < 4.5).length
    const average = performanceRecords.filter(r => r.rating >= 2.5 && r.rating < 3.5).length
    const poor = performanceRecords.filter(r => r.rating < 2.5).length
    const avgRating = total > 0 ? (performanceRecords.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0

    return { total, excellent, good, average, poor, avgRating }
  }

  const stats = getPerformanceStats()

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
              <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
              <button
                onClick={() => router.push("/hr-dashboard")}
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Employee Performance Reviews</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              {showForm ? "Cancel" : "Add Performance Review"}
            </button>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-medium">T</span>
                    </div>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Total Reviews</dt>
                      <dd className="text-sm font-medium text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-medium">E</span>
                    </div>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Excellent</dt>
                      <dd className="text-sm font-medium text-gray-900">{stats.excellent}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-medium">G</span>
                    </div>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Good</dt>
                      <dd className="text-sm font-medium text-gray-900">{stats.good}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-medium">A</span>
                    </div>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Average</dt>
                      <dd className="text-sm font-medium text-gray-900">{stats.average}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-medium">P</span>
                    </div>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Poor</dt>
                      <dd className="text-sm font-medium text-gray-900">{stats.poor}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-medium">R</span>
                    </div>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-gray-500 truncate">Avg Rating</dt>
                      <dd className="text-sm font-medium text-gray-900">{stats.avgRating}/5</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Performance Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee</label>
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.filter(emp => emp.status === 'Active').map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} - {employee.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Review Period</label>
                    <select
                      name="reviewPeriod"
                      value={formData.reviewPeriod}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Period</option>
                      <option value="Q1 2024">Q1 2024</option>
                      <option value="Q2 2024">Q2 2024</option>
                      <option value="Q3 2024">Q3 2024</option>
                      <option value="Q4 2024">Q4 2024</option>
                      <option value="Annual 2024">Annual 2024</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Overall Rating (1-5)</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      min="1"
                      max="5"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Key Performance Indicators (KPIs)</label>
                  <textarea
                    name="kpis"
                    value={formData.kpis}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="List the KPIs evaluated..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Performance Feedback</label>
                  <textarea
                    name="feedback"
                    value={formData.feedback}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detailed feedback on performance..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Goals for Next Period</label>
                  <textarea
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Set goals for improvement..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {performanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No performance reviews yet</div>
                <p className="text-gray-400 mt-2">Add performance reviews to track employee progress</p>
              </div>
            ) : (
              performanceRecords.map((record) => (
                <div key={record.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{record.employeeName}</h3>
                        <p className="text-sm text-gray-500">{record.reviewPeriod} • Reviewed by {record.reviewedBy}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{record.rating}</div>
                          <div className="text-sm text-gray-500">/5 Rating</div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.rating >= 4.5
                            ? 'bg-green-100 text-green-800'
                            : record.rating >= 3.5
                            ? 'bg-blue-100 text-blue-800'
                            : record.rating >= 2.5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.rating >= 4.5 ? 'Excellent' : record.rating >= 3.5 ? 'Good' : record.rating >= 2.5 ? 'Average' : 'Poor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">KPIs Evaluated</dt>
                        <dd className="mt-1 text-sm text-gray-900">{record.kpis}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Goals for Next Period</dt>
                        <dd className="mt-1 text-sm text-gray-900">{record.goals || 'No goals set'}</dd>
                      </div>
                    </div>
                    <div className="mt-4">
                      <dt className="text-sm font-medium text-gray-500">Performance Feedback</dt>
                      <dd className="mt-1 text-sm text-gray-900">{record.feedback}</dd>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
