"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: me } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!me?.is_admin) throw new Error("Forbidden");
  return { supabase, adminId: user.id };
}

export async function toggleWaitlistMode(formData: FormData) {
  const nextMode = formData.get("mode") === "on";
  const { supabase, adminId } = await assertAdmin();
  await supabase
    .from("site_settings")
    .update({ waitlist_mode: nextMode, updated_at: new Date().toISOString() })
    .eq("id", true);
  await supabase.from("audit_log").insert({
    user_id: adminId,
    event_type: "site_mode_changed",
    metadata: { waitlist_mode: nextMode },
  });
  revalidatePath("/admin/waitlist");
  revalidatePath("/");
}

export async function deleteWaitlistSignup(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { supabase } = await assertAdmin();
  await supabase.from("waitlist_signups").delete().eq("id", id);
  revalidatePath("/admin/waitlist");
}
