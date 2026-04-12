import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

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
