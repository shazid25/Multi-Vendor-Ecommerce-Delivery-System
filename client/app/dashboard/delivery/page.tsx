import { getSession } from "@/app/actions/mart-actions";
import { redirect } from "next/navigation";
import DeliveryDashboardClient from "./DeliveryDashboardClient";

export default async function DeliveryDashboard() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as string;
  if (role !== "DELIVERY_PARTNER") {
    redirect("/dashboard");
  }

  return <DeliveryDashboardClient />;
}
