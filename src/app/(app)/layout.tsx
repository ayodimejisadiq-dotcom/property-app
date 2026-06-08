import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/app/Logo";
import { AppNav } from "@/components/app/AppNav";
import { PendingReferralApplier } from "@/components/app/PendingReferralApplier";

async function signOut() {
  "use server";
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyse", label: "Analyse" },
  { href: "/deals", label: "Deals" },
  { href: "/billing", label: "Billing" },
  { href: "/profile", label: "Profile" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("email, is_admin, disclaimer_accepted_at, referred_by_user_id")
    .eq("id", user.id)
    .single();

  if (profile && !profile.disclaimer_accepted_at) {
    redirect("/disclaimer");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <Logo size="sm" />
          </Link>
          <AppNav
            items={NAV_ITEMS}
            isAdmin={!!profile?.is_admin}
            signOutAction={signOut}
          />
        </div>
      </header>
      <PendingReferralApplier
        alreadyReferred={!!profile?.referred_by_user_id}
      />
      <main className="flex-1 bg-fill safe-bottom">{children}</main>
    </div>
  );
}
