import type { BusinessContext } from "@/lib/ai/types"

// ─── Lead context shape ───────────────────────────────────────────────────────

export interface LeadProposalContext {
  name: string
  company: string | null
  industry: string | null
  serviceInterested: string | null
  currentProblem: string | null
  currentTools: string | null
  teamSize: string | null
}

// ─── Section-level default instructions ──────────────────────────────────────
// Used when a section has no per-section aiInstructions set.

const SECTION_DEFAULTS: Partial<Record<string, string>> = {
  EXECUTIVE_SUMMARY:
    "Write a 2-3 paragraph executive summary. Open with the client's name/company and their specific problem. Close with the outcome we deliver. No generic openers like 'We are pleased to present'.",

  PROBLEM_STATEMENT:
    "Write 1-2 paragraphs describing the specific operational challenge this company faces. Show that we understood their situation — be concrete. Do not restate their words verbatim.",

  PROPOSED_SOLUTION:
    "Write 1-2 paragraphs describing our approach. Be specific about the automation or AI method. Tie the approach directly back to their problem. Avoid vague phrases like 'leveraging AI'.",

  SCOPE_OF_WORK:
    "Write a bullet list of 4-6 deliverables. Each should be a specific, concrete deliverable — not a category. Start each with an action verb: Build, Configure, Integrate, Train, Deploy, Document. No sub-bullets.",

  TIMELINE:
    "Write a timeline in 3-4 bullet points or short paragraphs. Cover: discovery/setup, build, testing, handoff. Keep it realistic for a small agency. Do not include specific dates.",

  NEXT_STEPS:
    "Write 3-4 bullet points covering: review proposal → approve and sign → kick-off call → deposit. Direct and action-oriented. End with one sentence inviting questions.",

  CUSTOM:
    "Write a concise, professional section (1-2 paragraphs) relevant to the lead context and any instructions provided.",
}

const DEFAULT_SECTION_INSTRUCTION =
  "Write a concise, professional section (1-2 paragraphs) specific to this lead. Avoid generic filler."

// ─── System prompts ───────────────────────────────────────────────────────────

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
- Avoid these phrases entirely: "cutting-edge", "innovative solutions", "leverage synergies", "transform your business", "game-changing", "robust", "seamlessly", "state-of-the-art", "in today's fast-paced world"
- Do not start with "Certainly!", "Of course!", "Here is...", or similar AI preambles.
- Output only the section body. No headings. No titles. No explanatory preambles.`
}

export function buildProposalRefinementSystemPrompt(business?: BusinessContext): string {
  const agencyName = business?.agencyName ?? "our agency"

  return `You are refining a proposal section draft on behalf of ${agencyName}, an AI automation agency.

Your role: take the provided draft content and personalize it to the specific lead's context. You are NOT rewriting — you are refining.

Refinement rules:
- Preserve the structure, length, and overall message of the draft.
- Replace generic references with specific ones from the lead context.
- Do not invent facts, pricing, or timelines not provided in the context.
- Do not change the tone or format of the draft — only make it more specific.
- Do not add new sections or headings.
- Output only the refined content. No preambles, no explanations.`
}

// ─── Per-section generation prompt (Mode A: full generation) ─────────────────

export function buildProposalSectionPrompt(
  sectionType: string,
  lead: LeadProposalContext,
  notes: string[],
  activities: string[],
  followUpTitles: string[],
  customInstructions?: string,
  aiInstructions?: string
): string {
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

  const followUpsBlock = followUpTitles.length > 0 ? followUpTitles.join(", ") : "None."

  // Per-section instruction: prefer aiInstructions, then customInstructions, then default
  const sectionInstruction =
    aiInstructions?.trim() ||
    customInstructions?.trim() ||
    SECTION_DEFAULTS[sectionType] ||
    DEFAULT_SECTION_INSTRUCTION

  return `LEAD CONTEXT:
${leadLines}

RECENT NOTES:
${notesBlock}

RECENT ACTIVITIES:
${activitiesBlock}

PENDING FOLLOW-UPS: ${followUpsBlock}

TASK:
${sectionInstruction}

Output only the section content. Start writing immediately.`
}

// ─── Per-section refinement prompt (Mode B: AI refines templateText) ─────────

export function buildProposalRefinementPrompt(
  templateText: string,
  lead: LeadProposalContext,
  notes: string[],
  activities: string[],
  aiInstructions?: string
): string {
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

  const refinementInstructions =
    aiInstructions?.trim() ||
    "Personalize this to the lead. Keep the same structure. Replace generic references with specific ones from the lead context."

  return `DRAFT CONTENT:
${templateText}

LEAD CONTEXT:
${leadLines}

RECENT NOTES:
${notesBlock}

RECENT ACTIVITIES:
${activitiesBlock}

REFINEMENT INSTRUCTIONS:
${refinementInstructions}

Refine the draft above to be specific to this lead. Preserve the structure and approximate length. Output only the refined content.`
}
