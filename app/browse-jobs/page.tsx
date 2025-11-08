"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function BrowseJobs() {
  const [user, setUser] = useState<any>(null)
  const [jobPostings, setJobPostings] = useState<any[]>([])
  const [appliedJobs, setAppliedJobs] = useState<any[]>([])
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

    // Load job postings
    const postings = JSON.parse(localStorage.getItem("jobPostings") || "[]")
    setJobPostings(postings.filter((job: any) => job.status === 'Open'))

    // Load candidate profile to check if they can apply
    const profiles = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    const userProfile = profiles.find((p: any) => p.userId === parsedUser.email)
    if (userProfile) {
      setAppliedJobs(userProfile.appliedJobs || [])
    }
  }, [router])

  const applyForJob = (jobId: number) => {
    // Check if profile is complete
    const profiles = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    const userProfile = profiles.find((p: any) => p.userId === user.email)

    if (!userProfile) {
      alert("Please complete your profile first before applying for jobs.")
      router.push("/candidate-profile")
      return
    }

    // Check if already applied
    if (appliedJobs.includes(jobId)) {
      alert("You have already applied for this job.")
      return
    }

    // Add job to applied jobs
    const updatedAppliedJobs = [...appliedJobs, jobId]
    setAppliedJobs(updatedAppliedJobs)

    // Update profile
    const updatedProfiles = profiles.map((p: any) =>
      p.userId === user.email ? { ...p, appliedJobs: updatedAppliedJobs } : p
    )
    localStorage.setItem("candidateProfiles", JSON.stringify(updatedProfiles))

    alert("Successfully applied for the job!")
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
              <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
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
          <div className="grid grid-cols-1 gap-6">
            {jobPostings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No job openings available</div>
                <p className="text-gray-400 mt-2">Check back later for new opportunities</p>
              </div>
            ) : (
              jobPostings.map((job) => (
                <div key={job.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.department} • {job.location}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Open
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
                        <dd className="mt-1 text-sm text-gray-900">${job.salaryMin} - ${job.salaryMax}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Experience Required</dt>
                        <dd className="mt-1 text-sm text-gray-900">{job.experience}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Posted Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(job.postedDate).toLocaleDateString()}</dd>
                      </div>
                    </div>

                    <div className="mt-4">
                      <dt className="text-sm font-medium text-gray-500">Requirements</dt>
                      <dd className="mt-1 text-sm text-gray-900">{job.requirements}</dd>
                    </div>

                    <div className="mt-4">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{job.description}</dd>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end">
                      {appliedJobs.includes(job.id) ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                          Already Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => applyForJob(job.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                        >
                          Apply Now
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
