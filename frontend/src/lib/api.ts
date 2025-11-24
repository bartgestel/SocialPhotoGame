const API_BASE_URL = 'http://localhost:3000';

export const api = {
    // Friends endpoints
    getFriends: async () => {
        const response = await fetch(`${API_BASE_URL}/api/friends`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch friends');
        return response.json();
    },

    addFriend: async (friendId: string) => {
        const response = await fetch(`${API_BASE_URL}/api/friends/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ friendId }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to add friend');
        }
        return response.json();
    },

    getFriendRequests: async () => {
        const response = await fetch(`${API_BASE_URL}/api/friends/requests`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch friend requests');
        return response.json();
    },

    respondToFriendRequest: async (friendshipId: string, accept: boolean) => {
        const response = await fetch(`${API_BASE_URL}/api/friends/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ friendshipId, accept }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to respond to friend request');
        }
        return response.json();
    },

    // User endpoints
    getUserById: async (userId: string) => {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    },

    searchUsers: async (name: string) => {
        const params = new URLSearchParams({ name });
        const response = await fetch(`${API_BASE_URL}/api/users/search?${params}`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to search users');
        return response.json();
    },
};

