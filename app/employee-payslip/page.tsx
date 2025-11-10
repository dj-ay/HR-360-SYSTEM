"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function EmployeePayslip() {
  const [user, setUser] = useState<any>(null)
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [payroll, setPayroll] = useState<any>(null)
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

    // Load payroll data
    const payrollData = JSON.parse(localStorage.getItem("payroll") || "[]")
    const employeePayroll = payrollData.find((p: any) => p.employeeId === employee?.id)
    setPayroll(employeePayroll)
  }, [router])

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

  const basicSalary = employeeData.salary || payroll?.amount || 50000
  const hra = Math.round(basicSalary * 0.3)
  const conveyance = 1920
  const medical = 1250
  const lta = 1000
  const grossSalary = basicSalary + hra + conveyance + medical + lta

  const pf = Math.round(basicSalary * 0.12)
  const professionalTax = 200
  const totalDeductions = pf + professionalTax
  const netSalary = grossSalary - totalDeductions

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Employee Payslip</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={() => router.push("/employee-dashboard")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">HR-360 System</h2>
                <p className="text-blue-100">Employee Salary Slip</p>
                <p className="text-blue-100 mt-2">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Employee Information */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Employee Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee Name:</span>
                    <span className="font-medium">{employeeData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-medium">EMP{employeeData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{employeeData.department}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Designation:</span>
                    <span className="font-medium">{employeeData.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joining Date:</span>
                    <span className="font-medium">{new Date(employeeData.joiningDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pay Period:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Salary Breakdown</h3>

              {/* Earnings */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-green-700">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span>Basic Salary</span>
                    <span className="font-medium">${basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span>House Rent Allowance (HRA)</span>
                    <span className="font-medium">${hra.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span>Conveyance Allowance</span>
                    <span className="font-medium">${conveyance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span>Medical Allowance</span>
                    <span className="font-medium">${medical.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span>Leave Travel Allowance (LTA)</span>
                    <span className="font-medium">${lta.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-gray-300 font-semibold text-green-700">
                    <span>Gross Salary</span>
                    <span>${grossSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-red-700">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span>Provident Fund (PF)</span>
                    <span className="font-medium">${pf.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span>Professional Tax</span>
                    <span className="font-medium">${professionalTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-gray-300 font-semibold text-red-700">
                    <span>Total Deductions</span>
                    <span>${totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-xl font-bold text-blue-700">
                  <span>Net Salary</span>
                  <span>${netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 text-center text-sm text-gray-600">
              <p>This is a computer-generated payslip and does not require signature.</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Print Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.print()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              🖨️ Print Payslip
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
