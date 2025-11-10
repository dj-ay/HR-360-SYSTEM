"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HRCandidates() {
  const [user, setUser] = useState<any>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [showBulkShortlist, setShowBulkShortlist] = useState(false)
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

    // Load candidate profiles
    const profiles = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    setCandidates(profiles)
  }, [router])

  const handleShortlist = (candidateId: string) => {
    // Mock shortlisting - in real app this would update database
    const updatedCandidates = candidates.map(candidate =>
      candidate.userId === candidateId
        ? { ...candidate, status: candidate.status === 'shortlisted' ? 'applied' : 'shortlisted' }
        : candidate
    )
    setCandidates(updatedCandidates)
    localStorage.setItem("candidateProfiles", JSON.stringify(updatedCandidates))

    // Send notification to candidate if shortlisted
    if (updatedCandidates.find(c => c.userId === candidateId)?.status === 'shortlisted') {
      const notification = {
        id: Date.now(),
        userId: candidateId,
        title: "Application Shortlisted",
        message: "Congratulations! Your application has been shortlisted. You will be contacted soon for the next steps.",
        type: "shortlist",
        createdAt: new Date().toISOString(),
        read: false
      }

      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      notifications.push(notification)
      localStorage.setItem("notifications", JSON.stringify(notifications))
    }
  }

  const handleBulkShortlist = () => {
    if (selectedCandidates.length === 0) {
      alert("Please select candidates to shortlist")
      return
    }

    const updatedCandidates = candidates.map(candidate =>
      selectedCandidates.includes(candidate.userId)
        ? { ...candidate, status: 'shortlisted' }
        : candidate
    )
    setCandidates(updatedCandidates)
    localStorage.setItem("candidateProfiles", JSON.stringify(updatedCandidates))

    // Send notifications to all shortlisted candidates
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    selectedCandidates.forEach(candidateId => {
      const notification = {
        id: Date.now() + Math.random(),
        userId: candidateId,
        title: "Application Shortlisted",
        message: "Congratulations! Your application has been shortlisted. You will be contacted soon for the next steps.",
        type: "shortlist",
        createdAt: new Date().toISOString(),
        read: false
      }
      notifications.push(notification)
    })
    localStorage.setItem("notifications", JSON.stringify(notifications))

    alert(`${selectedCandidates.length} candidates shortlisted successfully!`)
    setSelectedCandidates([])
    setShowBulkShortlist(false)
  }

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const handleSelectAll = () => {
    const allAppliedCandidates = candidates
      .filter(c => c.status !== 'shortlisted')
      .map(c => c.userId)
    setSelectedCandidates(allAppliedCandidates)
  }

  const handleScheduleInterview = (candidateId: string) => {
    // Schedule interview and send notification to candidate
    const candidate = candidates.find(c => c.userId === candidateId)
    if (!candidate) return

    // Create interview record
    const interview = {
      id: Date.now(),
      candidateId,
      candidateName: 'Candidate', // In real app, get from profile
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      status: 'scheduled',
      createdBy: user.email
    }

    const interviews = JSON.parse(localStorage.getItem("interviews") || "[]")
    interviews.push(interview)
    localStorage.setItem("interviews", JSON.stringify(interviews))

    // Send notification to candidate
    const notification = {
      id: Date.now(),
      userId: candidateId,
      title: "Interview Scheduled",
      message: `Your interview has been scheduled for ${new Date(interview.scheduledDate).toLocaleDateString()}. Please check your email for details.`,
      type: "interview",
      createdAt: new Date().toISOString(),
      read: false
    }

    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    notifications.push(notification)
    localStorage.setItem("notifications", JSON.stringify(notifications))

    alert(`Interview scheduled for candidate ${candidateId} and notification sent!`)
  }

  const handleHireCandidate = (candidateId: string) => {
    // Generate email and password for the new employee
    const candidate = candidates.find(c => c.userId === candidateId)
    if (!candidate) return

    // Generate random password
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    const employeeEmail = candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@company.com`

    // Create employee record
    const employee = {
      id: Date.now(),
      name: candidate.name,
      email: employeeEmail,
      password: password,
      role: 'Employee',
      department: 'General', // In real app, this would be assigned based on job
      hireDate: new Date().toISOString(),
      status: 'active',
      createdBy: user.email
    }

    // Save employee to localStorage
    const employees = JSON.parse(localStorage.getItem("employees") || "[]")
    employees.push(employee)
    localStorage.setItem("employees", JSON.stringify(employees))

    // Also save to users for login
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    users.push({
      name: candidate.name,
      email: employeeEmail,
      password: password,
      role: 'Employee'
    })
    localStorage.setItem("users", JSON.stringify(users))

    // Update candidate status to hired
    const updatedCandidates = candidates.map(c =>
      c.userId === candidateId
        ? { ...c, status: 'hired' }
        : c
    )
    setCandidates(updatedCandidates)
    localStorage.setItem("candidateProfiles", JSON.stringify(updatedCandidates))

    // Send notification to candidate with login credentials
    const notification = {
      id: Date.now(),
      userId: candidateId,
      title: "Congratulations! You have been hired!",
      message: `Welcome to the team! Your employee account has been created.\n\nLogin Credentials:\nEmail: ${employeeEmail}\nPassword: ${password}\n\nPlease login with these credentials and change your password after first login.`,
      type: "hire",
      createdAt: new Date().toISOString(),
      read: false
    }

    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    notifications.push(notification)
    localStorage.setItem("notifications", JSON.stringify(notifications))

    alert(`Candidate hired successfully! Login credentials sent to candidate's notification.`)
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

  const appliedCandidates = candidates.filter(c => c.status !== 'shortlisted' && c.status !== 'hired')
  const shortlistedCandidates = candidates.filter(c => c.status === 'shortlisted')
  const hiredCandidates = candidates.filter(c => c.status === 'hired')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Candidate Applications</h1>
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
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Applied</dt>
                      <dd className="text-lg font-medium text-gray-900">{appliedCandidates.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">S</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Shortlisted</dt>
                      <dd className="text-lg font-medium text-gray-900">{shortlistedCandidates.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">H</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Hired</dt>
                      <dd className="text-lg font-medium text-gray-900">{hiredCandidates.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                      <dd className="text-lg font-medium text-gray-900">{candidates.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {appliedCandidates.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Bulk Shortlisting</h3>
                  <p className="text-sm text-gray-500">Select multiple candidates to shortlist at once</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSelectAll}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setShowBulkShortlist(!showBulkShortlist)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    disabled={selectedCandidates.length === 0}
                  >
                    Shortlist Selected ({selectedCandidates.length})
                  </button>
                </div>
              </div>

              {showBulkShortlist && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3">
                    Are you sure you want to shortlist {selectedCandidates.length} candidates?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleBulkShortlist}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Yes, Shortlist All
                    </button>
                    <button
                      onClick={() => setShowBulkShortlist(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applied Candidates */}
          {appliedCandidates.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Applied Candidates</h2>
              <div className="grid grid-cols-1 gap-6">
                {appliedCandidates.map((candidate) => (
                  <div key={candidate.userId} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.userId)}
                            onChange={() => handleSelectCandidate(candidate.userId)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Candidate Application
                            </h3>
                            <p className="text-sm text-gray-500">{candidate.userId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Applied
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Phone</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.phone}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Address</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.address}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Experience</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.experience} years</dd>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Skills</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.skills}</dd>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Education</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.education}</dd>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Resume</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {candidate.resumeName && (
                              <a
                                href="#"
                                className="text-blue-600 hover:text-blue-800 underline"
                                onClick={(e) => {
                                  e.preventDefault()
                                  alert(`Resume: ${candidate.resumeName} - In a real app, this would download/open the file`)
                                }}
                              >
                                {candidate.resumeName}
                              </a>
                            )}
                          </dd>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleShortlist(candidate.userId)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                        >
                          Shortlist
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shortlisted Candidates */}
          {shortlistedCandidates.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Shortlisted Candidates</h2>
              <div className="grid grid-cols-1 gap-6">
                {shortlistedCandidates.map((candidate) => (
                  <div key={candidate.userId} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Candidate Application
                          </h3>
                          <p className="text-sm text-gray-500">{candidate.userId}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Shortlisted
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Phone</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.phone}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Address</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.address}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Experience</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.experience} years</dd>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Skills</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.skills}</dd>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Education</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.education}</dd>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Resume</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {candidate.resumeName && (
                              <a
                                href="#"
                                className="text-blue-600 hover:text-blue-800 underline"
                                onClick={(e) => {
                                  e.preventDefault()
                                  alert(`Resume: ${candidate.resumeName} - In a real app, this would download/open the file`)
                                }}
                              >
                                {candidate.resumeName}
                              </a>
                            )}
                          </dd>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleShortlist(candidate.userId)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700"
                        >
                          Remove from Shortlist
                        </button>
                        <button
                          onClick={() => handleScheduleInterview(candidate.userId)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                        >
                          Schedule Interview
                        </button>
                        <button
                          onClick={() => handleHireCandidate(candidate.userId)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                        >
                          Hire Candidate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hired Candidates */}
          {hiredCandidates.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hired Candidates</h2>
              <div className="grid grid-cols-1 gap-6">
                {hiredCandidates.map((candidate) => (
                  <div key={candidate.userId} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Candidate Application
                          </h3>
                          <p className="text-sm text-gray-500">{candidate.userId}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Hired
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Phone</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.phone}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Address</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.address}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Experience</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.experience} years</dd>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Skills</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.skills}</dd>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Education</dt>
                          <dd className="mt-1 text-sm text-gray-900">{candidate.education}</dd>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <dt className="text-sm font-medium text-gray-500">Resume</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {candidate.resumeName && (
                              <a
                                href="#"
                                className="text-blue-600 hover:text-blue-800 underline"
                                onClick={(e) => {
                                  e.preventDefault()
                                  alert(`Resume: ${candidate.resumeName} - In a real app, this would download/open the file`)
                                }}
                              >
                                {candidate.resumeName}
                              </a>
                            )}
                          </dd>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Hired on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {candidates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No candidate applications yet</div>
              <p className="text-gray-400 mt-2">Candidates will appear here once they complete their profiles</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
