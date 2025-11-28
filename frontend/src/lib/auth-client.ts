import { createAuthClient } from "better-auth/react"

// Use same API base URL logic as api.ts - empty string for Docker/nginx proxy
const API_BASE_URL = typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL 
    : (import.meta.env.DEV ? 'http://localhost:3000' : '');

console.log('Auth baseURL:', `${API_BASE_URL}/api/auth`);

export const authClient = createAuthClient({
    baseURL: `${API_BASE_URL}/api/auth`
})