@AGENTS.md

# Outpero CRM — Agent Context

Internal CRM for a 3-person AI automation agency (Outpero). Not enterprise software — lean, fast, minimal. Built for speed and operational efficiency.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-based config — no `tailwind.config.ts`) |
| UI | shadcn/ui with Radix Nova preset (`radix-ui` umbrella package) |
| Auth + Storage | Supabase SSR v0.10.3 |
| Database ORM | Prisma v5.22.0 |
| AI | OpenAI (`gpt-4o-mini` default, `openai` npm package v6) |
| Deployment | Vercel |

---

## Critical Next.js 16 Behavior

**`params` is a Promise.** Always `await params` before use:

```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params  // MUST await
}
```

Same applies to `searchParams` and `generateMetadata`. Do NOT destructure directly.

---

## Architecture Rules (hard constraints — enforced by user)

1. **Server Actions only** — no REST API routes. All mutations go through `actions/`.
2. **Server Components by default** — Client Components only for: forms, modals/dialogs, drag-drop, interactive state (useTransition, useState).
3. **Business logic in `/actions` only** — one file per domain (`leads.ts`, `notes.ts`, etc.).
4. **`lib/` is utilities + clients only** — no business logic. Supabase client, Prisma client, validators, AI utilities.
5. **No premature abstractions** — no service layers, no repositories, no wrappers around wrappers.
6. **No global state** — no Zustand, no Redux, no React Query. Local component state only.

---

## Authentication

- Supabase handles auth.
- `middleware.ts` guards all routes — unauthenticated users → `/login`, authenticated users on `/login` → `/dashboard`.
- Route groups: `(auth)` for login, `(crm)` for all protected pages.
- Server actions use `createClient()` from `lib/supabase/server.ts` and call `supabase.auth.getUser()` for auth check.
- Every action starts with `await requireAuth()` — throws if not authenticated.

---

## Database

**Supabase PostgreSQL via pgBouncer (connection pooler).**

Critical: `DATABASE_URL` uses port 6543 (pgBouncer transaction mode) with `?pgbouncer=true` to disable prepared statements. `DIRECT_URL` uses port 5432 for migrations.

```
DATABASE_URL=postgresql://...6543/postgres?pgbouncer=true   ← app queries
DIRECT_URL=postgresql://...5432/postgres                     ← migrations only
```

Both must stay in sync across `.env` and `.env.local`.

**Prisma singleton** (`lib/prisma.ts`):
```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

**After schema changes:** Stop dev server first (kills DLL lock on Windows), then:
```bash
npx prisma migrate deploy   ← use deploy (not migrate dev) to avoid interactive prompts
npx prisma generate
```

**Seed data:**
```bash
npx tsx prisma/seed.ts
```
Seeds: 4 follow-up templates + 4 proposal templates (Full Proposal, Quick Scope, Discovery Proposal, Config Showcase).

---

## Prisma Schema — Current State

```prisma
enum Role { ADMIN MEMBER }
enum PipelineStage { NEW_LEAD QUALIFIED DISCOVERY_CALL PROPOSAL_SENT FOLLOW_UP WON LOST }
enum Priority { LOW MEDIUM HIGH }
enum Urgency { LOW MEDIUM HIGH }
enum ActivityType { CALL MEETING EMAIL PROPOSAL_SENT FOLLOW_UP STATUS_CHANGE NOTE }
enum VisualStyle { CLEAN MODERN HIGHLIGHT MINIMAL HERO TWO_COLUMN }
enum LayoutType { FULL_WIDTH CENTERED TWO_COLUMN CARD }
enum ProposalSectionType { COVER EXECUTIVE_SUMMARY PROBLEM_STATEMENT PROPOSED_SOLUTION SCOPE_OF_WORK TIMELINE PRICING ABOUT_US TERMS NEXT_STEPS CUSTOM }
enum ProposalStatus { DRAFT REVIEW SENT ACCEPTED DECLINED }
enum TranscriptSource { MANUAL GOOGLE_MEET ZOOM }
enum ServiceStatus { ACTIVE DRAFT ARCHIVED }

