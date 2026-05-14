import type {
  LeadAIContext,
  ActivityAIContext,
  FollowUpGenerationOptions,
  BusinessContext,
} from "../types"

// ─── Stage/enum labels ────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead",
  QUALIFIED: "Qualified",
  DISCOVERY_CALL: "Discovery Call",
  PROPOSAL_SENT: "Proposal Sent",
  FOLLOW_UP: "Follow-up",
  WON: "Won",
  LOST: "Lost",
}

// ─── Guideline maps ───────────────────────────────────────────────────────────

const CHANNEL_GUIDELINES: Record<string, string> = {
  whatsapp:
    "Format for WhatsApp: short paragraphs, natural line breaks, no formal subject line, no signatures like 'Sincerely' or 'Best regards'. Start with a casual greeting like 'Hey {name},' or jump right in. No markdown formatting — WhatsApp renders plain text only.",
  email:
    "Format for Email: the very first line must be 'Subject: ...' followed by a blank line, then the email body. Use a proper greeting and closing signature. Professional but warm structure.",
}

const LENGTH_GUIDELINES: Record<string, string> = {
  short: "Keep it very short: 1–2 short paragraphs, under 80 words total. Get to the point fast.",
  medium:
    "Medium length: 2–3 paragraphs, 80–180 words. Clear message with brief context and one call to action.",
  detailed:
    "Detailed: 3–4 paragraphs, 180–350 words. Include full context, address potential objections, and end with clear next steps.",
}

const TONE_GUIDELINES: Record<string, string> = {
  professional:
    "Professional and polished. Clear, structured, and respectful. No slang.",
  friendly:
    "Warm and friendly — like you already know them. Natural language, approachable. OK to be slightly informal.",
  assertive:
    "Confident and assertive. State the purpose early. No hedging or apologetic language. Clear expectations.",
}

const STYLE_GUIDELINES: Record<string, string> = {
  soft:
    "Empathetic and non-pushy. Check in genuinely. Offer help without pressure. Low urgency.",
  direct:
    "Direct and action-oriented. State the purpose in the first sentence. Clear call to action at the end.",
  urgent:
    "Create appropriate urgency where genuine. Highlight time-sensitivity, limited slots, or an expiring opportunity. Do not fabricate urgency — only use what's contextually justified.",
}

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildFollowUpSystemPrompt(business?: BusinessContext): string {
  const agencyName = business?.agencyName ?? "Outpero"
  const services = business?.services?.join(", ") ?? "AI automation, workflow automation, process automation"
  const brandTone = business?.brandTone ?? "professional, expert, results-focused"
  const customInstructions = business?.customInstructions ?? ""

  return `You are an AI communication assistant for ${agencyName}, an AI automation agency that helps businesses automate their workflows and processes.

Agency services: ${services}
Brand tone: ${brandTone}${customInstructions ? `\nAdditional instructions: ${customInstructions}` : ""}

Your role is to generate effective, contextual follow-up message drafts for the sales team.

Core rules:
- Generate drafts only. Messages are ALWAYS reviewed and sent manually by a human — never auto-sent.
- Personalize using the lead's actual context. Do NOT be generic.
- Never fabricate facts, promises, or information not provided in the lead context.
- Keep messages human and genuine — not robotic or obviously template-generated.
- Match the specified tone, length, channel format, and style exactly.
- Always respond with valid JSON only. No markdown outside of the JSON.`
}

// ─── User prompt ──────────────────────────────────────────────────────────────

export function buildFollowUpUserPrompt(
  lead: LeadAIContext,
  activities: ActivityAIContext[],
  options: FollowUpGenerationOptions,
  followUpTitle?: string
): string {
  const count = options.count ?? 3

  const activityLines =
    activities.length > 0
      ? activities
          .slice(0, 5)
          .map((a) => {
            const date = new Date(a.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
            return `- [${a.type.replace("_", " ")}] ${a.description} (${date})`
          })
          .join("\n")
      : "No recent activity recorded."

  const leadLines = [
    `Name: ${lead.name}`,
    lead.companyName ? `Company: ${lead.companyName}` : null,
    lead.serviceInterested ? `Service Interested: ${lead.serviceInterested}` : null,
    lead.industry ? `Industry: ${lead.industry}` : null,
    `Pipeline Stage: ${STAGE_LABELS[lead.pipelineStage] ?? lead.pipelineStage}`,
    `Priority: ${lead.priority} | Urgency: ${lead.urgency}`,
    `Proposal Sent: ${lead.proposalSent ? "Yes" : "No"}`,
    lead.dealValue ? `Deal Value: $${lead.dealValue.toLocaleString()}` : null,
    lead.lastContacted
      ? `Last Contacted: ${lead.lastContacted.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`
      : "Last Contacted: Never",
    lead.currentProblem ? `Current Problem: ${lead.currentProblem}` : null,
    lead.notes ? `Internal Notes: ${lead.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  const intentLine = options.customIntent
    ? `\nCUSTOM INTENT:\n${options.customIntent}\n`
    : ""

  const followUpLine = followUpTitle
    ? `\nFOLLOW-UP CONTEXT:\nThis follow-up is titled: "${followUpTitle}"\n`
    : ""

  return `Generate ${count} follow-up message variations for the lead below.

LEAD CONTEXT:
${leadLines}

RECENT ACTIVITY:
${activityLines}
${followUpLine}${intentLine}
SETTINGS:
- Channel: ${options.channel === "whatsapp" ? "WhatsApp" : "Email"}
- Tone: ${options.tone}
- Length: ${options.length}
- Style: ${options.style}

GUIDELINES:
${CHANNEL_GUIDELINES[options.channel]}
${TONE_GUIDELINES[options.tone]}
${LENGTH_GUIDELINES[options.length]}
${STYLE_GUIDELINES[options.style]}

OUTPUT FORMAT — respond with this exact JSON structure:
{
  "variations": [
    { "label": "Variation 1", "message": "..." },
    { "label": "Variation 2", "message": "..." },
    { "label": "Variation 3", "message": "..." }
  ]
}

Generate exactly ${count} variations. Each must be meaningfully different — vary the opening, emphasis, and call to action. Do not repeat the same phrasing across variations.`
}
