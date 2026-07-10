"use server";

import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const source = String(formData.get("source") ?? "landing");

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (email.length > 254 || name.length > 100) {
    return { ok: false, error: "That's too long." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist_signups").insert({
    email,
    name: name || null,
    source,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true, alreadyOn: true };
    }
    return { ok: false, error: "Couldn't save that — try again in a moment." };
  }

  return { ok: true };
}
