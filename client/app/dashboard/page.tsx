"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    const role = (session.user as Record<string, unknown>).role as string;
    const map: Record<string, string> = {
      CUSTOMER: "/dashboard/customer",
      VENDOR: "/dashboard/vendor",
      DELIVERY_PARTNER: "/dashboard/delivery",
      ADMIN: "/dashboard/admin",
      SUPER_ADMIN: "/dashboard/super-admin",
    };
    router.push(map[role] || "/dashboard/customer");
  }, [session, isPending, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
