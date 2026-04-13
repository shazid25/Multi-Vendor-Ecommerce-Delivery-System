import { createAuthClient } from "better-auth/react";

// The baseURL should be the backend server URL (without the /api suffix if possible, 
// but better-auth usually expects the root of the auth endpoints)
// Use NEXT_PUBLIC_API_URL or a fallback that works with the proxy in Next.js
const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

// When running in the browser, we should use the current origin if we want to use the Next.js rewrite/proxy.
// This ensures cookies are handled correctly and we don't run into CORS issues.
const baseURL = typeof window !== "undefined" 
  ? window.location.origin 
  : (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000");

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
