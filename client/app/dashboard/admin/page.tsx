import { getSession } from "@/app/actions/mart-actions";
import { redirect } from "next/navigation";
import AdminOverviewClient from "./AdminOverviewClient";

export default async function AdminOverview() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as string;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return <AdminOverviewClient />;
}
