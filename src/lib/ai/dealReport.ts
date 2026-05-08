import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

const ReportSchema = z.object({
  summary: z.string().min(20).max(800),
  strengths: z.array(z.string().min(3).max(240)).max(4),
  risks: z.array(z.string().min(3).max(240)).max(4),
  scoreBand: z.enum(["STRONG", "MODERATE", "WEAK"]),
});

export type AIDealReport = z.infer<typeof ReportSchema>;

const MODEL = "claude-sonnet-4-6";

export async function generateDealReport(payload: {
  property: Record<string, unknown>;
  scores: Record<string, unknown>;
  financials: Record<string, unknown>;
}): Promise<AIDealReport> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(payload) }],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  // Strip stray markdown fences if the model adds them despite instructions
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned non-JSON content");
  }

  const result = ReportSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      "AI returned a malformed report: " +
        result.error.issues.map((i) => i.path.join(".")).join(", "),
    );
  }
  return result.data;
}
