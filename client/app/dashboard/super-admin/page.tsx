import { getSession } from "@/app/actions/mart-actions";
import { redirect } from "next/navigation";
import SuperAdminDashboardClient from "./SuperAdminDashboardClient";

export default async function SuperAdminDashboard() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as string;
  if (role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return <SuperAdminDashboardClient />;
}
