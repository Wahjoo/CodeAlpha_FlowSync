const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Generic methods
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  post: async (endpoint, body) => {
    const res = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  put: async (endpoint, body) => {
    const res = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Auth
  register: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/auth/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Projects
  getProjects: async () => {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createProject: async (name, description) => {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(res);
  },

  getProjectById: async (id) => {
    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addProjectMember: async (projectId, email) => {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  // Lists (Columns)
  createList: async (projectId, name) => {
    const res = await fetch(`${BASE_URL}/lists/project/${projectId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },

  updateList: async (listId, name, order) => {
    const res = await fetch(`${BASE_URL}/lists/${listId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, order }),
    });
    return handleResponse(res);
  },

  deleteList: async (listId) => {
    const res = await fetch(`${BASE_URL}/lists/${listId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Tasks
  createTask: async (listId, taskData) => {
    const res = await fetch(`${BASE_URL}/tasks/list/${listId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  updateTask: async (taskId, taskData) => {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  moveTask: async (taskId, listId, order) => {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}/move`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ listId, order }),
    });
    return handleResponse(res);
  },

  deleteTask: async (taskId) => {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Comments
  getComments: async (taskId) => {
    const res = await fetch(`${BASE_URL}/comments/task/${taskId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createComment: async (taskId, content) => {
    const res = await fetch(`${BASE_URL}/comments/task/${taskId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${BASE_URL}/notifications`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  markNotificationAsRead: async (notificationId) => {
    const res = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  markAllNotificationsAsRead: async () => {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  // Messages / Chat
  getMessages: async (userId) => {
    const res = await fetch(`${BASE_URL}/messages/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  sendMessage: async (receiverId, content) => {
    const res = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ receiverId, content }),
    });
    return handleResponse(res);
  },
};
