"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

interface AppNavProps {
  items: NavItem[];
  isAdmin: boolean;
  signOutAction: (formData: FormData) => Promise<void>;
}

export function AppNav({ items, isAdmin, signOutAction }: AppNavProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const allItems = isAdmin ? [...items, { href: "/admin", label: "Admin" }] : items;

  return (
    <>
      <nav className="hidden md:flex items-center gap-6 text-[11px] tracking-[0.14em] uppercase font-semibold">
        {allItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-[var(--color-ink-deep)] hover:underline underline-offset-4"
          >
            {item.label}
          </Link>
        ))}
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-[var(--color-muted)] hover:text-[var(--color-ink-deep)] tracking-[0.14em] uppercase text-[11px] font-semibold"
          >
            Sign out
          </button>
        </form>
      </nav>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden p-2 -mr-2 text-[var(--color-ink-deep)] hover:opacity-70"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-[var(--color-ink-deep)]/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-[82%] max-w-sm bg-[var(--color-paper)] border-l border-[var(--color-line-strong)] transition-transform safe-top",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-line-strong)]">
            <Logo size="sm" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-2 -mr-2 text-[var(--color-ink-deep)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="p-2 flex flex-col">
            {allItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3.5 text-sm tracking-[0.14em] uppercase font-semibold text-[var(--color-ink-deep)] hover:underline underline-offset-4"
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-[var(--color-line)] my-2" />
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full text-left px-4 py-3.5 text-sm tracking-[0.14em] uppercase font-semibold text-[var(--color-muted)]"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </div>
    </>
  );
}