model Profile          — id, userId, name, email, role, timestamps
model Lead             — full lead fields, relations: noteEntries, activities, tasks, followUps, proposals, meetingTranscripts
model Note             — id, leadId, content, createdBy, timestamps. Cascade on lead delete.
model Activity         — id, leadId, type (ActivityType), description, createdBy, createdAt. Cascade.
model Task             — id, leadId, title, dueDate, completed, completedAt, assignedTo, timestamps. Cascade.
model FollowUp         — id, leadId, title, notes, dueDate, completed, completedAt, assignedTo, templateId, createdBy, timestamps. Cascade.
model FollowUpTemplate — id, name (unique), title, notes, timestamps.
model MeetingTranscript — id, leadId, rawText?, insights (Json), source (TranscriptSource), processedAt, createdAt. Cascade on lead delete.
model ProposalTemplate         — id, name (unique), description, isDefault, timestamps. Has sections + proposals.
model ProposalTemplateSection  — id, templateId, type, title, templateText, aiInstructions?, order, isRequired, isAIGenerated, isAIRefinement, visualStyle (VisualStyle), layoutType (LayoutType), metadata (Json?), timestamps.
model Proposal                 — id, leadId, templateId?, title, status (ProposalStatus), validUntil?, totalValue?, createdBy?, sentAt?, timestamps. Cascade on lead delete.
model ProposalSection          — id, proposalId, type, title, content, order, isAIGenerated, isVisible, visualStyle (VisualStyle), layoutType (LayoutType), metadata (Json?), timestamps. Cascade on proposal delete.
model Invoice                  — id, invoiceNumber, leadId, proposalId?, type, status, issueDate, dueDate, client snapshot fields, totals, timestamps.
model InvoiceItem              — id, invoiceId, description, quantity, unitPrice, total. Cascade on invoice delete.
model Payment                  — id, invoiceId, amountReceived, paymentDate, paymentMode, transactionReference, utrNumber, notes. Cascade on invoice delete.
model Service                  — centralized service catalog: core info, pricing, delivery, sales, AI instructions, proposal defaults, invoice defaults, internal notes.
```

Full schema at: `prisma/schema.prisma`

---

## Folder Structure

```
app/
  layout.tsx
  page.tsx                      — redirects to /dashboard
  (auth)/login/page.tsx
  (crm)/
    layout.tsx                  — sidebar + topbar wrapper
    dashboard/page.tsx          — placeholder
    leads/
      page.tsx                  — leads table (search/filter/sort)
      loading.tsx
      [id]/
        page.tsx                — lead detail workspace (parallel fetch: lead, notes, activities, tasks, followUps, templates)
        loading.tsx
    follow-ups/
      page.tsx                  — dashboard: Overdue / Due Today / Upcoming / Completed
      loading.tsx
    services/
      page.tsx                  — reusable service catalog for proposals, invoices, AI, lead qualification
    proposals/
      page.tsx                  — proposals list with status badges
      new/page.tsx              — lead + template selector → triggers generateProposal action
      [id]/page.tsx             — proposal workspace editor (title, status, sections)
      [id]/loading.tsx
    templates/
      page.tsx                  — proposal templates grid
      [id]/page.tsx             — template editor (sections, reorder, AI flags, placeholders)
      [id]/loading.tsx
    pipeline/page.tsx           — placeholder
    invoices/
      page.tsx                  — invoices list with status badges
      new/page.tsx              — generate invoice form (manual or from proposal)
      [id]/page.tsx             — invoice workspace + export PDF + log payment
    clients/page.tsx            — placeholder
    tasks/page.tsx              — placeholder
    settings/page.tsx           — placeholder

actions/
  auth.ts               — login(prevState, formData), logout()
  leads.ts              — getLeads, getLead, createLead, updateLead, deleteLead
  notes.ts              — getNotes, createNote, updateNote, deleteNote
  activities.ts         — getActivities, createActivity, deleteActivity
  tasks.ts              — getTasks, createTask, toggleTask, deleteTask
  follow-ups.ts         — getFollowUps, getLeadFollowUps, createFollowUp, completeFollowUp, deleteFollowUp, getTemplates
  proposals.ts          — getProposals, getProposal, getProposalForWorkspace, getLeadProposals, updateProposalTitle, updateProposalStatus, updateProposalSection, reorderProposalSection, toggleProposalSectionVisibility, addProposalSection, deleteProposal
  proposal-templates.ts — getProposalTemplates, getProposalTemplate, createProposalTemplate, updateProposalTemplate, deleteProposalTemplate, addProposalTemplateSection, updateProposalTemplateSection, removeProposalTemplateSection, reorderProposalTemplateSection
  services.ts           — getServices, getActiveServices, getService, createService, updateService, deleteService
  ai.ts                 — generateFollowUpDrafts(leadId, options), generateProposal(leadId, templateId, options)
                          ProposalGenerationOptions: { customInstructions?, transcriptText? }

