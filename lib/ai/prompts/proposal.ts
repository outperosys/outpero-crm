import type { BusinessContext } from "@/lib/ai/types"
import { QUALITY_RULES, REFINEMENT_RULES } from "./standards"
import { buildIndustryFraming, buildServiceFraming } from "./framing"
import type { LeadFullContext } from "@/lib/ai/context/lead"

// ─── Section-level scaffolded instructions ────────────────────────────────────
// Each instruction specifies: paragraph structure, first-sentence rule,
// vocabulary constraints, word target, and format. The AI fills the scaffold —
// it does not invent the structure.

const SECTION_DEFAULTS: Partial<Record<string, string>> = {

  EXECUTIVE_SUMMARY: `Write exactly 3 short paragraphs. No bullet points.

Paragraph 1 (1–2 sentences): Open with the client's company name and their specific operational problem. Use a number or concrete detail from context if available. Do NOT start with "We", "Our", "I", "Thank you", or "We are pleased." Start with the client: "[Company] currently..." or "Right now, [Company]'s team..."

Paragraph 2 (2 sentences): What we are building and why it solves the problem. Name the specific automation, integration, or workflow — not "an AI solution" or "a comprehensive system."

Paragraph 3 (1 sentence): The primary outcome — what the client gains. Time saved, errors eliminated, cost reduced, or risk removed. Be specific if the context supports it.

Target: 90–110 words total. If you exceed 110 words, cut from paragraph 2.`,

  PROBLEM_STATEMENT: `Write exactly 2 focused paragraphs. No bullet points.

Paragraph 1 (2–3 sentences): The specific operational challenge. Name the process, the frequency, and the tool or team involved. Use numbers where available ("300 orders per day", "two hours every morning"). Do NOT open with "Many businesses", "In today's", "As companies grow", or any generic framing. Start with this company's situation.

Paragraph 2 (2 sentences): The consequence of the problem. What does it cost — time, money, accuracy, customer trust, or opportunity? End with one sentence on what stays broken if it is not addressed.

Target: 85–110 words total. Be concrete. If you do not have specific numbers, describe the process clearly instead.`,

  PROPOSED_SOLUTION: `Write exactly 3 short paragraphs. No bullet points.

Paragraph 1 (1 sentence): State what we are building. Name the specific automation or integration. Example: "We will build an automated order sync between Shopify and Tally, triggered on every new order." Do not say "leverage AI" or "implement a solution."

Paragraph 2 (2 sentences): How it works at a functional level. What triggers it, what data moves where, what the output is. No implementation jargon — describe it as a user would experience it.

Paragraph 3 (1–2 sentences): What this means for the team day-to-day. What do they no longer have to do? What does their morning look like after?

Target: 90–120 words total.`,

  SCOPE_OF_WORK: `Write exactly 5–6 bullet points. Each bullet is one specific, concrete deliverable.

Format per bullet: [Action verb] [specific thing] [brief qualifier if needed]

Required opening verbs — choose from: Build, Configure, Integrate, Set up, Deploy, Connect, Automate, Test, Document, Train.

GOOD bullet examples:
- Build automated order sync between Shopify and Tally triggered on order confirmation
- Set up real-time inventory level updates across all active sales channels
- Configure error alert system to notify the operations team on any sync failure
- Deploy WhatsApp message flow for lead enquiry handling and qualification
- Document system logic and provide team walkthrough before go-live

BAD bullets — do NOT write like these:
- AI integration (too vague — what specifically?)
- Testing and QA (not a deliverable — it's a phase)
- Ongoing support (not in scope for initial project)
- Implement automation solutions (meaningless)

No sub-bullets. No categories. No explanation text after the bullet. Just the deliverable.`,

  TIMELINE: `Write exactly 4 phases. Use this exact format for each phase:

[Phase Name] ([duration])
[One sentence: what happens in this phase.]

Use these phase names and realistic durations:
1. Discovery & Setup (3–5 days) — requirements confirmation, system access, environment setup
2. Development & Integration (1–3 weeks) — main build, API connections, automation logic
3. Testing & QA (5–7 days) — parallel run, edge case handling, sign-off
4. Handoff & Training (2–3 days) — documentation, team walkthrough, go-live

Adjust durations based on complexity signals in the context (more integrations = longer development, larger team = more training time). Do not use calendar dates. Do not combine phases.`,

  NEXT_STEPS: `Write exactly 4 numbered bullet points followed by one closing sentence.

Bullet format: plain, direct, under 15 words each. No explanations.

Use this exact sequence:
1. Review this proposal and flag any questions or adjustments
2. Sign the project agreement — we'll send a simple one-pager
3. Kick-off call (30 min) to align on requirements and access
4. Initial deposit to begin — project starts within 48 hours

Closing sentence (plain prose, not a bullet): "Reply to this email or book a call — we're happy to walk through anything before you decide."

Do not add more bullets. Do not add padding or reassurances.`,

  ABOUT_US: `Write exactly 2 short paragraphs. No bullet points.

Paragraph 1 (2 sentences): Who we are and what we specifically do. Name the type of automation work. Do NOT use: "passionate about", "dedicated to", "we believe in", or "on a mission to."

Paragraph 2 (1–2 sentences): How we work — small team, direct communication, or a concrete differentiator. End with one fact that builds credibility (e.g., number of clients, a specific type of project, or our working model).

Target: 60–80 words.`,

  TERMS: `Write 5 short bullet points covering standard engagement terms. Plain language only — no legal jargon.

Cover these five areas, one bullet each:
- Payment: deposit structure and payment schedule
- Scope: what's included and how scope changes are handled
- Revisions: how many revision rounds are included
- Data & access: how we handle client system credentials and data
- Timeline: what affects the timeline and client responsibilities

Each bullet should be 1–2 sentences. Direct and clear.`,

  CUSTOM: `Write 1–2 focused paragraphs specific to the lead context and any instructions provided.
Target: 80–100 words. Be concrete. No generic filler. Start with something specific to this client.`,
}

