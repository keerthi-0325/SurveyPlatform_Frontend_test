import axios from 'axios';
import useAuthStore from '../store/authStore';

// ✅ Base API (Railway backend)
const api = axios.create({
baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
const token = useAuthStore.getState().token;
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
});

// ✅ Handle auth errors globally
api.interceptors.response.use(
(res) => res,
(err) => {
if (err.response?.status === 401) {
useAuthStore.getState().logout();
window.location.href = '/login';
}
return Promise.reject(err);
}
);

// ─── AUTH ─────────────────────────────────────────────
export const authApi = {
login:          (data) => api.post('/auth/login', data).then((r) => r.data),
register:       (data) => api.post('/auth/register', data).then((r) => r.data),
me:             ()     => api.get('/auth/me').then((r) => r.data),
forgotPassword: (data) => api.post('/auth/forgot-password', data).then((r) => r.data),
resetPassword:  (data) => api.post('/auth/reset-password', data).then((r) => r.data),
};

// ─── SURVEYS ──────────────────────────────────────────
export const surveysApi = {
getAll:       ()         => api.get('/surveys').then((r) => r.data),
getOne:       (id)       => api.get(`/surveys/${id}`).then((r) => r.data),

// ✅ FIXED (was using fetch → now axios)
getPublic:    (id)       => api.get(`/surveys/public/${id}`).then((r) => r.data),

create:       (data)     => api.post('/surveys', data).then((r) => r.data),
update:       (id, data) => api.put(`/surveys/${id}`, data).then((r) => r.data),
delete:       (id)       => api.delete(`/surveys/${id}`).then((r) => r.data),
getResponses: (id)       => api.get(`/surveys/${id}/responses`).then((r) => r.data),
getQRDataUrl: (id)       => api.get(`/surveys/${id}/qr?format=dataurl`).then((r) => r.data),

exportPDF:    (id, type = 'report') =>
api.get(`/surveys/${id}/export/pdf?type=${type}`, { responseType: 'blob' }).then((r) => r.data),

exportCSV:    (id) =>
api.get(`/surveys/${id}/export/csv`, { responseType: 'blob' }).then((r) => r.data),

exportExcel:  (id) =>
api.get(`/surveys/${id}/export/excel`, { responseType: 'blob' }).then((r) => r.data),

exportAllCSV: () =>
api.get('/surveys/export/all/csv', { responseType: 'blob' }).then((r) => r.data),
};

// ─── CLIENTS ──────────────────────────────────────────
export const clientsApi = {
getAll:  ()         => api.get('/clients').then((r) => r.data),
getOne:  (id)       => api.get(`/clients/${id}`).then((r) => r.data),
create:  (data)     => api.post('/clients', data).then((r) => r.data),
update:  (id, data) => api.put(`/clients/${id}`, data).then((r) => r.data),
delete:  (id)       => api.delete(`/clients/${id}`).then((r) => r.data),
};

// ─── ASSIGNMENTS ──────────────────────────────────────
export const assignmentsApi = {
getAll:       ()           => api.get('/assignments').then((r) => r.data),
create:       (data)       => api.post('/assignments', data).then((r) => r.data),
updateStatus: (id, status) => api.patch(`/assignments/${id}/status`, { status }).then((r) => r.data),
};

// ─── RESPONSES ────────────────────────────────────────
export const responsesApi = {
// ✅ FIXED (was fetch → now axios)
submit: (data) =>
api.post('/responses', data).then((r) => r.data),

// ✅ FIXED (was hitting Vercel → now Railway)
recordDropOff: (data) =>
api.post('/responses/drop-off', data).catch(() => {}),

getOne: (id) =>
api.get(`/responses/${id}`).then((r) => r.data),
};

// ─── ANALYTICS ────────────────────────────────────────
export const analyticsApi = {
overview: ()   => api.get('/analytics/overview').then((r) => r.data),
survey:   (id) => api.get(`/analytics/surveys/${id}`).then((r) => r.data),
advanced: (id) => api.get(`/analytics/advanced/${id}`).then((r) => r.data),
};

// ─── DISTRIBUTION ─────────────────────────────────────
export const distributionApi = {
getLinks:        (id)       => api.get(`/surveys/${id}/distribute/links`).then((r) => r.data),
getStats:        (id)       => api.get(`/surveys/${id}/distribute/stats`).then((r) => r.data),
sendEmail:       (id, data) => api.post(`/surveys/${id}/distribute/email`, data).then((r) => r.data),
sendWhatsApp:    (id, data) => api.post(`/surveys/${id}/distribute/whatsapp`, data).then((r) => r.data),
generateVenueQR: (id, data) => api.post(`/surveys/${id}/distribute/venue`, data).then((r) => r.data),
};

// ─── USERS ────────────────────────────────────────────
export const usersApi = {
getAll:  ()         => api.get('/users').then((r) => r.data),
create:  (data)     => api.post('/users', data).then((r) => r.data),
update:  (id, data) => api.put(`/users/${id}`, data).then((r) => r.data),
delete:  (id)       => api.delete(`/users/${id}`).then((r) => r.data),
};

// ─── TAGS ─────────────────────────────────────────────
export const tagsApi = {
getAll: ()     => api.get('/tags').then((r) => r.data),
create: (data) => api.post('/tags', data).then((r) => r.data),
delete: (id)   => api.delete(`/tags/${id}`).then((r) => r.data),
};

export default api;
