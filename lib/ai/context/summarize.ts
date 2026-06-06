import { openai, AI_MODEL } from "@/lib/ai/openai"

// Only call AI summarization when notes exceed this count.
// Below the gate: format notes directly (cheaper + faster).
const SUMMARIZE_GATE = 4

export async function summarizeNotes(notes: string[]): Promise<string> {
  if (notes.length === 0) return "No notes recorded."

  if (notes.length <= SUMMARIZE_GATE) {
    return notes
      .map((n, i) => `Note ${i + 1}: ${n.slice(0, 500)}`)
      .join("\n\n")
  }

  // Truncate individual notes before summarizing to stay within token budget
  const truncated = notes
    .map((n) => n.slice(0, 400))
    .join("\n\n---\n\n")

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are summarizing internal CRM notes about a sales lead for use in AI proposal generation. Extract the most operationally useful insights: pain points, priorities, objections, stated needs, and key context. Be concise — maximum 180 words. Output plain text only, no headers or bullets.",
        },
        {
          role: "user",
          content: `Summarize these ${notes.length} CRM notes into a coherent paragraph of key insights:\n\n${truncated}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 280,
    })
    return (
      completion.choices[0]?.message?.content?.trim() ??
      notes.slice(0, 4).map((n, i) => `Note ${i + 1}: ${n.slice(0, 300)}`).join("\n\n")
    )
  } catch {
    // Fallback: return first 4 notes truncated — don't fail generation over summarization
    return notes
      .slice(0, 4)
      .map((n, i) => `Note ${i + 1}: ${n.slice(0, 300)}`)
      .join("\n\n")
  }
}
