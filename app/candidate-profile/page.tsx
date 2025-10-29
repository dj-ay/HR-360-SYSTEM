"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CandidateProfile() {
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState({
    phone: "",
    address: "",
    experience: "",
    skills: "",
    education: "",
    resume: null as File | null
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
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
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith('.docx')) {
        setError("Please upload a PDF or DOCX file")
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size should be less than 5MB")
        return
      }
      setProfileData(prev => ({ ...prev, resume: file }))
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Mock profile save - store in localStorage
      const profile = {
        ...profileData,
        userId: user.email,
        resumeName: profileData.resume?.name,
        submittedAt: new Date().toISOString()
      }

      const existingProfiles = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
      const existingIndex = existingProfiles.findIndex((p: any) => p.userId === user.email)

      if (existingIndex >= 0) {
        existingProfiles[existingIndex] = profile
      } else {
        existingProfiles.push(profile)
      }

      localStorage.setItem("candidateProfiles", JSON.stringify(existingProfiles))

      // Redirect to candidate dashboard
      router.push("/candidate-dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setLoading(false)
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
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {user.role}
              </span>
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

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <select
                    name="experience"
                    value={profileData.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                  <textarea
                    name="skills"
                    value={profileData.skills}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., JavaScript, React, Node.js, Python"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Education</label>
                  <textarea
                    name="education"
                    value={profileData.education}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Bachelor's in Computer Science, University Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Resume/CV</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="resume" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload your resume</span>
                          <input
                            id="resume"
                            name="resume"
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="sr-only"
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF or DOCX up to 5MB</p>
                      {profileData.resume && (
                        <p className="text-sm text-green-600">Selected: {profileData.resume.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Profile & Apply for Jobs"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
