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

export async function changeTier(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const tier = String(formData.get("tier") ?? "");
  if (!["free", "investor", "pro", "portfolio"].includes(tier)) return;
  if (!userId) return;
  const { supabase, adminId } = await assertAdmin();
  await supabase.from("users").update({ tier }).eq("id", userId);
  await supabase.from("audit_log").insert({
    user_id: adminId,
    event_type: "admin_tier_changed",
    metadata: { target_user: userId, tier },
  });
  revalidatePath("/admin/users");
}

export async function resetQuota(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  const { supabase, adminId } = await assertAdmin();
  await supabase
    .from("users")
    .update({ deals_used_this_month: 0, scrapes_used_this_month: 0 })
    .eq("id", userId);
  await supabase.from("audit_log").insert({
    user_id: adminId,
    event_type: "admin_quota_reset",
    metadata: { target_user: userId },
  });
  revalidatePath("/admin/users");
}

export async function deleteDeal(formData: FormData) {
  const dealId = String(formData.get("dealId") ?? "");
  if (!dealId) return;
  const { supabase, adminId } = await assertAdmin();
  await supabase.from("deals").delete().eq("id", dealId);
  await supabase.from("audit_log").insert({
    user_id: adminId,
    event_type: "admin_deal_deleted",
    metadata: { deal_id: dealId },
  });
  revalidatePath("/admin/users");
}

export async function toggleAdmin(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const makeAdmin = formData.get("makeAdmin") === "1";
  if (!userId) return;
  const { supabase, adminId } = await assertAdmin();
  if (userId === adminId && !makeAdmin) {
    // Prevent demoting yourself — would lock you out of /admin.
    return;
  }
  await supabase
    .from("users")
    .update({ is_admin: makeAdmin })
    .eq("id", userId);
  await supabase.from("audit_log").insert({
    user_id: adminId,
    event_type: makeAdmin ? "admin_granted" : "admin_revoked",
    metadata: { target_user: userId },
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  const { adminId } = await assertAdmin();
  // We can't fully delete an auth.users row without the service role key.
  // Mark as soft-deleted via audit log; surface a TODO for proper deletion.
  const supabase = await createClient();
  await supabase.from("audit_log").insert({
    user_id: adminId,
    event_type: "admin_user_delete_requested",
    metadata: { target_user: userId },
  });
  revalidatePath("/admin/users");
}
