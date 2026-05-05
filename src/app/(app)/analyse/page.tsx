import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalysePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Analyse a deal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted">
            Coming in Phase 2 — paste a Rightmove/Zoopla URL or enter property
            details manually to compute a 0–100 deal score.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
