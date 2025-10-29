"use client"

import { useState, useEffect } from "react"

export default function HRDashboard() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedCandidates: 0,
    scheduledInterviews: 0,
    totalEmployees: 0,
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

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
          <h2 className="text-xl font-bold text-slate-900 mb-2">HR Dashboard</h2>
          <p className="text-slate-600">Manage recruitment, attendance, payroll, and employee data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Total Applications</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalApplications}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Shortlisted</p>
            <p className="text-3xl font-bold text-green-600">{stats.shortlistedCandidates}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Interviews</p>
            <p className="text-3xl font-bold text-purple-600">{stats.scheduledInterviews}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Employees</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalEmployees}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium ${
              activeTab === "overview"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("recruitment")}
            className={`px-4 py-2 font-medium ${
              activeTab === "recruitment"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Recruitment
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`px-4 py-2 font-medium ${
              activeTab === "employees"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab("exit")}
            className={`px-4 py-2 font-medium ${
              activeTab === "exit" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Exit Process
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Dashboard Overview</h3>
            <p className="text-slate-600">
              Welcome to the HR Dashboard. Use the tabs above to manage recruitment, employees, and exit processes.
            </p>
          </div>
        )}

        {activeTab === "recruitment" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recruitment Management</h3>
            <p className="text-slate-600">View and manage job postings, applications, and interview schedules.</p>
          </div>
        )}

        {activeTab === "employees" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Employee Management</h3>
            <p className="text-slate-600">Manage employee profiles, attendance, payroll, and performance reviews.</p>
          </div>
        )}

        {activeTab === "exit" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Exit Process</h3>
            <p className="text-slate-600">Handle resignations, exit interviews, and clearance approvals.</p>
          </div>
        )}
      </div>
    </div>
  )
}
