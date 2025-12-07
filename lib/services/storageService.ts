"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "proposals";

export async function uploadPdfToStorage(
  pdfBase64: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Convert base64 to Uint8Array
  const base64Data = pdfBase64.split(",")[1] || pdfBase64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Upload to storage with user folder structure
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return { success: true, url: urlData.publicUrl };
}

export async function updatePdfInStorage(
  pdfBase64: string,
  fileName: string,
  oldPdfUrl?: string | null
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Delete old PDF if exists
  if (oldPdfUrl) {
    const urlParts = oldPdfUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length >= 2) {
      const oldFilePath = urlParts[1];
      await supabase.storage.from(BUCKET_NAME).remove([oldFilePath]);
    }
  }

  // Convert base64 to Uint8Array
  const base64Data = pdfBase64.split(",")[1] || pdfBase64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Upload new PDF
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return { success: true, url: urlData.publicUrl };
}

export async function getPdfUrl(filePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data?.publicUrl || null;
}

export async function deletePdfFromStorage(
  pdfUrl: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Extract file path from URL
  const urlParts = pdfUrl.split(`${BUCKET_NAME}/`);
  if (urlParts.length < 2) {
    return { success: false, error: "Invalid PDF URL" };
  }
  const filePath = urlParts[1];

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
