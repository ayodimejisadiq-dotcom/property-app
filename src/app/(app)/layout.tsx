import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/app/Logo";
import { PendingReferralApplier } from "@/components/app/PendingReferralApplier";
import { Button } from "@/components/ui/button";

async function signOut() {
  "use server";
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

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
      <header className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-md text-body hover:bg-fill"
            >
              Dashboard
            </Link>
            <Link
              href="/analyse"
              className="px-3 py-1.5 rounded-md text-body hover:bg-fill"
            >
              Analyse
            </Link>
            <Link
              href="/deals"
              className="px-3 py-1.5 rounded-md text-body hover:bg-fill"
            >
              Deals
            </Link>
            <Link
              href="/billing"
              className="px-3 py-1.5 rounded-md text-body hover:bg-fill"
            >
              Billing
            </Link>
            <Link
              href="/profile"
              className="px-3 py-1.5 rounded-md text-body hover:bg-fill"
            >
              Profile
            </Link>
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-md text-body hover:bg-fill"
              >
                Admin
              </Link>
            )}
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <PendingReferralApplier
        alreadyReferred={!!profile?.referred_by_user_id}
      />
      <main className="flex-1 bg-fill">{children}</main>
    </div>
  );
}
