// Use environment variable for API base URL
// In Docker with nginx proxy: VITE_API_URL should be empty string (uses relative URLs like /api/*)
// In local development: VITE_API_URL defaults to http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
    ? import.meta.env.VITE_API_URL 
    : 'http://localhost:3000';

console.log('API_BASE_URL:', API_BASE_URL);

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

    // Picture endpoints
    uploadPicture: async (formData: FormData) => {
        const response = await fetch(`${API_BASE_URL}/api/pictures/upload`, {
            method: 'POST',
            credentials: 'include',
            body: formData, // Don't set Content-Type, browser will set it with boundary
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to upload picture');
        }
        return response.json();
    },

    getMyPictures: async () => {
        const response = await fetch(`${API_BASE_URL}/api/pictures/my-pictures`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch pictures');
        return response.json();
    },

    getPictureByToken: async (shareToken: string) => {
        const response = await fetch(`${API_BASE_URL}/api/pictures/token/${shareToken}`);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to fetch picture');
        }
        return response.json();
    },

    getPictureMedia: async (pictureId: string, anonymousId: string) => {
        return `${API_BASE_URL}/api/pictures/${pictureId}/media/${anonymousId}`;
    },

    // Game endpoints
    startGame: async (gameId: string, shareToken?: string, anonymousId?: string) => {
        const response = await fetch(`${API_BASE_URL}/api/games/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, shareToken, anonymousId }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to start game');
        }
        return response.json();
    },

    verifyGame: async (sessionId: string, signature: string, score?: number) => {
        const response = await fetch(`${API_BASE_URL}/api/games/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, signature, score }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to verify game');
        }
        return response.json();
    },
};