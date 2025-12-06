import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardTable } from "./dashboard-table";
import { getProposalsByUser } from "@/lib/services/agroService";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const proposals = await getProposalsByUser(user.id);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Dashboard</h1>
      <DashboardTable proposals={proposals} />
    </div>
  );
}
