"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      setIsAuthenticated(true)
      // Redirect to appropriate dashboard based on role
      try {
        const userData = JSON.parse(user)
        const role = userData.role

        if (role === "Admin" || role === "HR") {
          router.push("/hr-dashboard")
        } else if (role === "Employee") {
          router.push("/employee-dashboard")
        } else if (role === "Candidate") {
          router.push("/candidate-dashboard")
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">HR-360</h1>
          <p className="text-xl text-muted-foreground">Comprehensive Human Resources Management System</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment</CardTitle>
              <CardDescription>Manage job postings and candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Streamline your hiring process with our comprehensive recruitment tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>Track employee information and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Centralize employee data, attendance, and performance metrics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payroll & Leave</CardTitle>
              <CardDescription>Manage compensation and time off</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Handle payroll processing and leave management efficiently.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Sign in to access your HR-360 dashboard</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={() => router.push("/login")} className="flex-1">
                Sign In
              </Button>
              <Button variant="outline" onClick={() => router.push("/signup")} className="flex-1">
                Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
