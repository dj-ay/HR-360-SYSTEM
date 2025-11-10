"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function EmployeeProfile() {
  const [user, setUser] = useState<any>(null)
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
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

    if (employee) {
      setFormData({
        name: employee.name || '',
        phone: employee.phone || '',
        address: employee.address || ''
      })
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Update employee data
      const employees = JSON.parse(localStorage.getItem("employees") || "[]")
      const updatedEmployees = employees.map((emp: any) =>
        emp.id === employeeData.id
          ? {
              ...emp,
              name: formData.name,
              phone: formData.phone,
              address: formData.address
            }
          : emp
      )
      localStorage.setItem("employees", JSON.stringify(updatedEmployees))

      // Update user data too
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const updatedUsers = users.map((u: any) =>
        u.email === user.email
          ? { ...u, name: formData.name }
          : u
      )
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      // Update local state
      setEmployeeData({
        ...employeeData,
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      })
      setUser({ ...user, name: formData.name })

      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-xl">👤</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Update Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-black font-medium">Welcome, {user.name}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-black border border-white border-opacity-30">
                {user.role}
              </span>
              <button
                onClick={() => router.push("/employee-dashboard")}
                className="bg-white bg-opacity-20 text-black px-4 py-2 rounded-lg hover:bg-opacity-30 border border-white border-opacity-30 transition-all duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Profile Update Form */}
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Personal Information</h3>
              </div>
              <p className="mt-1 text-blue-100 text-sm">
                Update your personal details and contact information.
              </p>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your full name"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400">👤</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your phone number"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400">📞</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                      Address
                    </label>
                    <div className="relative">
                      <textarea
                        name="address"
                        id="address"
                        rows={4}
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                        placeholder="Enter your complete address"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="text-gray-400">🏠</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💾</span>
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Current Profile Information */}
          <div className="mt-8 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">ℹ️</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Current Profile Information</h3>
              </div>
              <p className="mt-1 text-green-100 text-sm">
                Your current employment details and information.
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <span className="text-blue-600 mr-2">🆔</span>
                    <span className="text-sm font-semibold text-blue-800">Employee ID</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">EMP{employeeData.id}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-2">
                    <span className="text-purple-600 mr-2">📧</span>
                    <span className="text-sm font-semibold text-purple-800">Email</span>
                  </div>
                  <p className="text-lg font-bold text-purple-900">{employeeData.email}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <span className="text-green-600 mr-2">🏢</span>
                    <span className="text-sm font-semibold text-green-800">Department</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">{employeeData.department}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-600 mr-2">💼</span>
                    <span className="text-sm font-semibold text-yellow-800">Designation</span>
                  </div>
                  <p className="text-lg font-bold text-yellow-900">{employeeData.designation}</p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <div className="flex items-center mb-2">
                    <span className="text-pink-600 mr-2">👔</span>
                    <span className="text-sm font-semibold text-pink-800">Manager</span>
                  </div>
                  <p className="text-lg font-bold text-pink-900">{employeeData.manager || 'Not assigned'}</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center mb-2">
                    <span className="text-indigo-600 mr-2">📅</span>
                    <span className="text-sm font-semibold text-indigo-800">Joining Date</span>
                  </div>
                  <p className="text-lg font-bold text-indigo-900">{new Date(employeeData.joiningDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
