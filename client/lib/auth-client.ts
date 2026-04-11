import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
