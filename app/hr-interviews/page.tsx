"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HRInterviews() {
  const [user, setUser] = useState<any>(null)
  const [interviews, setInterviews] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    candidateId: "",
    jobTitle: "",
    interviewer: "",
    date: "",
    time: "",
    mode: "Online",
    meetingLink: "",
    notes: ""
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

    // Load interviews and candidates
    const interviewData = JSON.parse(localStorage.getItem("interviews") || "[]")
    const candidateData = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    setInterviews(interviewData)
    setCandidates(candidateData)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const candidate = candidates.find(c => c.userId === formData.candidateId)
    if (!candidate) return

    const newInterview = {
      id: Date.now(),
      ...formData,
      candidateName: candidate.name || "Unknown",
      candidateEmail: candidate.userId,
      status: "Scheduled",
      scheduledBy: user.email,
      scheduledAt: new Date().toISOString()
    }

    const updatedInterviews = [...interviews, newInterview]
    setInterviews(updatedInterviews)
    localStorage.setItem("interviews", JSON.stringify(updatedInterviews))

    setFormData({
      candidateId: "",
      jobTitle: "",
      interviewer: "",
      date: "",
      time: "",
      mode: "Online",
      meetingLink: "",
      notes: ""
    })
    setShowForm(false)
  }

  const updateInterviewStatus = (id: number, status: string) => {
    const updatedInterviews = interviews.map(interview =>
      interview.id === id ? { ...interview, status } : interview
    )
    setInterviews(updatedInterviews)
    localStorage.setItem("interviews", JSON.stringify(updatedInterviews))
  }

  const hireCandidate = (interview: any) => {
    // Generate email and password for the candidate
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()
    const generatedEmail = `${interview.candidateEmail.split('@')[0]}@hr360.com`

    // Create new user account
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const newUser = {
      email: generatedEmail,
      password: generatedPassword,
      role: "Employee",
      name: interview.candidateName
    }
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // Create employee record
    const employees = JSON.parse(localStorage.getItem("employees") || "[]")
    const newEmployee = {
      id: Date.now(),
      name: interview.candidateName,
      email: generatedEmail,
      department: "General",
      designation: interview.jobTitle,
      salary: 50000,
      joiningDate: new Date().toISOString(),
      status: "Active",
      manager: "HR Manager"
    }
    employees.push(newEmployee)
    localStorage.setItem("employees", JSON.stringify(employees))

    // Update interview status
    updateInterviewStatus(interview.id, 'Hired')

    // Update candidate status
    const updatedCandidates = candidates.map(candidate =>
      candidate.userId === interview.candidateEmail
        ? { ...candidate, status: 'hired' }
        : candidate
    )
    setCandidates(updatedCandidates)
    localStorage.setItem("candidateProfiles", JSON.stringify(updatedCandidates))

    // Send notification to candidate with credentials
    const notification = {
      id: Date.now(),
      userId: interview.candidateEmail,
      title: "Congratulations! You have been hired",
      message: `You have been successfully hired for the position of ${interview.jobTitle}.\n\nYour login credentials:\nEmail: ${generatedEmail}\nPassword: ${generatedPassword}\n\nPlease use these credentials to log in to the HR-360 system as an employee.`,
      createdAt: new Date().toISOString(),
      type: "hire"
    }

    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    notifications.push(notification)
    localStorage.setItem("notifications", JSON.stringify(notifications))

    // Show success message with credentials
    alert(`Candidate hired successfully!\n\nEmail: ${generatedEmail}\nPassword: ${generatedPassword}\n\nPlease share these credentials with the candidate.`)
  }

  const rejectCandidate = (interview: any) => {
    // Update interview status
    updateInterviewStatus(interview.id, 'Rejected')

    // Update candidate status
    const updatedCandidates = candidates.map(candidate =>
      candidate.userId === interview.candidateEmail
        ? { ...candidate, status: 'rejected' }
        : candidate
    )
    setCandidates(updatedCandidates)
    localStorage.setItem("candidateProfiles", JSON.stringify(updatedCandidates))

    alert("Candidate has been rejected.")
  }

  const shortlistedCandidates = candidates.filter(c => c.status === 'shortlisted')

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
              <h1 className="text-3xl font-bold text-gray-900">Interview Management</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Scheduled Interviews</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              {showForm ? "Cancel" : "Schedule Interview"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Interview</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Candidate</label>
                    <select
                      name="candidateId"
                      value={formData.candidateId}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Candidate</option>
                      {shortlistedCandidates.map((candidate) => (
                        <option key={candidate.userId} value={candidate.userId}>
                          {candidate.name || candidate.userId} - {candidate.skills?.split(',')[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interviewer</label>
                    <input
                      type="text"
                      name="interviewer"
                      value={formData.interviewer}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Interviewer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interview Mode</label>
                    <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Online">Online</option>
                      <option value="In-Person">In-Person</option>
                      <option value="Phone">Phone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {formData.mode === "Online" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes or instructions"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Schedule Interview
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {interviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No interviews scheduled</div>
                <p className="text-gray-400 mt-2">Schedule interviews for shortlisted candidates</p>
              </div>
            ) : (
              interviews.map((interview) => (
                <div key={interview.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{interview.candidateName}</h3>
                        <p className="text-sm text-gray-500">{interview.jobTitle} • {interview.mode}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : interview.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : interview.status === 'Hired'
                            ? 'bg-green-100 text-green-800'
                            : interview.status === 'Rejected'
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
                      {interview.notes && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Notes</dt>
                          <dd className="mt-1 text-sm text-gray-900">{interview.notes}</dd>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      {interview.status === 'Scheduled' && (
                        <>
                          <button
                            onClick={() => updateInterviewStatus(interview.id, 'Completed')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => updateInterviewStatus(interview.id, 'Cancelled')}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                          >
                            Cancel Interview
                          </button>
                        </>
                      )}
                      {interview.status === 'Completed' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => hireCandidate(interview)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                          >
                            Hire Candidate
                          </button>
                          <button
                            onClick={() => rejectCandidate(interview)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                          >
                            Reject Candidate
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => alert(`Send reminder to ${interview.candidateEmail}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                      >
                        Send Reminder
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
