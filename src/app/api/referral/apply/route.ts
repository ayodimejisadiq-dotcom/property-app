import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(4)
    .max(12)
    .regex(/^[A-Z0-9]+$/, "Code must be alphanumeric"),
});

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid referral code" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("users")
    .select("referred_by_user_id, referral_code")
    .eq("id", user.id)
    .single();

  if (me?.referred_by_user_id) {
    return NextResponse.json(
      { error: "A referrer is already set on this account.", code: "ALREADY_REFERRED" },
      { status: 409 },
    );
  }

  if (me?.referral_code === parsed.data.code) {
    return NextResponse.json(
      { error: "You can't refer yourself.", code: "SELF_REFERRAL" },
      { status: 400 },
    );
  }

  const { data: referrer } = await supabase
    .from("users")
    .select("id, email")
    .eq("referral_code", parsed.data.code)
    .single();

  if (!referrer) {
    return NextResponse.json(
      { error: "We couldn't find that referral code.", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  const { error: updErr } = await supabase
    .from("users")
    .update({ referred_by_user_id: referrer.id })
    .eq("id", user.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  await supabase.from("audit_log").insert({
    user_id: user.id,
    event_type: "referral_applied",
    metadata: { referrer_id: referrer.id, code: parsed.data.code },
  });

  return NextResponse.json({ ok: true });
}
