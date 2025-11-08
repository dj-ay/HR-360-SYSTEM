"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Mock authentication - replace with real API call later
      const mockUsers = [
        { email: "admin@hr360.com", password: "admin123", role: "Admin", name: "Admin User" },
        { email: "hr@hr360.com", password: "hr123", role: "HR", name: "HR User" },
        { email: "employee@hr360.com", password: "emp123", role: "Employee", name: "Employee User" },
        { email: "candidate@hr360.com", password: "cand123", role: "Candidate", name: "Candidate User" }
      ]

      // Check mock users first
      let user = mockUsers.find(u => u.email === email && u.password === password)

      // If not found in mock users, check localStorage users
      if (!user) {
        const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
        user = storedUsers.find((u: any) => u.email === email && u.password === password)
      }

      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Store user data (ensure consistent format)
      const userData = {
        name: user.name,
        email: user.email,
        role: user.role
      }

      localStorage.setItem("token", "mock-token-" + user.role)
      localStorage.setItem("user", JSON.stringify(userData))

      // If employee logs in, ensure their data is saved to employees database
      if (user.role === "Employee") {
        const employees = JSON.parse(localStorage.getItem("employees") || "[]")
        const existingEmployee = employees.find((emp: any) => emp.email === user.email)

        if (!existingEmployee) {
          // Create new employee record
          const newEmployee = {
            id: Date.now(),
            name: user.name,
            email: user.email,
            department: "General",
            designation: "Employee",
            salary: 50000,
            joiningDate: new Date().toISOString(),
            status: "Active",
            manager: "HR Manager"
          }
          employees.push(newEmployee)
          localStorage.setItem("employees", JSON.stringify(employees))
        }
      }

      // Redirect based on role
      if (user.role === "Admin" || user.role === "HR") {
        router.push("/hr-dashboard")
      } else if (user.role === "Employee") {
        router.push("/employee-dashboard")
      } else if (user.role === "Candidate") {
        router.push("/candidate-dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://wallpaperaccess.com/full/15682437.png')] bg-cover bg-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-900">HR-360</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
