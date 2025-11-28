import { createAuthClient } from "better-auth/react"

// Use same API base URL logic as api.ts
// For Docker/nginx proxy, use window.location.origin to get current origin
const API_BASE_URL = typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL 
    : (import.meta.env.DEV ? 'http://localhost:3000' : '');

// Auth client requires absolute URL, so if empty, use current origin
const authBaseURL = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

console.log('Auth baseURL:', `${authBaseURL}/api/auth`);

export const authClient = createAuthClient({
    baseURL: `${authBaseURL}/api/auth`
})