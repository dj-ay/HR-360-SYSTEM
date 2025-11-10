"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function EmployeeLeave() {
  const [user, setUser] = useState<any>(null)
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [formData, setFormData] = useState({
    type: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [isLoading, setIsLoading] = useState(false)
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

    // Load leave requests
    const leaveData = JSON.parse(localStorage.getItem("leaveRequests") || "[]")
    const employeeLeaves = leaveData.filter((l: any) => l.employeeId === employee?.id)
    setLeaveRequests(employeeLeaves)
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeData || !user) return

    setIsLoading(true)

    try {
      const leaveRequest = {
        id: Date.now(),
        employeeId: employeeData.id,
        employeeName: employeeData.name,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: 'Pending',
        appliedDate: new Date().toISOString()
      }

      const allLeaveRequests = JSON.parse(localStorage.getItem("leaveRequests") || "[]")
      allLeaveRequests.push(leaveRequest)
      localStorage.setItem("leaveRequests", JSON.stringify(allLeaveRequests))

      const updatedLeaves = [...leaveRequests, leaveRequest]
      setLeaveRequests(updatedLeaves)

      // Reset form
      setFormData({
        type: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: ''
      })

      alert('Leave request submitted successfully!')
    } catch (error) {
      alert('Failed to submit leave request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getLeaveBalance = () => {
    const usedLeaves = leaveRequests.filter(l => l.status === 'Approved').length
    return Math.max(0, 12 - usedLeaves) // Assuming 12 annual leaves
  }

  if (!user || !employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const leaveBalance = getLeaveBalance()

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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Leave Balance */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Leave Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{leaveBalance}</div>
                <div className="text-sm text-blue-800">Available Leave Days</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {leaveRequests.filter(l => l.status === 'Pending').length}
                </div>
                <div className="text-sm text-yellow-800">Pending Requests</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {leaveRequests.filter(l => l.status === 'Approved').length}
                </div>
                <div className="text-sm text-green-800">Approved This Year</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Apply Leave Form */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Apply for Leave</h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Leave Type
                      </label>
                      <select
                        name="type"
                        id="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Annual Leave">Annual Leave</option>
                        <option value="Maternity Leave">Maternity Leave</option>
                        <option value="Paternity Leave">Paternity Leave</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          id="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          id="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          min={formData.startDate || new Date().toISOString().split('T')[0]}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                        Reason for Leave
                      </label>
                      <textarea
                        name="reason"
                        id="reason"
                        rows={4}
                        value={formData.reason}
                        onChange={handleInputChange}
                        placeholder="Please provide a detailed reason for your leave request..."
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        required
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                      >
                        {isLoading ? 'Submitting...' : 'Submit Leave Request'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Leave History */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Leave History</h3>
                {leaveRequests.length > 0 ? (
                  <div className="space-y-4">
                    {leaveRequests.slice(-5).reverse().map((leave: any) => (
                      <div key={leave.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{leave.type}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {leave.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Applied: {new Date(leave.appliedDate).toLocaleDateString()}
                            </div>
                            {leave.reason && (
                              <div className="text-sm text-gray-700 mt-2">
                                <strong>Reason:</strong> {leave.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No leave requests found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
