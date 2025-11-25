// app/api/get-upload-token/route.ts (Next.js API route)
import { createClient } from "@/lib/supabase/server";
// import { handler } from "next/dist/build/templates/pages";
// import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = await createClient();

  // Debug: see what cookies the server sees
  const cookieStore = await (await import("next/headers")).cookies();
  console.log("Server sees cookies:", cookieStore.getAll());

  

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session || !data.session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const token = data.session.access_token;

  // Return token (or use it directly on server if preferred)
  return new Response(JSON.stringify({ token }), {
    headers: { "Content-Type": "application/json" },
  });
}