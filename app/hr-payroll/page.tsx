"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HRPayroll() {
  const [user, setUser] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [payrollRecords, setPayrollRecords] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
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

    // Load employees and payroll records
    const employeeData = JSON.parse(localStorage.getItem("employees") || "[]")
    const payrollData = JSON.parse(localStorage.getItem("payroll") || "[]")
    setEmployees(employeeData)
    setPayrollRecords(payrollData)
  }, [router])

  const calculatePayroll = (employee: any, month: string) => {
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const monthStart = new Date(month + "-01")
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

    const monthAttendance = attendance.filter((record: any) => {
      const recordDate = new Date(record.date)
      return recordDate >= monthStart && recordDate <= monthEnd && record.employeeId === employee.id
    })

    const workingDays = monthAttendance.length
    const presentDays = monthAttendance.filter((record: any) => record.status === 'Present').length
    const absentDays = monthAttendance.filter((record: any) => record.status === 'Absent').length
    const lateDays = monthAttendance.filter((record: any) => record.status === 'Late').length

    const dailyRate = employee.salary / 30 // Assuming 30 working days per month
    const basicPay = dailyRate * presentDays
    const deductions = (absentDays + lateDays * 0.5) * dailyRate
    const netPay = basicPay - deductions

    return {
      workingDays,
      presentDays,
      absentDays,
      lateDays,
      basicPay: Math.round(basicPay),
      deductions: Math.round(deductions),
      netPay: Math.round(netPay)
    }
  }

  const generatePayroll = (employee: any) => {
    const existingRecord = payrollRecords.find(
      record => record.employeeId === employee.id && record.month === selectedMonth
    )

    if (existingRecord) {
      alert("Payroll already generated for this employee and month")
      return
    }

    const calculation = calculatePayroll(employee, selectedMonth)

    const payrollRecord = {
      id: Date.now(),
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      month: selectedMonth,
      ...calculation,
      status: "Generated",
      generatedBy: user.email,
      generatedAt: new Date().toISOString()
    }

    const updatedRecords = [...payrollRecords, payrollRecord]
    setPayrollRecords(updatedRecords)
    localStorage.setItem("payroll", JSON.stringify(updatedRecords))
  }

  const approvePayroll = (id: number) => {
    const updatedRecords = payrollRecords.map(record =>
      record.id === id ? { ...record, status: "Approved", approvedBy: user.email, approvedAt: new Date().toISOString() } : record
    )
    setPayrollRecords(updatedRecords)
    localStorage.setItem("payroll", JSON.stringify(updatedRecords))
  }

  const generatePayslip = (record: any) => {
    const payslipData = {
      employeeName: record.employeeName,
      employeeId: `EMP${record.employeeId}`,
      month: record.month,
      basicPay: record.basicPay,
      deductions: record.deductions,
      netPay: record.netPay,
      workingDays: record.workingDays,
      presentDays: record.presentDays,
      absentDays: record.absentDays,
      generatedAt: record.generatedAt
    }

    // In a real app, this would generate a PDF
    alert(`Payslip generated for ${record.employeeName}\nMonth: ${record.month}\nNet Pay: $${record.netPay}`)
  }

  const filteredRecords = payrollRecords.filter(record => record.month === selectedMonth)

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
              <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Monthly Payroll</h2>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              {showForm ? "Cancel" : "Generate Payroll"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Payroll for Employees</h3>
              <div className="space-y-4">
                {employees.filter(emp => emp.status === 'Active').map((employee) => {
                  const calculation = calculatePayroll(employee, selectedMonth)
                  const existingRecord = payrollRecords.find(
                    record => record.employeeId === employee.id && record.month === selectedMonth
                  )

                  return (
                    <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{employee.name}</h4>
                          <p className="text-sm text-gray-500">{employee.designation} • ${employee.salary}/month</p>
                          <div className="mt-2 text-sm text-gray-600">
                            Present: {calculation.presentDays} | Absent: {calculation.absentDays} | Late: {calculation.lateDays}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-medium text-gray-900">${calculation.netPay}</div>
                          <div className="text-sm text-gray-500">Basic: ${calculation.basicPay}</div>
                          <div className="text-sm text-red-600">Deductions: ${calculation.deductions}</div>
                          {existingRecord ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                              Already Generated
                            </span>
                          ) : (
                            <button
                              onClick={() => generatePayroll(employee)}
                              className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Generate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Payroll Records - {selectedMonth}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No payroll records for this month
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                          <div className="text-sm text-gray-500">Present: {record.presentDays}/{record.workingDays}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${record.basicPay}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          ${record.deductions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${record.netPay}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {record.status === 'Generated' && (
                              <button
                                onClick={() => approvePayroll(record.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => generatePayslip(record)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Generate Payslip
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
