"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReferralBlock({
  code,
  origin,
  referralCount,
}: {
  code: string;
  origin: string;
  referralCount: number;
}) {
  const link = `${origin}/signup?ref=${code}`;
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy(value: string, which: "link" | "code") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
    } catch {
      // ignore
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Dealscope",
          text: "Score UK BTL deals in seconds. Free to try.",
          url: link,
        });
      } catch {
        // user dismissed
      }
    } else {
      copy(link, "link");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ref-code">Your code</Label>
          <div className="flex gap-2">
            <Input
              id="ref-code"
              readOnly
              value={code}
              className="font-mono text-base tracking-widest"
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => copy(code, "code")}
              aria-label="Copy referral code"
            >
              {copied === "code" ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Referrals so far</Label>
          <div className="h-10 flex items-center px-3 rounded-md border border-line bg-fill text-ink font-medium">
            <span className="text-2xl mr-2">{referralCount}</span>
            <span className="text-sm text-muted">
              {referralCount === 1 ? "person joined" : "people joined"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ref-link">Shareable link</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input id="ref-link" readOnly value={link} className="font-mono text-xs" />
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => copy(link, "link")}
            >
              {copied === "link" ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy link
                </>
              )}
            </Button>
            <Button type="button" onClick={share}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

