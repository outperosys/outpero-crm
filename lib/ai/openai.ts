import OpenAI from "openai"

const globalForOpenAI = globalThis as unknown as { openai?: OpenAI }

// Lazily instantiated so that build-time page data collection (which has no
// access to runtime env vars) doesn't crash on missing OPENAI_API_KEY.
export function getOpenAI(): OpenAI {
  if (!globalForOpenAI.openai) {
    globalForOpenAI.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return globalForOpenAI.openai
}

export const AI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