const DEFAULT_SECTION_INSTRUCTION =
  "Write 1–2 concise paragraphs specific to this lead. Use the context provided. Avoid generic filler. Target: 80–100 words."

// ─── System prompts ───────────────────────────────────────────────────────────

export function buildProposalSystemPrompt(business?: BusinessContext): string {
  const agencyName = business?.agencyName ?? "our agency"
  const services =
    business?.services?.join(", ") ??
    "AI automation, workflow automation, and process optimization"
  const brandTone = business?.brandTone ?? "professional, direct, and results-focused"

  return `You are writing a professional business proposal on behalf of ${agencyName}, an AI automation agency specializing in ${services}.

Tone: ${brandTone}

${QUALITY_RULES}`
}

export function buildProposalRefinementSystemPrompt(business?: BusinessContext): string {
  const agencyName = business?.agencyName ?? "our agency"

  return `You are refining a proposal section draft on behalf of ${agencyName}, an AI automation agency.

Your role: personalize the provided draft to the specific lead's context. You are refining — not rewriting.

${REFINEMENT_RULES}`
}

// ─── Context block builder ────────────────────────────────────────────────────
// Assembles LeadFullContext into a prompt-ready string.
// Ordered by signal strength: transcript > client identity > engagement signals
// > industry/service framing > notes > activities > follow-ups.

function buildLeadContextBlock(ctx: LeadFullContext): string {
  const sections: string[] = []

  // Transcript — highest specificity, shown first
  if (ctx.transcriptBlock) {
    sections.push(`DISCOVERY CALL INSIGHTS:\n${ctx.transcriptBlock}`)
  }

  // Core client identity
  const clientLines = [
    `Company: ${ctx.company ?? "not specified"}`,
    ctx.industry          ? `Industry: ${ctx.industry}` : null,
    ctx.serviceInterested ? `Service requested: ${ctx.serviceInterested}` : null,
    ctx.currentProblem    ? `Current problem: ${ctx.currentProblem}` : null,
    ctx.currentTools      ? `Current tools/stack: ${ctx.currentTools}` : null,
    ctx.teamSize          ? `Team size: ${ctx.teamSize}` : null,
  ].filter(Boolean).join("\n")
  sections.push(`CLIENT:\n${clientLines}`)

  // Engagement signals — urgency, pipeline position, deal size
  const signalLines = [
    `Urgency: ${ctx.urgency}  |  Priority: ${ctx.priority}`,
    `Pipeline stage: ${ctx.pipelineStage}`,
    ctx.dealValue ? `Deal value: $${ctx.dealValue.toLocaleString()}` : null,
    ctx.source    ? `Lead source: ${ctx.source}` : null,
  ].filter(Boolean).join("\n")
  sections.push(`ENGAGEMENT SIGNALS:\n${signalLines}`)

  // Industry + service framing (injected only when detected)
  const industryFraming = buildIndustryFraming(ctx.industry)
  const serviceFraming  = buildServiceFraming(ctx.serviceInterested)
  const framingLines = [industryFraming, serviceFraming].filter(Boolean)
  if (framingLines.length > 0) {
    sections.push(framingLines.join("\n\n"))
  }

  // Notes
  const notesLabel = ctx.notesSummarized ? "NOTES (AI-summarized from multiple entries)" : "INTERNAL NOTES"
  sections.push(`${notesLabel}:\n${ctx.notesContext}`)

  // Activities
  const activitiesContent =
    ctx.activityLines.length > 0
      ? ctx.activityLines.map((l) => `- ${l}`).join("\n")
      : "No recent activity recorded."
  sections.push(`RECENT ACTIVITY:\n${activitiesContent}`)

  // Follow-ups
  const followUpContent =
    ctx.followUpTitles.length > 0 ? ctx.followUpTitles.join(", ") : "None."
  sections.push(`PENDING FOLLOW-UPS: ${followUpContent}`)

  return sections.join("\n\n")
}

// ─── Per-section generation prompt (Mode A: full generation) ─────────────────

export function buildProposalSectionPrompt(
  sectionType: string,
  ctx: LeadFullContext,
  customInstructions?: string,
  aiInstructions?: string
): string {
  // Priority: per-section aiInstructions > user's custom instructions > section scaffold
  const sectionInstruction =
    aiInstructions?.trim() ||
    customInstructions?.trim() ||
    SECTION_DEFAULTS[sectionType] ||
    DEFAULT_SECTION_INSTRUCTION

  return `${buildLeadContextBlock(ctx)}

TASK:
${sectionInstruction}

Output only the section content. Start writing immediately.`
}

// ─── Per-section refinement prompt (Mode B: AI refines templateText) ─────────

export function buildProposalRefinementPrompt(
  templateText: string,
  ctx: LeadFullContext,
  aiInstructions?: string
): string {
  const refinementInstructions =
    aiInstructions?.trim() ||
    "Personalize this draft to the lead. Keep the same structure and approximate length. Replace any generic references with specific details from the context."

  return `DRAFT CONTENT:
${templateText}

${buildLeadContextBlock(ctx)}

REFINEMENT INSTRUCTIONS:
${refinementInstructions}

Refine the draft above to be specific to this lead. Preserve the structure and approximate length. Output only the refined content.`
}
