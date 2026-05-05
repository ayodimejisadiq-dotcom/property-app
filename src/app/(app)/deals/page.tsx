import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DealsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Saved Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted">
            Coming in Phase 5 — list, search and filter every deal you&apos;ve
            analysed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
