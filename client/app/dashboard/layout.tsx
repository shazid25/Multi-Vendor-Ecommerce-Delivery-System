"use client";

import React from "react";
import { DashboardSidebar } from "@/components/shared/sidebar";
import { useSession } from "@/lib/auth-client";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-6xl px-8">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="lg:pl-[280px] min-h-screen"
      >
        <div className="p-6 md:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
