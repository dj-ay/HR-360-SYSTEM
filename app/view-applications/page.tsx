"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ViewApplications() {
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [jobPostings, setJobPostings] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "Candidate") {
      router.push("/login")
      return
    }

    setUser(parsedUser)

    // Load applications for this user
    const allApplications = JSON.parse(localStorage.getItem("applications") || "[]")
    const userApplications = allApplications.filter((app: any) => app.candidateId === parsedUser.email)
    setApplications(userApplications)

    // Load job postings to get job details
    const postings = JSON.parse(localStorage.getItem("jobPostings") || "[]")
    setJobPostings(postings)
  }, [router])

  const getJobDetails = (jobId: number) => {
    return jobPostings.find((job: any) => job.id === jobId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800'
      case 'interviewed':
        return 'bg-purple-100 text-purple-800'
      case 'offered':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || 'User'}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {user?.role || 'Candidate'}
              </span>
              <button
                onClick={() => router.push("/candidate-dashboard")}
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
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No applications yet</div>
              <p className="text-gray-400 mt-2">Start browsing jobs and apply to positions that interest you</p>
              <button
                onClick={() => router.push("/browse-jobs")}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application: any) => {
                const job = getJobDetails(application.jobId)
                return (
                  <div key={application.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {job ? job.title : 'Job Not Found'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {job ? job.department : 'Unknown Department'} • Applied on {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {job && (
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Job Description</h4>
                            <p className="text-sm text-gray-900">{job.description}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Required Skills</h4>
                            <p className="text-sm text-gray-900">{job.requiredSkills}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Application Deadline</h4>
                          <p className="text-sm text-gray-900">{new Date(job.deadline).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Application ID: #{application.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          Status updated: {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
