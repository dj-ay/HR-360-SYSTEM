"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HRLeave() {
  const [user, setUser] = useState<any>(null)
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
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

    // Load leave requests and employees
    const leaveData = JSON.parse(localStorage.getItem("leaveRequests") || "[]")
    const employeeData = JSON.parse(localStorage.getItem("employees") || "[]")
    setLeaveRequests(leaveData)
    setEmployees(employeeData)
  }, [router])

  const updateLeaveStatus = (id: number, status: string) => {
    const updatedRequests = leaveRequests.map(request =>
      request.id === id ? { ...request, status, approvedBy: user.email, approvedAt: new Date().toISOString() } : request
    )
    setLeaveRequests(updatedRequests)
    localStorage.setItem("leaveRequests", JSON.stringify(updatedRequests))
  }

  const getLeaveStats = () => {
    const pending = leaveRequests.filter(r => r.status === 'Pending').length
    const approved = leaveRequests.filter(r => r.status === 'Approved').length
    const rejected = leaveRequests.filter(r => r.status === 'Rejected').length
    return { pending, approved, rejected, total: leaveRequests.length }
  }

  const stats = getLeaveStats()

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
              <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Leave Requests</h2>

          {/* Leave Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
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
                      <span className="text-white text-sm font-medium">R</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {leaveRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No leave requests yet</div>
                <p className="text-gray-400 mt-2">Leave requests from employees will appear here</p>
              </div>
            ) : (
              leaveRequests.map((request) => {
                const employee = employees.find(emp => emp.email === request.employeeEmail)

                return (
                  <div key={request.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Employee: {employee?.name || request.employeeEmail} (ID: {employee?.id || 'N/A'})
                          </h3>
                          <p className="text-sm text-gray-500">
                            {request.leaveType} • Leave Period: {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()} • {request.days} days
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Reason</dt>
                          <dd className="mt-1 text-sm text-gray-900">{request.reason}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Applied On</dt>
                          <dd className="mt-1 text-sm text-gray-900">{new Date(request.appliedAt).toLocaleDateString()}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Number of Days</dt>
                          <dd className="mt-1 text-sm text-gray-900">{request.days} days</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Leave Period</dt>
                          <dd className="mt-1 text-sm text-gray-900">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</dd>
                        </div>
                        {request.detailedReason && (
                          <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Detailed Reason</dt>
                            <dd className="mt-1 text-sm text-gray-900">{request.detailedReason}</dd>
                          </div>
                        )}
                        {request.status !== 'Pending' && (
                          <>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Approved By</dt>
                              <dd className="mt-1 text-sm text-gray-900">{request.approvedBy}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Decision Date</dt>
                              <dd className="mt-1 text-sm text-gray-900">{new Date(request.approvedAt).toLocaleDateString()}</dd>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {request.status === 'Pending' && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => updateLeaveStatus(request.id, 'Approved')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(request.id, 'Rejected')}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
