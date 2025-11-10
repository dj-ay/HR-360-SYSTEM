"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HRExit() {
  const [user, setUser] = useState<any>(null)
  const [exitRequests, setExitRequests] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
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

    // Load exit requests and employees
    const exitData = JSON.parse(localStorage.getItem("exitRequests") || "[]")
    const employeeData = JSON.parse(localStorage.getItem("employees") || "[]")
    setExitRequests(exitData)
    setEmployees(employeeData)
  }, [router])

  const initiateExitProcess = (employee: any) => {
    setSelectedEmployee(employee)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEmployee) return

    const formData = new FormData(e.target as HTMLFormElement)
    const exitData = {
      id: Date.now(),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeEmail: selectedEmployee.email,
      reason: formData.get('reason'),
      lastWorkingDay: formData.get('lastWorkingDay'),
      handoverNotes: formData.get('handoverNotes'),
      status: "Initiated",
      initiatedBy: user.email,
      initiatedAt: new Date().toISOString(),
      clearanceStatus: {
        it: "Pending",
        finance: "Pending",
        hr: "Pending",
        manager: "Pending"
      }
    }

    const updatedRequests = [...exitRequests, exitData]
    setExitRequests(updatedRequests)
    localStorage.setItem("exitRequests", JSON.stringify(updatedRequests))

    // Update employee status
    const updatedEmployees = employees.map(emp =>
      emp.id === selectedEmployee.id ? { ...emp, status: "Exit Process" } : emp
    )
    setEmployees(updatedEmployees)
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))

    setShowForm(false)
    setSelectedEmployee(null)
  }

  const updateClearanceStatus = (exitId: number, department: string, status: string) => {
    const updatedRequests = exitRequests.map(request =>
      request.id === exitId
        ? {
            ...request,
            clearanceStatus: {
              ...request.clearanceStatus,
              [department]: status
            }
          }
        : request
    )
    setExitRequests(updatedRequests)
    localStorage.setItem("exitRequests", JSON.stringify(updatedRequests))
  }

  const completeExitProcess = (exitId: number) => {
    const exitRequest = exitRequests.find(r => r.id === exitId)
    if (!exitRequest) return

    // Update exit request status
    const updatedRequests = exitRequests.map(request =>
      request.id === exitId ? { ...request, status: "Completed", completedAt: new Date().toISOString() } : request
    )
    setExitRequests(updatedRequests)
    localStorage.setItem("exitRequests", JSON.stringify(updatedRequests))

    // Update employee status to Exited
    const updatedEmployees = employees.map(emp =>
      emp.id === exitRequest.employeeId ? { ...emp, status: "Exited" } : emp
    )
    setEmployees(updatedEmployees)
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))
  }

  const generateExitDocuments = (exitRequest: any) => {
    alert(`Generating exit documents for ${exitRequest.employeeName}:
- Experience Letter
- Final Settlement Letter
- Clearance Certificate

Documents would be generated as PDFs in a real application.`)
  }

  const activeEmployees = employees.filter(emp => emp.status === 'Active')

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
              <h1 className="text-3xl font-bold text-gray-900">Exit Process Management</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Employee Exit Management</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                {showForm ? "Cancel" : "Initiate Exit Process"}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Initiate Exit Process</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedEmployee?.id === employee.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.designation}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedEmployee && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900">Selected Employee</h4>
                    <p className="text-sm text-blue-700">{selectedEmployee.name} - {selectedEmployee.designation}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reason for Leaving</label>
                      <select
                        name="reason"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Reason</option>
                        <option value="Resignation">Resignation</option>
                        <option value="Termination">Termination</option>
                        <option value="Retirement">Retirement</option>
                        <option value="Better Opportunity">Better Opportunity</option>
                        <option value="Personal Reasons">Personal Reasons</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Working Day</label>
                      <input
                        type="date"
                        name="lastWorkingDay"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Handover Notes</label>
                    <textarea
                      name="handoverNotes"
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Details about handover of responsibilities, projects, etc."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Initiate Exit Process
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {exitRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No exit processes initiated</div>
                <p className="text-gray-400 mt-2">Initiate exit processes for employees leaving the organization</p>
              </div>
            ) : (
              exitRequests.map((request) => (
                <div key={request.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{request.employeeName}</h3>
                        <p className="text-sm text-gray-500">Exit Process • Initiated {new Date(request.initiatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Reason</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.reason}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Last Working Day</dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(request.lastWorkingDay).toLocaleDateString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Initiated By</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.initiatedBy}</dd>
                      </div>
                    </div>

                    {request.handoverNotes && (
                      <div className="mb-4">
                        <dt className="text-sm font-medium text-gray-500">Handover Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.handoverNotes}</dd>
                      </div>
                    )}

                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">Department Clearances</dt>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(request.clearanceStatus).map(([dept, status]) => (
                          <div key={dept} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm font-medium capitalize">{dept}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {status as string}
                              </span>
                              {status === 'Pending' && (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => updateClearanceStatus(request.id, dept, 'Completed')}
                                    className="text-green-600 hover:text-green-800 text-xs"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => updateClearanceStatus(request.id, dept, 'Rejected')}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    ✗
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {request.status !== 'Completed' && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => generateExitDocuments(request)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                        >
                          Generate Documents
                        </button>
                        <button
                          onClick={() => completeExitProcess(request.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                        >
                          Complete Exit Process
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
