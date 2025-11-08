"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ViewApplications() {
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
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

    // Load candidate profile to check if they have applied for jobs
    const profiles = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    const userProfile = profiles.find((p: any) => p.userId === parsedUser.email)

    if (!userProfile) {
      alert("Please complete your profile first to view applications.")
      router.push("/candidate-profile")
      return
    }

    // Load job postings to get job details
    const jobPostings = JSON.parse(localStorage.getItem("jobPostings") || "[]")
    const userApplications = userProfile.appliedJobs || []

    // Create applications array with job details
    const applicationsWithDetails = userApplications.map((jobId: number) => {
      const job = jobPostings.find((j: any) => j.id === jobId)
      return {
        ...job,
        status: userProfile.status || 'applied',
        appliedDate: userProfile.submittedAt
      }
    }).filter(Boolean)

    setApplications(applicationsWithDetails)

    // Load interviews
    const allInterviews = JSON.parse(localStorage.getItem("interviews") || "[]")
    const userInterviews = allInterviews.filter((i: any) => i.candidateEmail === parsedUser.email)
    setInterviews(userInterviews)
  }, [router])

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
              <span className="text-gray-700">Welcome, {user.name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {user.role}
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
          {/* Applications Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Applications</h2>
            <div className="grid grid-cols-1 gap-6">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No applications found</div>
                  <p className="text-gray-400 mt-2">You haven't applied for any jobs yet.</p>
                  <button
                    onClick={() => router.push("/browse-jobs")}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                applications.map((application) => (
                  <div key={application.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{application.title}</h3>
                          <p className="text-sm text-gray-500">{application.department} • {application.location}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            application.status === 'shortlisted'
                              ? 'bg-green-100 text-green-800'
                              : application.status === 'interviewed'
                              ? 'bg-blue-100 text-blue-800'
                              : application.status === 'offered'
                              ? 'bg-purple-100 text-purple-800'
                              : application.status === 'hired'
                              ? 'bg-green-100 text-green-800'
                              : application.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {application.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Applied Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(application.appliedDate).toLocaleDateString()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
                          <dd className="mt-1 text-sm text-gray-900">${application.salaryMin} - ${application.salaryMax}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Experience Required</dt>
                          <dd className="mt-1 text-sm text-gray-900">{application.experience}</dd>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Interviews Section */}
          {interviews.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Scheduled Interviews</h2>
              <div className="grid grid-cols-1 gap-6">
                {interviews.map((interview) => (
                  <div key={interview.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{interview.jobTitle}</h3>
                          <p className="text-sm text-gray-500">{interview.mode} Interview</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            interview.status === 'Scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : interview.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : interview.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(interview.date).toLocaleDateString()} at {interview.time}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Interviewer</dt>
                          <dd className="mt-1 text-sm text-gray-900">{interview.interviewer}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Mode</dt>
                          <dd className="mt-1 text-sm text-gray-900">{interview.mode}</dd>
                        </div>
                        {interview.meetingLink && (
                          <div className="md:col-span-2 lg:col-span-3">
                            <dt className="text-sm font-medium text-gray-500">Meeting Link</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <a
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {interview.meetingLink}
                              </a>
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
