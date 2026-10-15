const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
let refreshTimer

function scheduleRefresh() {
  window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => window.location.reload(), 1500)
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('sociohub_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const method = (options.method || 'GET').toUpperCase()

  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : data.message
          ? JSON.stringify(data.message)
          : 'Request failed'

    const error = new Error(message)
    error.status = response.status
    error.code = data.code
    error.assignedResident = data.assignedResident
    error.assignedResidents = data.assignedResidents
    error.flatLabel = data.flatLabel
    throw error
  }

  if (method !== 'GET' && !['/auth/login', '/auth/register-society'].includes(path)) {
    scheduleRefresh()
  }

  return data
}

export const structureApi = {
  getReports: (params = '') => apiRequest(`/reports${params ? `?${params}` : ''}`),
  getFinanceSummary: () => apiRequest('/finance/summary'),
  getFinanceTransactions: (params = '') => apiRequest(`/finance/transactions${params ? `?${params}` : ''}`),
  setOpeningBalance: (body) => apiRequest('/finance/opening-balance', { method: 'POST', body: JSON.stringify(body) }),
  createFinanceTransaction: (body) => apiRequest('/finance/transactions', { method: 'POST', body: JSON.stringify(body) }),
  getSociety: (id) => apiRequest(`/societies/${id}`),
  getMySociety: () =>
    apiRequest('/societies/my-society'),
  updateSociety: (id, body) => apiRequest(`/societies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  createSociety: (body) => apiRequest('/societies', { method: 'POST', body: JSON.stringify(body) }),
  getWings: () => apiRequest('/wings'),
  createWing: (body) => apiRequest('/wings', { method: 'POST', body: JSON.stringify(body) }),
  updateWing: (id, body) => apiRequest(`/wings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteWing: (id) => apiRequest(`/wings/${id}`, { method: 'DELETE' }),
  getFlats: (wingId) => apiRequest(`/flats${wingId ? `?wingId=${wingId}` : ''}`),
  createFlat: (body) => apiRequest('/flats', { method: 'POST', body: JSON.stringify(body) }),
  updateFlat: (id, body) => apiRequest(`/flats/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteFlat: (id) => apiRequest(`/flats/${id}`, { method: 'DELETE' }),
  getParking: () => apiRequest('/parking'),
  createParking: (body) => apiRequest('/parking', { method: 'POST', body: JSON.stringify(body) }),
  updateParking: (id, body) => apiRequest(`/parking/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteParking: (id) => apiRequest(`/parking/${id}`, { method: 'DELETE' }),
  getResidents: (params = '') => apiRequest(`/residents${params ? `?${params}` : ''}`),
  createResident: (body) => apiRequest('/residents', { method: 'POST', body: JSON.stringify(body) }),
  updateResident: (id, body) => apiRequest(`/residents/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  removeResidentAssignment: (id) => apiRequest(`/residents/${id}/assignment`, { method: 'DELETE' }),
  getWatchmen: () =>
    apiRequest('/watchmen'),

  createWatchman: (body) =>
    apiRequest('/watchmen', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateWatchman: (id, body) =>
    apiRequest(`/watchmen/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteWatchman: (id) =>
    apiRequest(`/watchmen/${id}`, {
      method: 'DELETE',
    }),
  getMyFlat: () => apiRequest('/flats/my-flat'),
  getAdminBills: (params = '') => apiRequest(`/bills${params ? `?${params}` : ''}`),
  createBill: (body) => apiRequest('/bills', { method: 'POST', body: JSON.stringify(body) }),
  getMyBills: () => apiRequest('/bills/my'),
  getMyBill: (id) => apiRequest(`/bills/my/${id}`),
  payMyBill: (id) => apiRequest(`/bills/my/${id}/pay`, { method: 'POST' }),
  getMyComplaints: () => apiRequest('/complaints/my'),
  getMyComplaint: (id) => apiRequest(`/complaints/my/${id}`),
  createComplaint: (body) => apiRequest('/complaints', { method: 'POST', body: JSON.stringify(body) }),
  getAdminComplaints: (params = '') => apiRequest(`/complaints${params ? `?${params}` : ''}`),
  updateComplaint: (id, body) => apiRequest(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteComplaint: (id) => apiRequest(`/complaints/${id}`, { method: 'DELETE' }),
  getAdminAnnouncements: () => apiRequest('/announcements'),
  getAdminAnnouncement: (id) => apiRequest(`/announcements/${id}`),
  createAnnouncement: (body) => apiRequest('/announcements', { method: 'POST', body: JSON.stringify(body) }),
  updateAnnouncement: (id, body) => apiRequest(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAnnouncement: (id) => apiRequest(`/announcements/${id}`, { method: 'DELETE' }),
  getMyAnnouncements: () => apiRequest('/announcements/my'),
  getMyAnnouncement: (id) => apiRequest(`/announcements/my/${id}`),
  getResidentWatchmen: () => apiRequest('/watchmen/resident'),

}

export const notificationApi = {
  getMine: (unreadOnly = false) => apiRequest(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
  getUnreadCount: () => apiRequest('/notifications/unread-count'),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),
}

export const communityApi = {
  getWingPosts: () =>
    apiRequest('/community/wing'),

  getSocietyPosts: () =>
    apiRequest('/community/society'),

  createPost: (body) =>
    apiRequest('/community', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getPost: (id) =>
    apiRequest(`/community/posts/${id}`),

  getComments: (postId) =>
    apiRequest(`/community/posts/${postId}/comments`),

  addComment: (postId, body) =>
    apiRequest(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deletePost: (id) =>
    apiRequest(`/community/posts/${id}`, {
      method: 'DELETE',
    }),

  deleteComment: (id) =>
    apiRequest(`/community/comments/${id}`, {
      method: 'DELETE',
    }),
}

export const visitorApi = {
  createVisitor: (body) =>
    apiRequest('/visitors', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getTodayVisitors: () =>
    apiRequest('/visitors/today'),


  getWaitingVisitors: () =>
    apiRequest('/visitors/waiting'),

  getMyFlatVisitors: () =>
    apiRequest('/visitors/my-flat'),

  approveVisitor: (id) =>
    apiRequest(`/visitors/${id}/approve`, {
      method: 'PATCH',
    }),

  rejectVisitor: (id) =>
    apiRequest(`/visitors/${id}/reject`, {
      method: 'PATCH',
    }),

  markVisitorEntry: (id) =>
    apiRequest(`/visitors/${id}/entry`, {
      method: 'PATCH',
    }),

  markVisitorExit: (id) =>
    apiRequest(`/visitors/${id}/exit`, {
      method: 'PATCH',
    }),
}

export const authApi = {
  updateProfile: (body) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) =>
    apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(body)
    })
}
export const watchmanAttendanceApi = {
  startDuty: () =>
    apiRequest('/watchman-attendance/start', {
      method: 'POST',
    }),

  endDuty: () =>
    apiRequest('/watchman-attendance/end', {
      method: 'POST',
    }),

  getCurrentDuty: () =>
    apiRequest('/watchman-attendance/current'),

  getMyAttendance: () =>
    apiRequest('/watchman-attendance/my'),

  getSocietyAttendance: () =>
    apiRequest('/watchman-attendance'),
}
