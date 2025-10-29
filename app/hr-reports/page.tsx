"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HRReports() {
  const [user, setUser] = useState<any>(null)
  const [reportType, setReportType] = useState("employees")
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
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
  }, [router])

  const generateReport = () => {
    const data = getReportData(reportType)
    const csvContent = convertToCSV(data)
    downloadCSV(csvContent, `${reportType}-report-${dateRange.start}-to-${dateRange.end}.csv`)
  }

  const getReportData = (type: string) => {
    switch (type) {
      case "employees":
        return JSON.parse(localStorage.getItem("employees") || "[]")
      case "attendance":
        const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
        return attendance.filter((record: any) => {
          const recordDate = new Date(record.date)
          const startDate = new Date(dateRange.start)
          const endDate = new Date(dateRange.end)
          return recordDate >= startDate && recordDate <= endDate
        })
      case "leave":
        const leaveRequests = JSON.parse(localStorage.getItem("leaveRequests") || "[]")
        return leaveRequests.filter((request: any) => {
          const requestDate = new Date(request.appliedAt)
          const startDate = new Date(dateRange.start)
          const endDate = new Date(dateRange.end)
          return requestDate >= startDate && requestDate <= endDate
        })
      case "payroll":
        const payroll = JSON.parse(localStorage.getItem("payroll") || "[]")
        return payroll.filter((record: any) => record.month >= dateRange.start.substring(0, 7) && record.month <= dateRange.end.substring(0, 7))
      case "performance":
        return JSON.parse(localStorage.getItem("performance") || "[]")
      default:
        return []
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        }).join(",")
      )
    ]
    return csvRows.join("\n")
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getReportStats = () => {
    const data = getReportData(reportType)
    return {
      totalRecords: data.length,
      dateRange: `${dateRange.start} to ${dateRange.end}`
    }
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

  const stats = getReportStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="employees">Employee Directory</option>
                      <option value="attendance">Attendance Report</option>
                      <option value="leave">Leave Report</option>
                      <option value="payroll">Payroll Report</option>
                      <option value="performance">Performance Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={generateReport}
                    className="w-full bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                  >
                    Generate Report
                  </button>
                </div>
              </div>

              {/* Report Stats */}
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Report Type:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{reportType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Records:</span>
                    <span className="text-sm font-medium text-gray-900">{stats.totalRecords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date Range:</span>
                    <span className="text-sm font-medium text-gray-900">{stats.dateRange}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Report Preview</h2>

                {reportType === "employees" && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-700">Employee Directory</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getReportData("employees").slice(0, 6).map((employee: any) => (
                        <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.designation}</div>
                          <div className="text-xs text-gray-500">{employee.department}</div>
                          <div className="text-xs text-gray-500">Status: {employee.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportType === "attendance" && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-700">Attendance Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getReportData("attendance").slice(0, 5).map((record: any) => (
                            <tr key={record.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{record.employeeName}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{record.date}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{record.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {reportType === "leave" && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-700">Leave Requests</h3>
                    <div className="space-y-3">
                      {getReportData("leave").slice(0, 3).map((request: any) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                          <div className="text-xs text-gray-500">{request.leaveType} • {request.days} days</div>
                          <div className="text-xs text-gray-500">Status: {request.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportType === "payroll" && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-700">Payroll Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getReportData("payroll").slice(0, 5).map((record: any) => (
                            <tr key={record.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{record.employeeName}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{record.month}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">${record.netPay}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {reportType === "performance" && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-700">Performance Reviews</h3>
                    <div className="space-y-3">
                      {getReportData("performance").slice(0, 3).map((record: any) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                          <div className="text-xs text-gray-500">{record.reviewPeriod} • Rating: {record.rating}/5</div>
                          <div className="text-xs text-gray-500">KPIs: {record.kpis.substring(0, 50)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {getReportData(reportType).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg">No data available for the selected criteria</div>
                    <p className="text-gray-400 mt-2">Try adjusting the date range or report type</p>
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
