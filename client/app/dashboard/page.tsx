import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/mart-actions";

/**
 * Server-side redirect to the appropriate role-based dashboard.
 * This fixes the client-side redirection loop and flickering issues.
 */
export default async function DashboardRedirect() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as string;

  const dashboardMap: Record<string, string> = {
    CUSTOMER: "/dashboard/customer",
    VENDOR: "/dashboard/vendor",
    DELIVERY_PARTNER: "/dashboard/delivery",
    ADMIN: "/dashboard/admin",
    SUPER_ADMIN: "/dashboard/super-admin",
  };

  const targetPath = dashboardMap[role] || "/dashboard/customer";
  
  redirect(targetPath);
}
