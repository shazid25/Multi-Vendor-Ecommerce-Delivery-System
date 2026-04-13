import { getSession } from "@/app/actions/mart-actions";
import { redirect } from "next/navigation";
import CustomerDashboardClient from "./CustomerDashboardClient";

export default async function CustomerDashboard() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as string;
  if (role !== "CUSTOMER") {
    // If they have another role, redirect them to the proper dashboard
    // This handles the case where a vendor tries to access /dashboard/customer
    const dashboardMap: Record<string, string> = {
      VENDOR: "/dashboard/vendor",
      DELIVERY_PARTNER: "/dashboard/delivery",
      ADMIN: "/dashboard/admin",
      SUPER_ADMIN: "/dashboard/super-admin",
    };
    if (dashboardMap[role]) redirect(dashboardMap[role]);
  }

  return <CustomerDashboardClient />;
}
