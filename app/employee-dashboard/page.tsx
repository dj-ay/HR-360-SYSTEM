"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null)
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [payroll, setPayroll] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState("")
  const [showChat, setShowChat] = useState(false)
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

    // Load attendance data
    const attendanceData = JSON.parse(localStorage.getItem("attendance") || "[]")
    const employeeAttendance = attendanceData.filter((a: any) => a.employeeId === employee?.id)
    setAttendance(employeeAttendance)

    // Load leave requests
    const leaveData = JSON.parse(localStorage.getItem("leaveRequests") || "[]")
    const employeeLeaves = leaveData.filter((l: any) => l.employeeId === employee?.id)
    setLeaveRequests(employeeLeaves)

    // Load payroll data
    const payrollData = JSON.parse(localStorage.getItem("payroll") || "[]")
    const employeePayroll = payrollData.find((p: any) => p.employeeId === employee?.id)
    setPayroll(employeePayroll)

    // Load chat history
    const chatHistory = JSON.parse(localStorage.getItem(`chat_${parsedUser.email}`) || "[]")
    setChatMessages(chatHistory)
  }, [router])

  const markAttendance = () => {
    if (!employeeData) return

    const today = new Date().toDateString()
    const existingAttendance = attendance.find(a => new Date(a.date).toDateString() === today)

    if (existingAttendance) {
      alert("Attendance already marked for today!")
      return
    }

    const newAttendance = {
      id: Date.now(),
      employeeId: employeeData.id,
      employeeName: employeeData.name,
      employeeEmail: employeeData.email,
      date: new Date().toISOString(),
      status: 'Present',
      checkIn: new Date().toLocaleTimeString(),
      checkOut: null,
      recordedBy: 'Self',
      recordedAt: new Date().toISOString()
    }

    const updatedAttendance = [...attendance, newAttendance]
    setAttendance(updatedAttendance)

    const allAttendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    allAttendance.push(newAttendance)
    localStorage.setItem("attendance", JSON.stringify(allAttendance))

    alert("Attendance marked successfully!")
  }

  const applyLeave = () => {
    if (!employeeData) return

    const leaveRequest = {
      id: Date.now(),
      employeeId: employeeData.id,
      employeeName: employeeData.name,
      type: 'Casual Leave',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'Personal reasons',
      status: 'Pending',
      appliedDate: new Date().toISOString()
    }

    const allLeaveRequests = JSON.parse(localStorage.getItem("leaveRequests") || "[]")
    allLeaveRequests.push(leaveRequest)
    localStorage.setItem("leaveRequests", JSON.stringify(allLeaveRequests))

    const updatedLeaves = [...leaveRequests, leaveRequest]
    setLeaveRequests(updatedLeaves)

    alert("Leave request submitted successfully!")
  }

  const viewPayslip = () => {
    if (!employeeData) return

    const payslipInfo = `
PAYSLIP - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

Employee: ${employeeData.name}
Employee ID: EMP${employeeData.id}
Department: ${employeeData.department}
Designation: ${employeeData.designation}

Basic Salary: $${employeeData.salary || payroll?.amount || 50000}
HRA: $${Math.round((employeeData.salary || payroll?.amount || 50000) * 0.3)}
Conveyance: $1920
Medical: $1250
LTA: $1000

Gross Salary: $${(employeeData.salary || payroll?.amount || 50000) + Math.round((employeeData.salary || payroll?.amount || 50000) * 0.3) + 1920 + 1250 + 1000}

Deductions:
PF: $${Math.round((employeeData.salary || payroll?.amount || 50000) * 0.12)}
Professional Tax: $200

Net Salary: $${(employeeData.salary || payroll?.amount || 50000) + Math.round((employeeData.salary || payroll?.amount || 50000) * 0.3) + 1920 + 1250 + 1000 - Math.round((employeeData.salary || payroll?.amount || 50000) * 0.12) - 200}

Generated on: ${new Date().toLocaleString()}
    `

    alert(payslipInfo)
  }

  const updateProfile = () => {
    if (!employeeData) return

    const newName = prompt('Enter new name:', employeeData.name)
    const newPhone = prompt('Enter new phone:', employeeData.phone || '')
    const newAddress = prompt('Enter new address:', employeeData.address || '')

    if (newName !== null || newPhone !== null || newAddress !== null) {
      const employees = JSON.parse(localStorage.getItem("employees") || "[]")
      const updatedEmployees = employees.map((emp: any) =>
        emp.id === employeeData.id
          ? {
              ...emp,
              name: newName || emp.name,
              phone: newPhone || emp.phone,
              address: newAddress || emp.address
            }
          : emp
      )
      localStorage.setItem("employees", JSON.stringify(updatedEmployees))

      // Update user data too
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const updatedUsers = users.map((u: any) =>
        u.email === user.email
          ? { ...u, name: newName || u.name }
          : u
      )
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      // Update local state
      setEmployeeData({
        ...employeeData,
        name: newName || employeeData.name,
        phone: newPhone || employeeData.phone,
        address: newAddress || employeeData.address
      })
      setUser({ ...user, name: newName || user.name })

      alert('Profile updated successfully!')
    }
  }

  const sendChatMessage = () => {
    if (!chatInput.trim() || !user) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput,
      timestamp: new Date().toISOString()
    }

    const botResponse = getBotResponse(chatInput.toLowerCase())
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      message: botResponse,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...chatMessages, userMessage, botMessage]
    setChatMessages(updatedMessages)
    localStorage.setItem(`chat_${user.email}`, JSON.stringify(updatedMessages))
    setChatInput("")
  }

  const getBotResponse = (message: string) => {
    // Common employee queries and responses
    if (message.includes('leave') && message.includes('status')) {
      const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending').length
      const approvedLeaves = leaveRequests.filter(l => l.status === 'Approved').length
      return `You have ${pendingLeaves} pending leave requests and ${approvedLeaves} approved leaves.`
    }

    if (message.includes('salary') || message.includes('payroll') || message.includes('payslip')) {
      if (payroll) {
        return `Your salary is $${payroll.amount}. Next payroll date: ${payroll.nextPayDate || 'End of month'}.`
      }
      return "Your payroll information is being processed. Please check back later."
    }

    if (message.includes('attendance')) {
      const presentDays = attendance.filter(a => a.status === 'Present').length
      return `You've been present for ${presentDays} days this month.`
    }

    if (message.includes('manager') || message.includes('supervisor')) {
      return `Your manager is ${employeeData?.manager || 'Not assigned yet'}.`
    }

    if (message.includes('profile') || message.includes('information')) {
      return `Your employee ID is EMP${employeeData?.id}. Department: ${employeeData?.department}.`
    }

    if (message.includes('holiday') || message.includes('vacation')) {
      return "You have 12 annual leave days remaining. Company holidays are listed in the employee handbook."
    }

    if (message.includes('performance') || message.includes('review')) {
      return "Your last performance review was satisfactory. Next review is due in 3 months."
    }

    if (message.includes('training') || message.includes('course')) {
      return "Available training programs: Leadership Development, Technical Skills Enhancement. Contact HR for enrollment."
    }

    if (message.includes('benefits') || message.includes('insurance')) {
      return "Employee benefits include health insurance, dental coverage, and retirement plan. Contact HR for details."
    }

    if (message.includes('help') || message.includes('support')) {
      return "I can help with: leave status, salary info, attendance records, manager details, profile information, holidays, performance reviews, training programs, and benefits."
    }

    return "I'm here to help with your HR queries. You can ask about leave status, salary, attendance, manager details, or other employee-related questions."
  }

  const getAttendanceStats = () => {
    const today = new Date().toDateString()
    const todayAttendance = attendance.find(a => new Date(a.date).toDateString() === today)
    return {
      today: todayAttendance?.status || 'Not Marked',
      thisMonth: attendance.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length
    }
  }

  const getLeaveBalance = () => {
    const usedLeaves = leaveRequests.filter(l => l.status === 'Approved').length
    return Math.max(0, 12 - usedLeaves) // Assuming 12 annual leaves
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

  const attendanceStats = getAttendanceStats()
  const leaveBalance = getLeaveBalance()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user.role}
              </span>
              <button
                onClick={() => setShowChat(!showChat)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                💬 HR Chat
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

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">HR Assistant Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="h-64 overflow-y-auto mb-4 p-2 border rounded">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg ${
                    msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {msg.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask about leave, salary, attendance..."
                className="flex-1 border rounded-l px-3 py-2"
              />
              <button
                onClick={sendChatMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Employee Profile Summary */}
          {employeeData && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Employee Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Employee ID:</span>
                  <p className="font-medium">EMP{employeeData.id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Department:</span>
                  <p className="font-medium">{employeeData.department}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Designation:</span>
                  <p className="font-medium">{employeeData.designation}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Manager:</span>
                  <p className="font-medium">{employeeData.manager || 'Not assigned'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Joining Date:</span>
                  <p className="font-medium">{new Date(employeeData.joiningDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p className="font-medium">{employeeData.status}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Attendance</dt>
                      <dd className="text-lg font-medium text-gray-900">{attendanceStats.today}</dd>
                      <dd className="text-sm text-gray-500">{attendanceStats.thisMonth} days this month</dd>
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
                      <span className="text-white text-sm font-medium">L</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Leave Balance</dt>
                      <dd className="text-lg font-medium text-gray-900">{leaveBalance} days</dd>
                      <dd className="text-sm text-gray-500">{leaveRequests.filter(l => l.status === 'Pending').length} pending</dd>
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
                      <span className="text-white text-sm font-medium">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Monthly Salary</dt>
                      <dd className="text-lg font-medium text-gray-900">${payroll?.amount || employeeData?.salary || 'N/A'}</dd>
                      <dd className="text-sm text-gray-500">Next: {payroll?.nextPayDate || 'End of month'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={markAttendance}
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700"
              >
                Mark Attendance
              </button>
              <button
                onClick={applyLeave}
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700"
              >
                Apply Leave
              </button>
              <button
                onClick={viewPayslip}
                className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700"
              >
                View Payslip
              </button>
              <button
                onClick={updateProfile}
                className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                {leaveRequests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Leave Requests</h3>
                    {leaveRequests.slice(-3).map((leave: any) => (
                      <div key={leave.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <span className="font-medium">{leave.type}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {attendance.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recent Attendance</h3>
                    {attendance.slice(-5).map((att: any) => (
                      <div key={att.id} className="flex justify-between items-center py-2 border-b">
                        <span>{new Date(att.date).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          att.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {att.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
