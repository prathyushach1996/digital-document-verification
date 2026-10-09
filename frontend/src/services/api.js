const API_BASE = '/api';

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  },

  // Documents
  async getDocuments(params = {}, token = null) {
    const query = new URLSearchParams(params).toString();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/documents?${query}`, { headers });
    return await res.json();
  },

  async getDocumentById(id) {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    return await res.json();
  },

  async createDocument(data, token) {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateDocument(id, data, token) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateStatus(id, status, statusReason, token) {
    const res = await fetch(`${API_BASE}/documents/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, statusReason })
    });
    return await res.json();
  },

  async deleteDocument(id, token) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  },

  // Verification
  async verifyDocument(identifier, method = 'id_lookup', verifierName = 'Public Verifier', token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/documents/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ identifier, method, verifierName })
    });
    return await res.json();
  },

  async getLogs(id) {
    const res = await fetch(`${API_BASE}/documents/${id}/logs`);
    return await res.json();
  },

  // Tamper Demo
  async tamperDemo(id, alterField, newValue) {
    const res = await fetch(`${API_BASE}/documents/${id}/tamper-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alterField, newValue })
    });
    return await res.json();
  },

  // Analytics
  async getAnalyticsSummary() {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    return await res.json();
  }
};
