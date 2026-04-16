// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { xprisma } from "../lib/prisma.js"; // Import the extended client

// export const auth = betterAuth({
//   debug: true,
//   database: prismaAdapter(xprisma, { // Use xprisma here
//     provider: "postgresql",
//     map: {
//       user: {
//         emailVerified: "emailVerified",
//       },
//     },
//   }),

//   user: {
//     additionalFields: {
//       role: {
//         type: "string",
//         defaultValue: "CUSTOMER",
//         input: false,
//       },
//       phone: {
//         type: "string",
//         required: false,
//       },
//       isActive: {
//         type: "boolean",
//         defaultValue: true,
//       },
//       emailVerified: {
//         type: "date",
//       },
//     },
//   },

//   secret: process.env.BETTER_AUTH_SECRET || "a-very-secret-key-12345",
//   baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000/api/auth",

//   trustedOrigins: [
//     process.env.CLIENT_URL || "http://localhost:3000",
//     "http://localhost:3000",
//     "http://localhost:3001",
//   ],

//   emailAndPassword: {
//     enabled: true,
//     autoSignIn: true,
//     requireEmailVerification: false,
//   },

//   session: {
//     expiresIn: 60 * 60 * 24 * 30,
//     updateAge: 60 * 60 * 24 * 1,
//     cookieCache: {
//       enabled: false,
//     },
//   },
// });

// export type Session = typeof auth.$Infer.Session;



import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { xprisma } from "../lib/prisma.js"; 

export const auth = betterAuth({
  debug: true,
  database: prismaAdapter(xprisma, {
    provider: "postgresql",
  }),

  // This ensures Better-Auth knows exactly where it's running on Vercel
  baseURL: process.env.BETTER_AUTH_URL || "http://127.0.0.1:5000/api/auth",

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  
  trustedOrigins: [
    process.env.CLIENT_URL || "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 1,
    cookieCache: {
      enabled: false,
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  advanced: {
    cookies: {
      session_token: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;