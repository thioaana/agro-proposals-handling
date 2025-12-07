import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProposalForm } from "./proposal-form";
import { getProposalById } from "@/lib/services/agroService";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function NewProposalPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const editId = params.id;

  const initialData = editId ? await getProposalById(editId, user.id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-center">
        <div className="w-full md:w-2/3 lg:w-1/2">
          <h1 className="text-3xl font-bold mb-6">
            {editId ? "Edit Proposal" : "New Proposal"}
          </h1>
          <ProposalForm initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