lib/
  prisma.ts
  utils.ts                      — cn(), formatDate(), formatCurrency()
  supabase/server.ts, client.ts
  validations/
    lead.ts, note.ts, activity.ts, task.ts, follow-up.ts
    service.ts                  — serviceSchema, SERVICE_STATUSES, SERVICE_CATEGORIES
    proposal-template.ts        — proposalTemplateSchema, proposalTemplateSectionSchema
  ai/
    types.ts                    — FollowUpTone/Length/Channel/Style, FollowUpGenerationOptions, FollowUpVariation, LeadAIContext, BusinessContext
    openai.ts                   — singleton OpenAI client + AI_MODEL constant
    placeholder.ts              — resolvePlaceholders(template, ctx), formatProposalDate(). Pure sync. Handles {{lead.name}} etc.
    context/                    — centralized AI context builders (receive pre-fetched DB data, shape it for prompts)
      index.ts                  — re-exports all builders and types
      lead.ts                   — buildLeadContext(lead, notes, activities, followUps, transcripts?) → LeadFullContext
                                   Async: calls summarizeNotes() when notes > 4. Caps activities at 8.
      service.ts                — buildServiceContext(service), buildServicesContext(services) for prompt-ready catalog context
      summarize.ts              — summarizeNotes(notes[]): calls AI only when notes.length > 4, falls back to first 4 raw
      transcript.ts             — processTranscript(raw): AI extraction → TranscriptInsights (10 fields)
                                   formatTranscriptInsights(insights): compact prompt-ready string, filters noise
                                   trimTranscript(raw): caps at 6000 chars before sending to AI
    prompts/
      standards.ts              — QUALITY_RULES, REFINEMENT_RULES, AIConfig type, verbosityInstruction(), toneInstruction(), focusInstruction()
      framing.ts                — buildIndustryFraming(industry), buildServiceFraming(service)
                                   Keyword regex detection → vocabulary + framing hints injected into section prompts
                                   7 industry patterns: e-commerce, healthcare, real estate, hospitality, agency, legal, manufacturing
                                   7 service patterns: inbound voice, outbound voice, WhatsApp, lead qual, CRM automation, full sales, workflow automation
      follow-up.ts              — buildFollowUpSystemPrompt(business?), buildFollowUpUserPrompt(lead, activities, options, followUpTitle?)
      proposal.ts               — buildProposalSystemPrompt(business?), buildProposalRefinementSystemPrompt(business?)
                                   buildProposalSectionPrompt(sectionType, ctx: LeadFullContext, customInstructions?, aiInstructions?)
                                   buildProposalRefinementPrompt(templateText, ctx: LeadFullContext, aiInstructions?)
                                   Internally calls buildIndustryFraming + buildServiceFraming from framing.ts
                                   Context block order: transcript → client identity → engagement signals → framing → notes → activities
      presets/
        types.ts                — PromptPreset, SectionEvaluationScore, SectionGenerationMeta (architecture only, no logic)
  proposal/
    types.ts                    — VisualStyleKey, LayoutTypeKey, SectionVisualConfig, AccentColorKey, etc.
    presets.ts                  — VISUAL_STYLE_CLASSES, LAYOUT_TYPE_CLASSES, VISUAL_STYLE_LABELS, LAYOUT_TYPE_LABELS, ACCENT_COLORS
    renderer.tsx                — SectionContent, SectionStyleWrapper, TextContent, CoverContent, PricingContent, TimelineContent, parsePricingContent, serializePricing, parseTimelineContent, serializeTimeline
  pdf/
    tokens.ts                   — COLORS, FONTS, SPACING, TYPE, PDF_VISUAL_STYLES (PdfStyleTokens per style key). All values in pt, PDF-safe hex only.
    proposal-document.tsx       — ProposalPdfDocument (react-pdf). Style-aware: reads section.visualStyle to apply distinct PDF tokens per section. Exports PdfBusinessContext.

