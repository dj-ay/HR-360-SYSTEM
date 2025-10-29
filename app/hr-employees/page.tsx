"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HREmployees() {
  const [user, setUser] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    candidateId: "",
    department: "",
    designation: "",
    salary: "",
    joiningDate: "",
    manager: ""
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

    // Load employees and candidates
    const employeeData = JSON.parse(localStorage.getItem("employees") || "[]")
    const candidateData = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    setEmployees(employeeData)
    setCandidates(candidateData)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const candidate = candidates.find(c => c.userId === formData.candidateId)
    if (!candidate) return

    const newEmployee = {
      id: Date.now(),
      name: candidate.name || "Unknown",
      email: candidate.userId,
      phone: candidate.phone,
      address: candidate.address,
      department: formData.department,
      designation: formData.designation,
      salary: parseFloat(formData.salary),
      joiningDate: formData.joiningDate,
      manager: formData.manager,
      status: "Active",
      profile: candidate,
      createdBy: user.email,
      createdAt: new Date().toISOString()
    }

    const updatedEmployees = [...employees, newEmployee]
    setEmployees(updatedEmployees)
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))

    // Generate login credentials
    const employeeCredentials = {
      email: candidate.userId,
      password: `Emp@${newEmployee.id}`,
      role: "Employee",
      employeeId: newEmployee.id
    }

    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const userExists = existingUsers.find((u: any) => u.email === candidate.userId)

    if (!userExists) {
      existingUsers.push(employeeCredentials)
      localStorage.setItem("users", JSON.stringify(existingUsers))
    }

    setFormData({
      candidateId: "",
      department: "",
      designation: "",
      salary: "",
      joiningDate: "",
      manager: ""
    })
    setShowForm(false)

    alert(`Employee created successfully! Login credentials: Email: ${candidate.userId}, Password: ${employeeCredentials.password}`)
  }

  const updateEmployeeStatus = (id: number, status: string) => {
    const updatedEmployees = employees.map(employee =>
      employee.id === id ? { ...employee, status } : employee
    )
    setEmployees(updatedEmployees)
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))
  }

  const selectedCandidates = candidates.filter(c => {
    // Candidates who have completed interviews or been selected
    const interviews = JSON.parse(localStorage.getItem("interviews") || "[]")
    const candidateInterviews = interviews.filter((i: any) => i.candidateEmail === c.userId)
    return candidateInterviews.some((i: any) => i.status === 'Completed')
  })

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
              <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Employee Directory</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              {showForm ? "Cancel" : "Add New Employee"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Onboard New Employee</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Candidate</label>
                    <select
                      name="candidateId"
                      value={formData.candidateId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Candidate</option>
                      {selectedCandidates.map((candidate) => (
                        <option key={candidate.userId} value={candidate.userId}>
                          {candidate.name || candidate.userId} - {candidate.skills?.split(',')[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Software Engineer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager/Supervisor</label>
                    <input
                      type="text"
                      name="manager"
                      value={formData.manager}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Manager name"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Create Employee Account
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {employees.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No employees onboarded yet</div>
                <p className="text-gray-400 mt-2">Onboard successful candidates to create employee accounts</p>
              </div>
            ) : (
              employees.map((employee) => (
                <div key={employee.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-500">{employee.designation} • {employee.department}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{employee.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900">{employee.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Salary</dt>
                        <dd className="mt-1 text-sm text-gray-900">${employee.salary.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Joining Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(employee.joiningDate).toLocaleDateString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Manager</dt>
                        <dd className="mt-1 text-sm text-gray-900">{employee.manager || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                        <dd className="mt-1 text-sm text-gray-900">EMP{employee.id}</dd>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => alert(`Send welcome email to ${employee.email}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                      >
                        Send Welcome Email
                      </button>
                      {employee.status === 'Active' && (
                        <button
                          onClick={() => updateEmployeeStatus(employee.id, 'Inactive')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                        >
                          Deactivate
                        </button>
                      )}
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
