import api from './client'

export const authApi = {
  login:          (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  contactAdmin:   (data) => api.post('/auth/contact-admin', data),
  getAdminInfo:   ()     => api.get('/auth/admin-info'),
}

export const studentApi = {
  getDashboard: ()       => api.get('/student/dashboard'),
  getLeaves:    ()       => api.get('/student/leaves'),
  getLeave:     (id)     => api.get(`/student/leaves/${id}`),
  applyLeave:   (fd)     => api.post('/student/leave/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  cancelLeave:  (id)     => api.delete(`/student/leaves/${id}/cancel`),
  downloadPdf:  (id)     => api.get(`/student/leaves/${id}/download-pdf`, { responseType: 'blob' }),
}

export const wardenApi = {
  getDashboard:    ()         => api.get('/warden/dashboard'),
  getPendingLeaves:()         => api.get('/warden/leaves/pending'),
  getLeave:        (id)       => api.get(`/warden/leaves/${id}`),
  approveLeave:    (id, data) => api.post(`/warden/leaves/${id}/approve`, data),
  rejectLeave:     (id, data) => api.post(`/warden/leaves/${id}/reject`, data),
  getHistory:      ()         => api.get('/warden/leaves/history'),
}

export const deanApi = {
  getDashboard:    ()         => api.get('/dean/dashboard'),
  getPendingLeaves:()         => api.get('/dean/leaves/pending'),
  getLeave:        (id)       => api.get(`/dean/leaves/${id}`),
  approveLeave:    (id, data) => api.post(`/dean/leaves/${id}/approve`, data),
  rejectLeave:     (id, data) => api.post(`/dean/leaves/${id}/reject`, data),
  getHistory:      (days=30)  => api.get(`/dean/leaves/history?days=${days}`),
}

export const securityApi = {
  getDashboard:        ()     => api.get('/security/dashboard'),
  scanQr:              (tok)  => api.get(`/security/scan?qrToken=${encodeURIComponent(tok)}`),
  markExit:            (data) => api.post('/security/mark-exit', data),
  markEntry:           (data) => api.post('/security/mark-entry', data),
  getTodayExits:       ()     => api.get('/security/exits/today'),
  getTodayEntries:     ()     => api.get('/security/entries/today'),
  getStudentsOnLeave:  ()     => api.get('/security/on-leave'),
}

export const adminApi = {
  getAllUsers:     ()         => api.get('/admin/users'),
  getUsersByRole: (role)     => api.get(`/admin/users/role/${role}`),
  createUser:     (data)     => api.post('/admin/users', data),
  updateUser:     (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser:     (id)       => api.delete(`/admin/users/${id}`),
  toggleActive:   (id)       => api.patch(`/admin/users/${id}/toggle-active`),
  resetPassword:  (id, data) => api.patch(`/admin/users/${id}/reset-password`, data),
  getAllStudents:  ()         => api.get('/admin/students'),
  createStudent:  (data)     => api.post('/admin/students', data),
  updateStudent:  (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent:  (id)       => api.delete(`/admin/students/${id}`),
  getAllLeaves:    ()         => api.get('/admin/leaves'),
  getSystemReport:()         => api.get('/admin/reports/system'),
  getAuditLogs:   (limit=100)=> api.get(`/admin/audit-logs?limit=${limit}`),
  getMessages:    ()     => api.get('/admin/messages'),
  markMessageRead:(id)   => api.patch(`/admin/messages/${id}/read`),
}

export const profileApi = {
  getMyProfile:  ()     => api.get('/profile/me'),
  getAttendance: ()     => api.get('/profile/attendance'),
  updateContact: (data) => api.patch('/profile/update-contact', data),
  uploadPhoto:   (fd)   => api.post('/profile/upload-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
}
