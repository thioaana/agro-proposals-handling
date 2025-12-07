"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { deleteProposal, type Proposal } from "@/lib/services/agroService";
import { deletePdfFromStorage } from "@/lib/services/storageService";

interface DashboardTableProps {
  proposals: Proposal[];
}

// Validate PDF URL points to Supabase storage
const isValidPdfUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
};

export function DashboardTable({ proposals }: DashboardTableProps) {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/new-proposal?id=${id}`);
  };

  const handleDelete = async (id: string, pdfUrl: string | null) => {
    const confirmation = await Swal.fire({
      title: "Delete proposal?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    // Delete PDF from storage if exists
    if (pdfUrl) {
      await deletePdfFromStorage(pdfUrl);
    }

    const result = await deleteProposal(id);

    if (!result.success) {
      toast.error(result.error || "Failed to delete proposal");
      return;
    }

    toast.success("Proposal deleted");
    router.refresh();
  };

  if (proposals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No proposals yet.</p>
        <Button onClick={() => router.push("/new-proposal")}>
          Create your first proposal
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead className="bg-primary text-primary-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Area</th>
            <th className="px-4 py-3 text-left font-semibold">Plant</th>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Date</th>
            <th className="px-4 py-3 text-left font-semibold">PDF</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-card text-card-foreground">
          {proposals.map((proposal, index) => (
            <tr
              key={proposal.id}
              className={`border-b border-border hover:bg-muted/50 transition-colors ${
                index % 2 === 0 ? "bg-card" : "bg-muted/30"
              }`}
            >
              <td className="px-4 py-3">{proposal.area}</td>
              <td className="px-4 py-3">{proposal.plant}</td>
              <td className="px-4 py-3">{proposal.name}</td>
              <td className="px-4 py-3">{proposal.email}</td>
              <td className="px-4 py-3">
                {new Date(proposal.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {proposal.pdf_url && isValidPdfUrl(proposal.pdf_url) ? (
                  <a
                    href={proposal.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline font-medium transition-colors"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(proposal.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(proposal.id, proposal.pdf_url)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
