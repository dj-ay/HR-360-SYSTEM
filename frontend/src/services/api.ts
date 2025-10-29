import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  getCurrentUser: () => api.get("/auth/me"),
}

export const recruitmentAPI = {
  getJobs: () => api.get("/recruitment/jobs"),
  applyForJob: (jobId: number, resume: File) => {
    const formData = new FormData()
    formData.append("job_id", jobId.toString())
    formData.append("resume", resume)
    return api.post("/recruitment/apply", formData)
  },
}

export const attendanceAPI = {
  checkIn: () => api.post("/attendance/check-in"),
  checkOut: () => api.post("/attendance/check-out"),
  getRecords: (userId?: number, month?: string) =>
    api.get("/attendance/records", { params: { user_id: userId, month } }),
}

export const payrollAPI = {
  getPayslips: () => api.get("/payroll/records"),
  getPayslip: (payrollId: number) => api.get(`/payroll/payslip/${payrollId}`),
}

export const leaveAPI = {
  applyLeave: (data: any) => api.post("/leave/apply", data),
  getApplications: (userId?: number, status?: string) =>
    api.get("/leave/applications", { params: { user_id: userId, status } }),
}

export default api
