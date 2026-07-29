import OpenAI from "openai";
import { z } from "zod";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

const ReportSchema = z.object({
  summary: z.string().min(20).max(800),
  strengths: z.array(z.string().min(3).max(240)).max(4),
  risks: z.array(z.string().min(3).max(240)).max(4),
  scoreBand: z.enum(["STRONG", "MODERATE", "WEAK"]),
});

export type AIDealReport = z.infer<typeof ReportSchema>;

// Same OpenAI account as the listing scraper — one key powers both.
const MODEL = "gpt-4o-mini";

export async function generateDealReport(payload: {
  property: Record<string, unknown>;
  scores: Record<string, unknown>;
  factorNotes?: Record<string, unknown>;
  financials: Record<string, unknown>;
}): Promise<AIDealReport> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    // json_object mode guarantees syntactically valid JSON; the schema is
    // enforced by the zod parse below.
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(payload) },
    ],
  });

  const text = (completion.choices[0]?.message?.content ?? "").trim();

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
