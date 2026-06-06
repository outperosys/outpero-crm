import { openai, AI_MODEL } from "@/lib/ai/openai"

const MAX_RAW_CHARS = 6000

export interface TranscriptInsights {
  painPoints: string[]
  goals: string[]
  objections: string[]
  desiredOutcomes: string[]
  technicalRequirements: string[]
  urgencySignals: string[]
  decisionMakerInfo: string
  communicationTone: string
  businessPriorities: string[]
  keyQuotes: string[]
}

export function trimTranscript(raw: string): string {
  return raw.length > MAX_RAW_CHARS
    ? raw.slice(0, MAX_RAW_CHARS) + "\n[transcript trimmed at 6000 chars]"
    : raw
}

export async function processTranscript(raw: string): Promise<TranscriptInsights> {
  const trimmed = trimTranscript(raw)

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a sales intelligence analyst extracting structured insights from meeting transcripts and call notes.

Extract ONLY concrete, specific facts that were explicitly stated — do not interpret, generalize, or infer beyond what was said.

Quality rules for extraction:
- Pain points must name a specific process, tool, or frequency. NOT "manual processes" — YES "manually copying 300 orders per day from Shopify to Tally"
- Goals must be specific outcomes. NOT "improve efficiency" — YES "zero manual order entry before Diwali season"
- Objections must be actual concerns raised. NOT "general hesitation" — YES "worried about silent failures and incorrect data entry"
- Key quotes must be verbatim or near-verbatim from the transcript. Short, high-signal sentences only.
- If a field has no relevant content, return an empty array or the string "not mentioned"
- Do not fabricate or embellish. If it was not said, it does not exist.

Output valid JSON only. No markdown, no explanation.`,
      },
      {
        role: "user",
        content: `Extract structured sales insights from this transcript or call notes:

${trimmed}

Respond with this exact JSON structure:
{
  "painPoints": ["specific process or problem stated, with frequency/scale if mentioned"],
  "goals": ["specific outcome the client wants"],
  "objections": ["actual concerns or hesitations raised"],
  "desiredOutcomes": ["what success looks like to them, in their words"],
  "technicalRequirements": ["specific tools, systems, or integrations mentioned"],
  "urgencySignals": ["reasons they need this soon — deadlines, events, costs"],
  "decisionMakerInfo": "who makes the final decision and what they care about",
  "communicationTone": "how the prospect communicates — formal/casual, detail-oriented/big-picture",
  "businessPriorities": ["what matters most to this business right now"],
  "keyQuotes": ["short direct quote that captures their core need or concern"]
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 1000,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error("No response from AI transcript processor")

  return JSON.parse(content) as TranscriptInsights
}

// Formats insights into a compact block for prompt injection.
// Filters out empty arrays, "not mentioned", and single-word entries.
// Orders by signal value: most actionable context first.
export function formatTranscriptInsights(insights: TranscriptInsights): string {
  const lines: string[] = []

  const addList = (label: string, items: string[]) => {
    const filtered = items.filter((s) => s.trim().length > 10) // drop trivial entries
    if (filtered.length > 0) {
      lines.push(`${label}: ${filtered.join("; ")}`)
    }
  }

  const addStr = (label: string, value: string) => {
    if (value && value !== "not mentioned" && value.trim().length > 5) {
      lines.push(`${label}: ${value}`)
    }
  }

  // High-signal fields first
  addList("Pain points", insights.painPoints)
  addList("Goals", insights.goals)
  addList("Desired outcomes", insights.desiredOutcomes)
  addList("Urgency signals", insights.urgencySignals)
  addList("Objections", insights.objections)
  addList("Technical requirements", insights.technicalRequirements)
  addList("Business priorities", insights.businessPriorities)
  addStr("Decision maker", insights.decisionMakerInfo)
  addStr("Communication tone", insights.communicationTone)

  // Key quotes last — most specific but longest
  const goodQuotes = insights.keyQuotes.filter((q) => q.trim().length > 15)
  if (goodQuotes.length > 0) {
    lines.push(`Key quotes: ${goodQuotes.map((q) => `"${q}"`).join("; ")}`)
  }

  return lines.join("\n")
}
