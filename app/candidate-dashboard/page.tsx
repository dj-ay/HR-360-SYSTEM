"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CandidateDashboard() {
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [profileComplete, setProfileComplete] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
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

    // Check if profile is complete
    const profiles = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    const userProfile = profiles.find((p: any) => p.userId === parsedUser.email)
    setProfileComplete(!!userProfile)

    // Check application status
    if (userProfile) {
      setApplicationStatus(userProfile.status || 'applied')
    }

    // Load notifications
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const userNotifications = allNotifications.filter((n: any) => n.userId === parsedUser.email)
    setNotifications(userNotifications)
  }, [router])

  const getApplicationStats = () => {
    if (!profileComplete) return { applications: 0, interviews: 0, offers: 0 }

    const profiles = JSON.parse(localStorage.getItem("candidateProfiles") || "[]")
    const userProfile = profiles.find((p: any) => p.userId === user.email)

    const interviews = JSON.parse(localStorage.getItem("interviews") || "[]")
    const userInterviews = interviews.filter((i: any) => i.candidateId === user.email)

    return {
      applications: userProfile ? 1 : 0,
      interviews: userInterviews.length,
      offers: userProfile?.status === 'offered' ? 1 : 0
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

  const stats = getApplicationStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Candidate Dashboard</h1>
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Notifications</h2>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">!</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">{notification.title}</h3>
                        <p className="text-sm text-blue-700 mt-1">{notification.message}</p>
                        <p className="text-xs text-blue-600 mt-2">{new Date(notification.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Completion Alert */}
          {!profileComplete && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">⚠</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">Complete Your Profile</h3>
                  <p className="text-sm text-yellow-700 mt-1">Complete your profile to start applying for jobs.</p>
                  <div className="mt-3">
                    <button
                      onClick={() => router.push("/candidate-profile")}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Complete Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Application Status */}
          {profileComplete && applicationStatus && (
            <div className="mb-6">
              <div className={`border rounded-lg p-4 ${
                applicationStatus === 'shortlisted'
                  ? 'bg-green-50 border-green-200'
                  : applicationStatus === 'interviewed'
                  ? 'bg-blue-50 border-blue-200'
                  : applicationStatus === 'offered'
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    applicationStatus === 'shortlisted'
                      ? 'bg-green-500'
                      : applicationStatus === 'interviewed'
                      ? 'bg-blue-500'
                      : applicationStatus === 'offered'
                      ? 'bg-purple-500'
                      : 'bg-gray-500'
                  }`}>
                    <span className="text-white text-sm">
                      {applicationStatus === 'shortlisted' ? '✓' :
                       applicationStatus === 'interviewed' ? 'I' :
                       applicationStatus === 'offered' ? 'O' : 'A'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Application Status</h3>
                    <p className="text-sm text-gray-600 capitalize">{applicationStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">J</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Job Applications</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.applications}</dd>
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
                      <span className="text-white text-sm font-medium">I</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Interviews</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.interviews}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">O</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Offers</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.offers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push("/candidate-profile")}
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700"
              >
                {profileComplete ? 'Update Profile' : 'Complete Profile'}
              </button>
              <button
                onClick={() => router.push("/browse-jobs")}
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700"
              >
                Browse Jobs
              </button>
              <button
                onClick={() => {
                  if (profileComplete) {
                    router.push("/candidate-profile") // Show applications in profile or create separate page
                  } else {
                    alert("Please complete your profile first to view applications.")
                  }
                }}
                className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700"
              >
                View Applications
              </button>
              <button
                onClick={() => router.push("/candidate-profile")}
                className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700"
              >
                Profile Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
