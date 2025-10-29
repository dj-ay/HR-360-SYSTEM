"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { recruitmentAPI } from "../services/api"

export default function CandidateDashboard() {
  const [user, setUser] = useState<any>(null)
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [resume, setResume] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const response = await recruitmentAPI.getJobs()
      setJobs(response.data)
    } catch (error) {
      console.error("Error loading jobs:", error)
    }
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resume || !selectedJob) {
      alert("Please select a job and upload a resume")
      return
    }

    setLoading(true)
    try {
      await recruitmentAPI.applyForJob(selectedJob.job_id, resume)
      alert("Application submitted successfully")
      setResume(null)
      setSelectedJob(null)
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">HR-360</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-700">{user?.name}</span>
            <button
              onClick={() => {
                localStorage.clear()
                window.location.href = "/login"
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome, {user?.name}</h2>
          <p className="text-slate-600">Browse and apply for available job positions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job: any) => (
                  <div
                    key={job.job_id}
                    className={`p-6 border rounded-lg cursor-pointer transition ${
                      selectedJob?.job_id === job.job_id
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{job.department}</p>
                    <p className="text-slate-700 mb-3">{job.description}</p>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {job.skills.split(",").map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">Deadline: {job.deadline}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">No jobs available</p>
              )}
            </div>
          </div>

          {selectedJob && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-fit">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Apply for {selectedJob.title}</h3>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resume</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !resume}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
