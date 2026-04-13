import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Base Prisma Client
const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Extended Prisma Client
export const xprisma = basePrisma.$extends({
  query: {
    user: {
      async create({ args, query }) {
        if (typeof args.data.emailVerified === "boolean") {
          args.data.emailVerified = null;
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data && typeof args.data.emailVerified === "boolean") {
          args.data.emailVerified = null;
        }
        return query(args);
      },
    },
  },
});

export const prisma = xprisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;
