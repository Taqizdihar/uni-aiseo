const BASE_URL = 'http://localhost:5000/api';

const api = {
  get: async (url: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      let data = null;
      try { data = await res.json(); } catch (e) {}
      const error = new Error(`HTTP error! status: ${res.status}`) as any;
      error.response = { status: res.status, data };
      throw error;
    }
    const data = await res.json();
    return { data };
  },

  post: async (url: string, body: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let data = null;
      try { data = await res.json(); } catch (e) {}
      const error = new Error(`HTTP error! status: ${res.status}`) as any;
      error.response = { status: res.status, data };
      throw error;
    }
    const data = await res.json();
    return { data };
  },

  put: async (url: string, body: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let data = null;
      try { data = await res.json(); } catch (e) {}
      const error = new Error(`HTTP error! status: ${res.status}`) as any;
      error.response = { status: res.status, data };
      throw error;
    }
    const data = await res.json();
    return { data };
  },

  delete: async (url: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      let data = null;
      try { data = await res.json(); } catch (e) {}
      const error = new Error(`HTTP error! status: ${res.status}`) as any;
      error.response = { status: res.status, data };
      throw error;
    }
    const data = await res.json();
    return { data };
  },
};

export default api;
