"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HRDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaveRequests: 0,
    todayAttendance: 0,
    openPositions: 0,
    totalCandidates: 0,
    scheduledInterviews: 0,
    pendingPayroll: 0
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
    loadDashboardStats()
  }, [router])

  const loadDashboardStats = () => {
    // Load employees
    const employees = JSON.parse(localStorage.getItem("employees") || "[]")
    const activeEmployees = employees.filter((emp: any) => emp.status === 'Active').length

    // Load leave requests
    const leaveRequests = JSON.parse(localStorage.getItem("leaveRequests") || "[]")
    const pendingLeave = leaveRequests.filter((req: any) => req.status === 'Pending').length

    // Load attendance for today
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const today = new Date().toISOString().split('T')[0]
    const todayAttendance = attendance.filter((record: any) => record.date === today).length

    // Load job postings
    const jobPostings = JSON.parse(localStorage.getItem("jobPostings") || "[]")
    const openPositions = jobPostings.filter((job: any) => job.status === 'Open').length

    // Load candidates
    const candidates = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    const totalCandidates = candidates.length

    // Load interviews
    const interviews = JSON.parse(localStorage.getItem("interviews") || "[]")
    const scheduledInterviews = interviews.filter((interview: any) => interview.status === 'Scheduled').length

    // Load payroll
    const payroll = JSON.parse(localStorage.getItem("payroll") || "[]")
    const pendingPayroll = payroll.filter((record: any) => record.status === 'Generated').length

    setStats({
      totalEmployees: employees.length,
      activeEmployees,
      pendingLeaveRequests: pendingLeave,
      todayAttendance,
      openPositions,
      totalCandidates,
      scheduledInterviews,
      pendingPayroll
    })
  }

  const quickActions = [
    {
      title: "Post New Job",
      description: "Create a new job posting",
      action: () => router.push("/hr-job-postings"),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Schedule Interview",
      description: "Arrange interviews for candidates",
      action: () => router.push("/hr-interviews"),
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Mark Attendance",
      description: "Record daily attendance",
      action: () => router.push("/hr-attendance"),
      color: "bg-yellow-600 hover:bg-yellow-700"
    },
    {
      title: "Process Payroll",
      description: "Generate monthly payroll",
      action: () => router.push("/hr-payroll"),
      color: "bg-red-600 hover:bg-red-700"
    },
    {
      title: "Review Leave Requests",
      description: "Approve or reject leave applications",
      action: () => router.push("/hr-leave"),
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Generate Reports",
      description: "Export HR data and analytics",
      action: () => router.push("/hr-reports"),
      color: "bg-cyan-600 hover:bg-cyan-700"
    }
  ]

  const recentActivities = [
    { action: "New candidate applied", time: "2 hours ago", type: "candidate" },
    { action: "Interview scheduled", time: "4 hours ago", type: "interview" },
    { action: "Leave request approved", time: "1 day ago", type: "leave" },
    { action: "Payroll processed", time: "2 days ago", type: "payroll" },
    { action: "Performance review completed", time: "3 days ago", type: "performance" }
  ]

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
              <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">E</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalEmployees}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Employees</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeEmployees}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">L</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Leave</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingLeaveRequests}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Attendance</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.todayAttendance}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">J</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Open Positions</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.openPositions}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-cyan-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">C</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Candidates</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalCandidates}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">I</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Scheduled Interviews</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.scheduledInterviews}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Payroll</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingPayroll}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`p-4 rounded-lg text-white text-left transition-colors ${action.color}`}
                    >
                      <div className="text-sm font-medium">{action.title}</div>
                      <div className="text-xs opacity-90 mt-1">{action.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
