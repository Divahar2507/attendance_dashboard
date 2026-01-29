export const api = {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',

    async login(username, password) {
        const res = await fetch(`${this.baseUrl}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            // Store user ID for easy access if needed, though usually passed in user obj
            if (data.user?.id) localStorage.setItem('userId', data.user.id);
        }
        return data;
    },

    async getEmployees() {
        const res = await fetch(`${this.baseUrl}/employees/`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        return await res.json();
    },

    async createEmployee(data) {
        const res = await fetch(`${this.baseUrl}/employees/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(JSON.stringify(err));
        }
        return await res.json();
    },

    async updateEmployee(id, data) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/employees/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(JSON.stringify(err));
        }
        return await res.json();
    },

    async deleteEmployee(id) {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/employees/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to delete employee');
        return true;
    },

    async updateProfile(data) {
        const token = localStorage.getItem('token');
        const isFormData = data instanceof FormData;

        const headers = {
            'Authorization': `Token ${token}`
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(`${this.baseUrl}/employees/update_profile/`, {
            method: 'PATCH',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update profile');
        return await res.json();
    },

    // Attendance
    async markAttendance(userId, latitude, longitude) {
        const res = await fetch(`${this.baseUrl}/attendance/mark/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, latitude, longitude })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to mark attendance');
        return data;
    },

    async getAttendanceHistory(userId) {
        const res = await fetch(`${this.baseUrl}/attendance/mark/?user_id=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch attendance history');
        return await res.json();
    },

    // Documents
    async getDocuments(userId = null) {
        const token = localStorage.getItem('token');
        let url = `${this.baseUrl}/documents/`;
        if (userId) {
            url += `?user_id=${userId}`;
        }
        const headers = token ? { 'Authorization': `Token ${token}` } : {};

        const res = await fetch(url, {
            headers: headers
        });
        if (!res.ok) throw new Error('Failed to fetch documents');
        return await res.json();
    },

    async uploadDocument(formData) {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Token ${token}` } : {};

        const res = await fetch(`${this.baseUrl}/documents/`, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        if (!res.ok) throw new Error('Failed to upload document');
        return await res.json();
    },

    async deleteDocument(id) {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Token ${token}` } : {};

        const res = await fetch(`${this.baseUrl}/documents/${id}/`, {
            method: 'DELETE',
            headers: headers
        });
        if (!res.ok) throw new Error('Failed to delete document');
        return true;
    },

    // Work Updates
    async getWorkUpdates(userId = null) {
        const token = localStorage.getItem('token');
        let url = `${this.baseUrl}/work-updates/`;
        if (userId) {
            url += `?user_id=${userId}`;
        }
        const headers = token ? { 'Authorization': `Token ${token}` } : {};

        const res = await fetch(url, {
            headers: headers
        });
        if (!res.ok) throw new Error('Failed to fetch work updates');
        return await res.json();
    },

    async createWorkUpdate(data) {
        const token = localStorage.getItem('token');
        const headers = token ? {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        } : { 'Content-Type': 'application/json' };

        const res = await fetch(`${this.baseUrl}/work-updates/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create work update');
        return await res.json();
    }
};
