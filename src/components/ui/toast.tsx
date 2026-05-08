"use client";

import * as React from "react";
import { CheckCircle2, X, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const show = React.useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 items-end pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const Icon =
    toast.tone === "success"
      ? CheckCircle2
      : toast.tone === "error"
        ? AlertTriangle
        : Info;
  const tone =
    toast.tone === "success"
      ? "border-[var(--color-success)]/30 bg-white"
      : toast.tone === "error"
        ? "border-[var(--color-danger)]/30 bg-white"
        : "border-line bg-white";
  const iconTone =
    toast.tone === "success"
      ? "text-[var(--color-success)]"
      : toast.tone === "error"
        ? "text-[var(--color-danger)]"
        : "text-[var(--color-primary)]";

  return (
    <div
      className={cn(
        "pointer-events-auto w-full sm:w-auto max-w-md flex items-start gap-3 rounded-lg border shadow-md px-4 py-3 animate-in slide-in-from-bottom-4",
        tone,
      )}
      role="status"
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconTone)} />
      <p className="text-sm text-ink flex-1 leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-faint hover:text-ink p-1 -m-1 rounded"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
