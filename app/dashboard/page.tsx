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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardTable proposals={proposals} />
    </div>
  );
}