components/
  ui/                           — shadcn primitives
  auth/login-form.tsx
  layout/app-sidebar.tsx, topbar.tsx
  leads/
    lead-form.tsx, create-lead-dialog.tsx, edit-lead-dialog.tsx, delete-lead-dialog.tsx, leads-table-client.tsx
  lead-detail/
    edit-delete-buttons.tsx, follow-up-banner.tsx, overview-card.tsx
    notes-section.tsx, add-note-form.tsx, note-item.tsx
    activities-section.tsx, add-activity-form.tsx, activity-item.tsx, delete-activity-button.tsx
    tasks-section.tsx, add-task-form.tsx, task-item.tsx
    lead-follow-ups-section.tsx — Server: pending + completed list, "+ Add" button
    lead-follow-up-item.tsx     — Client: Sparkles (AI Sheet) + Complete + Delete
  follow-ups/
    follow-up-card.tsx          — Client: card with Sparkles + Complete + Delete
    create-follow-up-dialog.tsx — leadId prop hides lead selector when pre-filled
    complete-follow-up-dialog.tsx — mark complete + next follow-up form (title, date, assignee, notes)
    ai-generator-sheet.tsx      — right-side Sheet: channel/tone/length/style controls → Generate → 3 variations with Copy buttons
  services/
    service-form.tsx, create-service-dialog.tsx, edit-service-dialog.tsx, delete-service-dialog.tsx, services-catalog-client.tsx
  proposals/
    generate-proposal-form.tsx  — Client: lead + template selector, custom instructions, collapsible transcript textarea → generateProposal
    workspace/
      proposal-workspace.tsx        — Client: renders ProposalSectionCards, manages section state
      proposal-header-actions.tsx   — Client: inline title edit + status dropdown + Export PDF button
      proposal-section-card.tsx     — Client: section content display + edit mode
  proposal-templates/
    template-card.tsx           — Server: card with name, section count, AI count, link to editor
    create-template-dialog.tsx  — Client: create new template modal
    edit-template-header.tsx    — Client: inline name/description editing
    template-section-item.tsx   — Client: section row with ↑↓ reorder + edit panel (templateText, aiInstructions, visualStyle, layoutType selectors, AI mode badges)
    add-section-form.tsx        — Client: add section form with AI mode toggle (Static / AI Refine / AI Generate), visualStyle + layoutType selectors, auto-suggests presets by section type

types/index.ts      — ActionResult<T>, Profile, Role
middleware.ts       — auth guard, redirects
prisma/
  schema.prisma
  seed.ts           — follow-up templates + proposal templates (run: npx tsx prisma/seed.ts)
  migrations/
    20260512113556_add_lead_model
    20260512121253_add_notes_activities_tasks
    20260512125115_add_follow_ups
    20260513170440_add_proposal_system
    20260514000001_refine_proposal_sections
    20260515000001_add_meeting_transcripts

app/
  api/
    proposals/[id]/pdf/route.ts   — GET: renders proposal to PDF via react-pdf, returns application/pdf
    invoices/[id]/pdf/route.ts    — GET: renders invoice to PDF via react-pdf, returns application/pdf
