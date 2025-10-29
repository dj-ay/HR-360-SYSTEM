"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HRJobPostings() {
  const [user, setUser] = useState<any>(null)
  const [jobPostings, setJobPostings] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    requiredSkills: "",
    deadline: ""
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

    // Load job postings
    const postings = JSON.parse(localStorage.getItem("jobPostings") || "[]")
    setJobPostings(postings)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newPosting = {
      id: Date.now(),
      ...formData,
      status: "Active",
      postedBy: user.email,
      postedAt: new Date().toISOString(),
      applications: 0
    }

    const updatedPostings = [...jobPostings, newPosting]
    setJobPostings(updatedPostings)
    localStorage.setItem("jobPostings", JSON.stringify(updatedPostings))

    setFormData({
      title: "",
      department: "",
      description: "",
      requiredSkills: "",
      deadline: ""
    })
    setShowForm(false)
  }

  const toggleJobStatus = (id: number) => {
    const updatedPostings = jobPostings.map(posting =>
      posting.id === id
        ? { ...posting, status: posting.status === "Active" ? "Closed" : "Active" }
        : posting
    )
    setJobPostings(updatedPostings)
    localStorage.setItem("jobPostings", JSON.stringify(updatedPostings))
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
              <h1 className="text-3xl font-bold text-gray-900">Job Postings Management</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {showForm ? "Cancel" : "Create New Job Posting"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Job Posting</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Required Skills</label>
                  <textarea
                    name="requiredSkills"
                    value={formData.requiredSkills}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., JavaScript, React, Node.js, Python"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Job Posting
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {jobPostings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No job postings yet</div>
                <p className="text-gray-400 mt-2">Create your first job posting to start recruiting</p>
              </div>
            ) : (
              jobPostings.map((posting) => (
                <div key={posting.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{posting.title}</h3>
                        <p className="text-sm text-gray-500">{posting.department} • Posted {new Date(posting.postedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          posting.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {posting.status}
                        </span>
                        <span className="text-sm text-gray-500">{posting.applications} applications</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900">{posting.description}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Required Skills</dt>
                        <dd className="mt-1 text-sm text-gray-900">{posting.requiredSkills}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(posting.deadline).toLocaleDateString()}</dd>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => toggleJobStatus(posting.id)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          posting.status === 'Active'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {posting.status === 'Active' ? 'Close Posting' : 'Reopen Posting'}
                      </button>
                      <button
                        onClick={() => router.push(`/hr-candidates?job=${posting.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                      >
                        View Applications
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
