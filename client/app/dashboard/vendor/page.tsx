import { getSession } from "@/app/actions/mart-actions";
import { redirect } from "next/navigation";
import VendorDashboardClient from "./VendorDashboardClient";

export default async function VendorDashboard() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as string;
  if (role !== "VENDOR") {
    redirect("/dashboard");
  }

  return <VendorDashboardClient />;
}
