// Shared writing rules imported by all AI prompt builders.
// Keep this as the single source of truth for tone, quality, and formatting.

// ─── Quality rules (injected into every system prompt) ───────────────────────

export const QUALITY_RULES = `Writing quality rules — follow these strictly:
- Write in first person plural: "we", "our team", "our approach"
- Be concise. No paragraph should exceed 4 sentences.
- Sound like an experienced operator writing directly to a client — not a marketing robot.
- Use specific details from the lead context whenever available. Never write generic placeholder content.
- Avoid these phrases entirely: "cutting-edge", "innovative solutions", "leverage synergies", "transform your business", "game-changing", "robust", "seamlessly", "state-of-the-art", "in today's fast-paced world", "streamline", "empower", "unlock potential", "value-add", "holistic approach"
- Do not start with "Certainly!", "Of course!", "Here is...", "Great!", or any AI acknowledgement preamble.
- Output only the requested content. No headings, no titles, no explanatory notes.
- If you don't have specific context for a detail, write around it naturally — don't use placeholders like "[Company Name]".`

export const REFINEMENT_RULES = `Refinement rules — follow these strictly:
- Preserve the structure, approximate length, and overall message of the draft.
- Replace generic references with specific ones from the lead context.
- Do not invent facts, pricing, timelines, or details not provided.
- Do not change the tone or format of the draft — only make it more contextual.
- Do not add new sections, headings, or content categories.
- Output only the refined content. No preambles, no explanations.`

// ─── Configurable AI behavior ─────────────────────────────────────────────────

export type AIVerbosity = "concise" | "standard" | "detailed"
export type AIToneConfig = "professional" | "conversational" | "assertive"
export type AIFocus = "roi" | "technical" | "operational"
export type AIAudience = "executive" | "operational"

export interface AIConfig {
  verbosity?: AIVerbosity
  tone?: AIToneConfig
  focus?: AIFocus
  audience?: AIAudience
}

export function verbosityInstruction(v: AIVerbosity = "standard"): string {
  const map: Record<AIVerbosity, string> = {
    concise:  "Length: very concise — 1–2 short paragraphs or 3–4 tight bullets max. Cut any padding.",
    standard: "Length: standard — 2–3 paragraphs or 4–6 bullets. Cover the key points without padding.",
    detailed: "Length: detailed — 3–4 paragraphs. Include specifics, rationale, and clear outcomes.",
  }
  return map[v]
}

export function toneInstruction(t: AIToneConfig = "professional"): string {
  const map: Record<AIToneConfig, string> = {
    professional:  "Tone: professional and polished. Clear, structured, expert. No slang.",
    conversational:"Tone: conversational and direct. Plain language, like talking to a colleague. OK to use contractions.",
    assertive:     "Tone: confident and assertive. State points directly. No hedging language or qualifiers.",
  }
  return map[t]
}

export function focusInstruction(f: AIFocus = "operational"): string {
  const map: Record<AIFocus, string> = {
    roi:         "Emphasis: ROI, cost savings, time saved, and measurable business outcomes.",
    technical:   "Emphasis: technical implementation details, integration points, and system architecture.",
    operational: "Emphasis: operational efficiency, workflow improvement, and day-to-day practical impact.",
  }
  return map[f]
}
