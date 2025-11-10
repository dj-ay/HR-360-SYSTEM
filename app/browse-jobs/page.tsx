"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function BrowseJobs() {
  const [user, setUser] = useState<any>(null)
  const [jobPostings, setJobPostings] = useState<any[]>([])
  const [appliedJobs, setAppliedJobs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
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
    const activePostings = postings.filter((posting: any) => posting.status === "Active")
    setJobPostings(activePostings)

    // Load applied jobs for this user
    const applications = JSON.parse(localStorage.getItem("applications") || "[]")
    const userApplications = applications.filter((app: any) => app.candidateId === parsedUser.email)
    setAppliedJobs(userApplications)
  }, [router])

  const handleApply = (jobId: number) => {
    if (!user) return

    // Check if already applied
    const alreadyApplied = appliedJobs.some((app: any) => app.jobId === jobId)
    if (alreadyApplied) {
      alert("You have already applied for this job!")
      return
    }

    // Check if profile is complete
    const profiles = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    const userProfile = profiles.find((p: any) => p.userId === user.email)
    if (!userProfile) {
      alert("Please complete your profile before applying for jobs!")
      router.push("/candidate-profile")
      return
    }

    // Create application
    const newApplication = {
      id: Date.now(),
      jobId: jobId,
      candidateId: user.email,
      candidateName: user.name,
      appliedAt: new Date().toISOString(),
      status: "applied"
    }

    // Save application
    const applications = JSON.parse(localStorage.getItem("applications") || "[]")
    applications.push(newApplication)
    localStorage.setItem("applications", JSON.stringify(applications))

    // Update applied jobs state
    setAppliedJobs([...appliedJobs, newApplication])

    // Update job posting application count
    const updatedPostings = jobPostings.map((posting: any) =>
      posting.id === jobId
        ? { ...posting, applications: (posting.applications || 0) + 1 }
        : posting
    )
    setJobPostings(updatedPostings)
    localStorage.setItem("jobPostings", JSON.stringify(updatedPostings))

    alert("Application submitted successfully!")
  }

  const isApplied = (jobId: number) => {
    return appliedJobs.some((app: any) => app.jobId === jobId)
  }

  const filteredJobs = jobPostings.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.requiredSkills.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "" || job.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

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
          {/* Search and Filter */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Jobs</label>
                <input
                  type="text"
                  placeholder="Search by title, description, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedDepartment("")
                  }}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-6">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No jobs found</div>
                <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredJobs.map((job: any) => (
                <div key={job.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.department} • Posted {new Date(job.postedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <span className="text-sm text-gray-500">{job.applications || 0} applications</span>
                      </div>
                    </div>
                  </div>

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

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={isApplied(job.id)}
                        className={`px-6 py-2 rounded-lg font-medium ${
                          isApplied(job.id)
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isApplied(job.id) ? 'Already Applied' : 'Apply Now'}
                      </button>
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
