// CivicVoice API Client
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => localStorage.getItem('cv_token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('cv_token', token);
  } else {
    localStorage.removeItem('cv_token');
  }
};

const apiRequest = async (endpoint, { method = 'GET', body = null, headers = {} } = {}) => {
  const token = getAuthToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const finalHeaders = { ...defaultHeaders, ...headers };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage = data?.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const api = {
  // Authentication
  auth: {
    login: async ({ email, password }) => {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      if (res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res.data;
    },
    register: async ({ name, email, password }) => {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      if (res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res.data;
    },
    getMe: async () => {
      const res = await apiRequest('/auth/me');
      return res.data;
    },
    logout: async () => {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } finally {
        setAuthToken(null);
      }
    },
  },

  // Issues & Lifecycle
  issues: {
    getAll: async ({ category, status, search } = {}) => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);
      if (search && search.trim() !== '') params.append('search', search.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest(`/issues${queryStr}`);
      return res.data?.issues || [];
    },
    getById: async (id) => {
      const res = await apiRequest(`/issues/${id}`);
      return res.data?.issue;
    },
    create: async (issueData) => {
      const res = await apiRequest('/issues', {
        method: 'POST',
        body: issueData,
      });
      return res.data?.issue;
    },
    upvote: async (id) => {
      const res = await apiRequest(`/issues/${id}/upvote`, {
        method: 'POST',
      });
      return res.data;
    },
    updateStatus: async (id, updateData) => {
      const res = await apiRequest(`/issues/${id}/status`, {
        method: 'PATCH',
        body: updateData,
      });
      return res.data?.issue;
    },
    verify: async (id, verifyData) => {
      const res = await apiRequest(`/issues/${id}/verify`, {
        method: 'POST',
        body: verifyData,
      });
      return res.data?.issue;
    },
    getStats: async () => {
      const res = await apiRequest('/issues/stats');
      return res.data;
    },
    getSimilar: async ({ category, latitude, longitude, title = '', description = '', radius } = {}) => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (latitude) params.append('latitude', latitude);
      if (longitude) params.append('longitude', longitude);
      if (radius) params.append('radius', radius);
      if (title) params.append('title', title);
      if (description) params.append('description', description);
      const res = await apiRequest(`/issues/similar?${params.toString()}`);
      return res.data?.similar || [];
    },
    joinCanonical: async (id) => {
      const res = await apiRequest(`/issues/${id}/join`, {
        method: 'POST',
      });
      return res.data;
    },
    markDuplicate: async (duplicateId, canonicalId) => {
      const res = await apiRequest(`/issues/${duplicateId}/mark-duplicate`, {
        method: 'PATCH',
        body: { canonicalId },
      });
      return res.data;
    },
    unmarkDuplicate: async (duplicateId) => {
      const res = await apiRequest(`/issues/${duplicateId}/unmark-duplicate`, {
        method: 'PATCH',
      });
      return res.data;
    },
    reportForModeration: async (id, { reason, details }) => {
      const res = await apiRequest(`/issues/${id}/report`, {
        method: 'POST',
        body: { reason, details },
      });
      return res.data;
    },
    delete: async (id) => {
      const res = await apiRequest(`/issues/${id}`, { method: 'DELETE' });
      return res.data;
    },
  },

  // Municipal & Admin
  municipal: {
    getOverview: async () => {
      const res = await apiRequest('/municipal/overview');
      return res.data;
    },
    getIssues: async ({ category, status, search } = {}) => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);
      if (search && search.trim() !== '') params.append('search', search.trim());
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest(`/municipal/issues${queryStr}`);
      return res.data?.issues || [];
    },
  },
  admin: {
    getUsers: async () => {
      const res = await apiRequest('/admin/users');
      return res.data?.users;
    },
    updateRole: async (userId, role) => {
      const res = await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: { role },
      });
      return res.data?.user;
    },
    getOverview: async () => {
      const res = await apiRequest('/admin/overview');
      return res.data;
    },
    getIssues: async ({ category, status, search } = {}) => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);
      if (search && search.trim() !== '') params.append('search', search.trim());
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest(`/admin/issues${queryStr}`);
      return res.data?.issues || [];
    },
  },
};

export default api;
