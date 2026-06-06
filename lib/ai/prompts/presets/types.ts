// ─── Prompt Playground Architecture ──────────────────────────────────────────
// Types only. No presets implemented yet.
//
// When the prompt playground is built, this layer enables:
// - versioned prompt variants (compare v1 vs v2 on the same lead)
// - A/B testing between presets (stored in ProposalSection.metadata)
// - section-level overrides without touching the main system prompt
// - rollback to a previous prompt version when quality regresses
//
// Usage flow (future):
//   1. Author creates a PromptPreset with sectionOverrides
//   2. generateProposal accepts an optional presetId
//   3. buildProposalSectionPrompt checks presetId → uses override if present
//   4. Generated ProposalSection stores { presetId, presetVersion } in metadata
//   5. Evaluation UI compares outputs across presets on identical leads

import type { ProposalSectionType } from "@prisma/client"

// ─── Preset definition ────────────────────────────────────────────────────────

export interface PromptPreset {
  id: string
  name: string
  version: number
  description?: string

  // Override the global system prompt for this preset (optional)
  systemPromptOverride?: string

  // Per-section instruction overrides — keyed by ProposalSectionType
  // If a section type is not in this map, the default scaffold is used
  sectionOverrides: Partial<Record<ProposalSectionType, string>>

  // Temperature overrides per section (default: from actions/ai.ts)
  temperatureOverrides?: Partial<Record<ProposalSectionType, number>>

  // Max token overrides per section (default: from SECTION_MAX_TOKENS)
  tokenOverrides?: Partial<Record<ProposalSectionType, number>>

  createdAt: string // ISO date string
}

// ─── Evaluation rubric ────────────────────────────────────────────────────────
// Used to score generated proposal sections for quality regression testing.

export interface SectionEvaluationScore {
  proposalSectionId: string
  sectionType: ProposalSectionType
  presetId?: string

  // Each dimension scored 1–3
  specificity: 1 | 2 | 3    // 1 = generic, 3 = names client details
  fluffScore: 1 | 2 | 3     // 1 = contains banned phrases, 3 = none
  lengthFit: 1 | 2 | 3      // 1 = way off target, 3 = within 20% of target
  editability: 1 | 2 | 3    // 1 = needs full rewrite, 3 = send-ready in <5 min
  consistency: 1 | 2 | 3    // 1 = contradicts other sections, 3 = coherent

  total: number              // sum of above (max 15)
  notes?: string             // free text on what failed
  evaluatedAt: string        // ISO date string
}

// ─── Preset metadata stored in ProposalSection.metadata ──────────────────────
// Written at generation time so outputs can be traced back to the prompt
// version that produced them.

export interface SectionGenerationMeta {
  presetId?: string
  presetVersion?: number
  sectionType: string
  generatedAt: string
  modelUsed: string
  temperature: number
  maxTokens: number
  hadTranscript: boolean
  notesSummarized: boolean
  industryFramingApplied: boolean
  serviceFramingApplied: boolean
}
