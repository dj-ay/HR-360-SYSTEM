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

  const calculatePayslip = () => {
    if (!employeeData) return null

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

    return {
      basicSalary,
      hra,
      conveyance,
      medical,
      lta,
      grossSalary,
      pf,
      professionalTax,
      totalDeductions,
      netSalary
    }
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

  const payslipData = calculatePayslip()

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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user.role}
              </span>
              <button
                onClick={() => router.push("/employee-dashboard")}
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

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Payslip - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            </div>

            <div className="px-6 py-6">
              {/* Employee Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Designation:</span>
                      <span className="font-medium">{employeeData.designation}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Period</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Month:</span>
                      <span className="font-medium">{new Date().toLocaleDateString('en-US', { month: 'long' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">{new Date().getFullYear()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated On:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Salary:</span>
                      <span className="font-medium">${payslipData?.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">HRA:</span>
                      <span className="font-medium">${payslipData?.hra.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conveyance:</span>
                      <span className="font-medium">${payslipData?.conveyance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medical:</span>
                      <span className="font-medium">${payslipData?.medical.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">LTA:</span>
                      <span className="font-medium">${payslipData?.lta.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                      <span className="text-gray-900">Gross Salary:</span>
                      <span className="text-gray-900">${payslipData?.grossSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h3>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">PF:</span>
                      <span className="font-medium">${payslipData?.pf.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Professional Tax:</span>
                      <span className="font-medium">${payslipData?.professionalTax.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                      <span className="text-red-900">Total Deductions:</span>
                      <span className="text-red-900">${payslipData?.totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-900">Net Salary:</span>
                  <span className="text-3xl font-bold text-green-900">${payslipData?.netSalary.toLocaleString()}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>This is a computer-generated payslip and does not require a signature.</p>
                <p>For any queries, please contact HR Department.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
