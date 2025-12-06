"use server";

import { createClient } from "@/lib/supabase/server";

export interface Proposal {
  id: string;
  area: string;
  plant: string;
  name: string;
  email: string;
  created_at: string;
}

export interface ProposalInput {
  area: string;
  plant: string;
  name: string;
  email: string;
}

// Read operations (for server components)

export async function getProposalsByUser(userId: string): Promise<Proposal[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agro")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }

  return data || [];
}

export async function getProposalById(
  id: string,
  userId: string
): Promise<Proposal | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agro")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching proposal:", error);
    return null;
  }

  return data;
}

// Server Actions (for client components)

export async function createProposal(
  data: ProposalInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("agro")
    .insert({ ...data, user_id: user.id });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateProposal(
  id: string,
  data: ProposalInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("agro")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteProposal(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("agro")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
