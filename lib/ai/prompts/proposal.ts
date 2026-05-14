import type { BusinessContext } from "@/lib/ai/types"

// ─── Lead context shape for proposal generation ───────────────────────────────

export interface LeadProposalContext {
  name: string
  company: string | null
  industry: string | null
  serviceInterested: string | null
  currentProblem: string | null
  currentTools: string | null
  teamSize: string | null
}

// ─── Section-specific instructions ───────────────────────────────────────────

const SECTION_INSTRUCTIONS: Partial<Record<string, string>> = {
  EXECUTIVE_SUMMARY:
    "Write a 2-3 paragraph executive summary. Briefly describe the client, the problem they face, and how we intend to help. Be specific to their context — not generic. Do not start with 'We are pleased to...' or similar clichés.",

  PROBLEM_STATEMENT:
    "Write a concise problem statement (1-2 paragraphs). Describe the specific operational challenge this company faces based on what we know. Show that we understood their situation — don't repeat back their words verbatim.",

  PROPOSED_SOLUTION:
    "Write a proposed solution section (1-2 paragraphs). Describe our approach and what we will build or automate. Be concrete about the method — not vague about 'leveraging AI'. Reference their industry or specific problem where possible.",

  SCOPE_OF_WORK:
    "Write a scope of work as a bullet list of 4-6 deliverables. Each item should be a clear, specific deliverable — not a category. Start each item with an action verb (Build, Configure, Integrate, Train, Deploy, Document). No sub-bullets.",

  TIMELINE:
    "Write a brief timeline overview in 2-3 short paragraphs or 3-4 bullet points. Describe phases: discovery/setup, build, testing, handoff. Keep it realistic for a small agency. Do not include specific dates.",

  NEXT_STEPS:
    "Write a next steps section as 3-4 bullet points. Cover: review proposal → approve and sign → kick-off call → deposit. Keep it direct and action-oriented. End with one sentence inviting questions.",

  CUSTOM:
    "Write a concise, professional section relevant to the lead context and any custom instructions provided. 1-2 paragraphs.",
}

const DEFAULT_SECTION_INSTRUCTION =
  "Write a concise, professional section (1-2 paragraphs) relevant to the lead context. Be specific, not generic."

// ─── System prompt ────────────────────────────────────────────────────────────

/**
 * Builds the system prompt for proposal generation.
 * Accepts optional BusinessContext — injectable when Settings are built.
 * If not provided, falls back to sensible defaults.
 */
export function buildProposalSystemPrompt(business?: BusinessContext): string {
  const agencyName = business?.agencyName ?? "our agency"
  const services =
    business?.services?.join(", ") ??
    "AI automation, workflow automation, and process optimization"
  const brandTone = business?.brandTone ?? "professional, direct, and results-focused"

  return `You are writing a professional business proposal on behalf of ${agencyName}, an AI automation agency specializing in ${services}.

Tone: ${brandTone}

Writing rules — follow these strictly:
- Write in first person plural: "we", "our team", "our approach"
- Be concise. No paragraph should exceed 4 sentences.
- Sound like an experienced agency, not a marketing robot.
- Use specific details from the lead context whenever available.
- Avoid these phrases entirely: "cutting-edge", "innovative solutions", "leverage synergies", "transform your business", "game-changing", "robust", "seamlessly", "state-of-the-art", "in today's fast-paced world", "at the end of the day"
- Do not start sections with "Certainly!", "Of course!", "Here is...", or similar AI preambles.
- Write content that a human could edit and send — not polished marketing copy.
- Output only the section body. No headings. No titles. No explanatory preambles.`
}

// ─── Per-section user prompt ──────────────────────────────────────────────────

/**
 * Builds the user prompt for a single AI-generated proposal section.
 * Each section gets its own focused prompt — no giant batched prompts.
 */
export function buildProposalSectionPrompt(
  sectionType: string,
  lead: LeadProposalContext,
  notes: string[],
  activities: string[],
  followUpTitles: string[],
  customInstructions?: string
): string {
  // Build lead context block — omit null/empty fields
  const leadLines = [
    `Company: ${lead.company ?? "not provided"}`,
    `Industry: ${lead.industry ?? "not provided"}`,
    `Service needed: ${lead.serviceInterested ?? "not provided"}`,
    `Current problem: ${lead.currentProblem ?? "not provided"}`,
    `Current tools: ${lead.currentTools ?? "not provided"}`,
    `Team size: ${lead.teamSize ?? "not provided"}`,
  ].join("\n")

  const notesBlock =
    notes.length > 0
      ? notes.slice(0, 5).map((n) => `- ${n}`).join("\n")
      : "No notes recorded."

  const activitiesBlock =
    activities.length > 0
      ? activities.slice(0, 5).map((a) => `- ${a}`).join("\n")
      : "No recent activities."

  const followUpsBlock =
    followUpTitles.length > 0
      ? followUpTitles.join(", ")
      : "None."

  const customBlock = customInstructions?.trim()
    ? `\nCUSTOM INSTRUCTIONS (prioritize these):\n${customInstructions.trim()}\n`
    : ""

  const instruction =
    SECTION_INSTRUCTIONS[sectionType] ?? DEFAULT_SECTION_INSTRUCTION

  return `LEAD CONTEXT:
${leadLines}

RECENT NOTES:
${notesBlock}

RECENT ACTIVITIES:
${activitiesBlock}

PENDING FOLLOW-UPS: ${followUpsBlock}
${customBlock}
TASK:
${instruction}

Output only the section content. No headings. No "Here is..." preamble. Start writing immediately.`
}