```

---

## Key Patterns

### Server Action response wrapper
```ts
type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }
```
All actions return `ActionResult`. Never throw from an action — catch and return `{ success: false, error }`.

### Client-side action calls
```ts
const [isPending, startTransition] = useTransition()
startTransition(async () => { await someAction() })
// NOT: startTransition(() => someAction())  ← TypeScript VoidOrUndefinedOnly error
```

### Revalidation pattern
Actions that modify a lead revalidate `/leads` and `/leads/${id}`. Follow-up actions also revalidate `/follow-ups`. Proposal actions revalidate `/proposals` and `/proposals/${id}`.

### Zod validations — NO `.default()`
Zod v3. `.default()` makes input/output types differ, breaking `react-hook-form` v7.75.0. All defaults live in the form's `defaultValues`, not the schema.

### Form component import
Hand-built shadcn Form component (not in registry). Uses `Slot.Root` from `radix-ui` umbrella package — NOT `@radix-ui/react-slot` or plain `Slot`.

---

## AI Infrastructure

### Context layer (`lib/ai/context/`) — IMPORTANT
All proposal AI generation flows through `buildLeadContext()` before calling any prompt builder. This is the centralized data shaping layer — do not bypass it.

**`buildLeadContext(lead, notes, activities, followUps, transcripts?)`** → `LeadFullContext`
- Async (may call `summarizeNotes()` if notes > 4)
- Returns a fully shaped context object with: processed notes, formatted activity lines (capped at 8), follow-up titles, and pre-formatted transcript block
- Actions fetch raw DB data and pass it here — context builder never touches the DB

**`processTranscript(raw)`** → `TranscriptInsights`
- Caps input at 6000 chars before sending to AI
- Extracts 10 structured fields: painPoints, goals, objections, desiredOutcomes, technicalRequirements, urgencySignals, decisionMakerInfo, communicationTone, businessPriorities, keyQuotes
- Temperature 0.1 — extracts only what was explicitly stated, does not infer
- Result saved to `MeetingTranscript` record in DB for reuse on future proposals

**`summarizeNotes(notes[])`**
- Gate at 4 notes: ≤4 notes → formatted directly (no AI call). >4 notes → AI summarization at temperature 0.2
- Falls back to first 4 notes if summarization fails — never blocks proposal generation

### Follow-up generator (`actions/ai.ts` → `generateFollowUpDrafts`)
- Fetches lead + last 5 activities from DB
- Calls `buildFollowUpSystemPrompt()` + `buildFollowUpUserPrompt()`
- Uses `gpt-4o-mini` with `response_format: { type: "json_object" }`
- Returns `ActionResult<FollowUpVariation[]>` (3 variations)

### Proposal generator (`actions/ai.ts` → `generateProposal`)
- Options: `{ customInstructions?, transcriptText? }`
- Fetches: lead (full fields incl. urgency/priority/pipelineStage/dealValue/source), last 10 notes, last 8 activities, pending follow-ups, template, last 2 existing transcripts — all in `Promise.all`
- If `transcriptText` provided: calls `processTranscript()` → saves `MeetingTranscript` → merges with existing transcripts
- Calls `buildLeadContext()` to produce `LeadFullContext` (may summarize notes)
- Three section modes — checked per section:
  - **Mode C** (`isAIGenerated=false, isAIRefinement=false`): `resolvePlaceholders()` only — no AI
  - **Mode B** (`isAIRefinement=true`): `buildProposalRefinementPrompt(templateText, ctx)` → OpenAI at temp 0.55. Fallback: original templateText
  - **Mode A** (`isAIGenerated=true`): `buildProposalSectionPrompt(type, ctx)` → OpenAI at temp 0.65. Fallback: "[Generation failed]"
- Per-section token budgets (tighter = more concise): COVER 130, EXECUTIVE_SUMMARY 260, PROBLEM_STATEMENT 240, PROPOSED_SOLUTION 270, SCOPE_OF_WORK 320, TIMELINE 300, NEXT_STEPS 180, ABOUT_US 200, TERMS 220. Mode B gets +80 buffer.
- All AI sections run in `Promise.all` (parallel). Non-AI sections resolve synchronously.
- Returns `ActionResult<string>` (proposal ID) → client redirects to `/proposals/${id}`
- `visualStyle` and `layoutType` are copied from template section to created ProposalSection

### Prompt system (`lib/ai/prompts/`)
**`standards.ts`** — single source of truth for quality rules:
- `QUALITY_RULES` — anti-cliché list, first-person plural rule, specificity rule. Injected into every system prompt.
- `REFINEMENT_RULES` — preserve structure, replace generic with specific, no new sections.
- `AIConfig` type + `verbosityInstruction()`, `toneInstruction()`, `focusInstruction()` composable functions.

**`framing.ts`** — industry and service vocabulary injection:
- `buildIndustryFraming(industry)` — regex matches free-text field → returns vocabulary + framing hint string
- `buildServiceFraming(service)` — same for service type
- Injected into `buildLeadContextBlock()` after engagement signals. Only included when a pattern matches.
- When neither matches, proposal is generated without framing (graceful degradation).

**`proposal.ts`** — section scaffolds:
- `buildProposalSectionPrompt(sectionType, ctx: LeadFullContext, ...)` — context block ordered: transcript → client → signals → framing → notes → activities
- Section defaults are paragraph-by-paragraph scaffolds with first-sentence rules and word targets
- EXECUTIVE_SUMMARY: "Do not start with We/Our/Thank you" + 3-paragraph structure + 90–110 word target
- SCOPE_OF_WORK: exact 5–6 bullets with required action verbs + good/bad examples
- TIMELINE: 4 named phases with prescribed durations
- NEXT_STEPS: 4 exact bullets + closing sentence template

**`presets/types.ts`** — architecture only (not implemented):
- `PromptPreset` — versioned prompt variant with sectionOverrides, temperatureOverrides, tokenOverrides
- `SectionEvaluationScore` — 5-dimension quality rubric (specificity, fluff, length fit, editability, consistency)
- `SectionGenerationMeta` — stored in ProposalSection.metadata to trace which preset/version generated it

### Placeholder system (`lib/ai/placeholder.ts`)
Pure sync function. Resolves `{{lead.name}}`, `{{lead.company}}`, `{{lead.service}}`, `{{lead.problem}}`, `{{lead.industry}}`, `{{proposal.date}}`, `{{proposal.validity}}`, `{{agency.name}}` in template content strings.

### `BusinessContext` slot
`lib/ai/types.ts` exports `BusinessContext { agencyName?, services?, brandTone?, customInstructions? }`. Both `buildFollowUpSystemPrompt(business?)` and `buildProposalSystemPrompt(business?)` accept it as optional. When the Settings module is built, pass populated context — no prompt restructuring needed.

### Adding future AI domains
1. Add `lib/ai/prompts/<domain>.ts` with system + user prompt builders (import from `standards.ts`)
2. Add `lib/ai/context/<domain>.ts` if new context shaping is needed
3. Add action to `actions/ai.ts`
4. Keep OpenAI calls out of components entirely

---

## Follow-up System

- `FollowUp` records per lead with `dueDate`.
- `syncLeadNextFollowUp(leadId)` — internal helper in `actions/follow-ups.ts`. Updates `lead.nextFollowUp` to earliest pending follow-up. Called on create, complete, delete.
- `lead.nextFollowUp` drives the `FollowUpBanner` on lead detail (overdue/today/soon).
- Completing: marks done, logs `Activity(FOLLOW_UP)`, sets `lead.lastContacted = now`. Optional next follow-up with full config (title, date, assignee, notes).
- `/follow-ups` dashboard: Overdue / Due Today / Upcoming / Recently Completed (last 20).
- AI Sheet (`ai-generator-sheet.tsx`): channel → tone → length → style controls, optional custom intent, generates 3 message variations with per-variation Copy buttons.
- 4 follow-up templates seeded.

---

## Proposal System

### Flow
```
/proposals/new → select lead + template + optional transcript → generateProposal action → /proposals/{id} workspace
```

### Proposal workspace (`/proposals/[id]`)
- Title: inline editable (`updateProposalTitle`)
- Status: dropdown (DRAFT → REVIEW → SENT → ACCEPTED → DECLINED)
- Sections: each section is a card with view/edit mode. Edit saves via `updateProposalSection`.
- Section reorder: ↑↓ arrows (`reorderProposalSection`)
- Section visibility: toggle hide/show (`toggleProposalSectionVisibility`)
- Add custom section: `addProposalSection`
- Export PDF: "Export PDF" button → `GET /api/proposals/[id]/pdf`

### Template editor (`/templates/[id]`)
- Inline name/description editing
- Section list with ↑↓ reorder, type, AI flag, content template (for non-AI sections), required flag
- Placeholder reference panel shown at bottom
- Add section form at bottom of list

### Visual section system
Each section has `visualStyle` (CLEAN | MODERN | HIGHLIGHT | MINIMAL | HERO | TWO_COLUMN) and `layoutType` (FULL_WIDTH | CENTERED | TWO_COLUMN | CARD). These are stored as enums — never raw CSS. The renderer (`lib/proposal/renderer.tsx`) maps them to Tailwind classes. PDF rendering maps the same enums to react-pdf style objects via `PDF_VISUAL_STYLES` in `lib/pdf/tokens.ts`.

`SectionVisualConfig` (stored in `metadata.visualConfig`) provides micro-overrides: alignment, spacing, accentColor, showDivider, emphasisLevel, width — all named values, no arbitrary CSS.

### AI section modes (per section in ProposalTemplateSection)
| isAIGenerated | isAIRefinement | Mode | What happens |
|:---:|:---:|---|---|
| false | false | C — Static | Placeholder resolution only |
| false | true | B — Refine | AI personalizes `templateText` using `LeadFullContext` + `aiInstructions` |
| true | false | A — Generate | AI writes from scratch using `LeadFullContext` + `aiInstructions` |

`aiInstructions` on the template section is a per-section AI prompt override — takes priority over default section scaffolds.

### Meeting Transcript flow
1. User pastes transcript in `generate-proposal-form.tsx` (collapsible textarea, shows "added" indicator)
2. `generateProposal` receives `options.transcriptText`
3. Action calls `processTranscript()` → extracts `TranscriptInsights` (10 fields)
4. Saves `MeetingTranscript` record to DB (leadId + insights + rawText trimmed to 8000 chars)
5. On future proposals for the same lead, last 2 existing transcripts are automatically fetched and merged
6. Transcript insights appear at the top of every section's context block (highest signal)

### PDF export
Route `GET /api/proposals/[id]/pdf` — fetches proposal + sections, renders via `ProposalPdfDocument`, streams as `application/pdf`. The PDF renderer reads each section's `visualStyle` and applies distinct react-pdf styles from `PDF_VISUAL_STYLES`. No Tailwind — all pt values and hex colors.

### Seeded proposal templates
- **Full Proposal** (default): Cover (HERO, static), Executive Summary (CLEAN, generate), Problem Statement (HIGHLIGHT, refine), Proposed Solution (CLEAN, generate), Scope of Work (MODERN, refine), Timeline (static), Pricing (static), About Us (MINIMAL, static), Terms (MINIMAL, static), Next Steps (MODERN, generate)
- **Quick Scope**: Cover, Scope of Work (refine), Pricing, Next Steps (generate)
- **Discovery Proposal**: Cover, What We Heard (HIGHLIGHT, refine), How We Can Help (generate), Next Steps (generate)
- **Config Showcase**: One section per visual style + AI mode combo — use to verify PDF rendering of all style presets

---

## Invoice System

- **Receipt-style workflow**: Built for an agency workflow where invoices are primarily issued *after* payment as a receipt. 
- **Generation**: Created via `/invoices/new`. The user can select a proposal to pre-fill line items, or manually add items. The generation form allows immediate logging of payment (amount, mode, reference) to instantly mark it `PAID` or `PARTIALLY_PAID`.
- **Snapshots**: Client details (name, company, email, address) are snapshotted on the `Invoice` record at creation so historical records do not drift if the Lead changes.
- **PDF Export**: Generates clean, branded PDFs reusing the `react-pdf` architecture and token system from proposals.

---

## Environment Variables

`.env` — Prisma CLI reads this.
`.env.local` — Next.js reads this (takes priority).

Both must have:
```
DATABASE_URL=postgresql://...6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=sk-...
```

Optional:
```
OPENAI_MODEL=gpt-4o-mini
```

---

## Modules Built vs Placeholder

| Module | Status |
|---|---|
| Auth (login/logout) | Complete |
| Layout (sidebar, topbar, route groups) | Complete |
| Leads (CRUD, table, search/filter/sort) | Complete |
| Lead Detail (overview, notes, activities, tasks, follow-ups) | Complete |
| Follow-ups Dashboard | Complete |
| Service Catalog | Complete |
| AI Follow-up Generator | Complete |
| Proposals (list, generate, workspace editor) | Complete |
| Proposal Templates (CRUD, section management) | Complete |
| AI Context Orchestration (transcript processing, context builders, prompt standards) | Complete |
| Pipeline (Kanban) | Placeholder page only |
| Invoices | Complete |
| Clients | Placeholder page only |
| Tasks (global view) | Placeholder page only |
| Settings | Placeholder page only |
| Dashboard stats | Placeholder page only |

---

## Windows-Specific Issue

On Windows, Prisma's query engine DLL (`query_engine-windows.dll.node`) is locked by the dev server process. Before running `prisma generate` or `prisma migrate deploy`, kill the dev server (the large node.exe process, ~800MB+). Restart after.
