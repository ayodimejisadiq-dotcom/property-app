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
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1 text-sm">
        {allItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-1.5 rounded-md text-body hover:bg-fill"
          >
            {item.label}
          </Link>
        ))}
        <form action={signOutAction}>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-md text-body hover:bg-fill text-sm font-medium"
          >
            Sign out
          </button>
        </form>
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden p-2 -mr-2 rounded-md text-ink hover:bg-fill"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-[82%] max-w-sm bg-white shadow-xl transition-transform safe-top",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-line">
            <Logo size="sm" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-2 -mr-2 rounded-md text-ink hover:bg-fill"
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
                className="px-4 py-3 rounded-md text-base text-ink hover:bg-fill active:bg-fill font-medium"
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-line my-2" />
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full text-left px-4 py-3 rounded-md text-base text-body hover:bg-fill font-medium"
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
