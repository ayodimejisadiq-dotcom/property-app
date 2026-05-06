import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fill px-4 py-10 text-center">
      <Logo size="md" className="mb-8" />
      <div className="h-14 w-14 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-5">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-bold text-ink">Lost your way?</h1>
      <p className="text-muted mt-2 max-w-sm">
        That page isn&apos;t here. It may have moved, or you might have followed
        a link that&apos;s out of date.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button>Take me home</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
