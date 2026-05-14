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

This applies to `generateMetadata` too. Do NOT destructure params directly.

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
npx prisma migrate dev --name <name>
npx prisma generate
```

---

## Prisma Schema — Current State

```prisma
enum Role { ADMIN MEMBER }
enum PipelineStage { NEW_LEAD QUALIFIED DISCOVERY_CALL PROPOSAL_SENT FOLLOW_UP WON LOST }
enum Priority { LOW MEDIUM HIGH }
enum Urgency { LOW MEDIUM HIGH }
enum ActivityType { CALL MEETING EMAIL PROPOSAL_SENT FOLLOW_UP STATUS_CHANGE NOTE }

model Profile     — id, userId, name, email, role, timestamps
model Lead        — full lead fields (see schema.prisma), relations: noteEntries, activities, tasks, followUps
model Note        — id, leadId, content, createdBy, timestamps. Cascade on lead delete.
model Activity    — id, leadId, type (ActivityType), description, createdBy, createdAt. Cascade.
model Task        — id, leadId, title, dueDate, completed, completedAt, assignedTo, timestamps. Cascade.
model FollowUp    — id, leadId, title, notes, dueDate, completed, completedAt, assignedTo, templateId, createdBy, timestamps. Cascade.
model FollowUpTemplate — id, name (unique), title, notes, timestamps.
```

Full schema at: `prisma/schema.prisma`

---

## Folder Structure

```
app/
  layout.tsx                    — root layout
  page.tsx                      — redirects to /dashboard
  (auth)/
    login/page.tsx              — login page
  (crm)/
    layout.tsx                  — sidebar + topbar wrapper
    dashboard/page.tsx          — placeholder
    leads/
      page.tsx                  — leads table with search/filter/sort
      loading.tsx               — skeleton
      [id]/
        page.tsx                — lead detail workspace (parallel fetch 6 things)
        loading.tsx             — skeleton
    follow-ups/
      page.tsx                  — follow-up dashboard (Overdue/Today/Upcoming/Completed)
      loading.tsx               — skeleton
    pipeline/page.tsx           — placeholder
    proposals/page.tsx          — placeholder
    invoices/page.tsx           — placeholder
    clients/page.tsx            — placeholder
    tasks/page.tsx              — placeholder
    templates/page.tsx          — placeholder
    settings/page.tsx           — placeholder

actions/
  auth.ts         — login(prevState, formData), logout()
  leads.ts        — getLeads, getLead, createLead, updateLead, deleteLead
  notes.ts        — getNotes, createNote, updateNote, deleteNote
  activities.ts   — getActivities, createActivity, deleteActivity
  tasks.ts        — getTasks, createTask, toggleTask, deleteTask
  follow-ups.ts   — getFollowUps, getLeadFollowUps, createFollowUp, completeFollowUp, deleteFollowUp, getTemplates
  ai.ts           — generateFollowUpDrafts(leadId, options) → ActionResult<FollowUpVariation[]>

lib/
  prisma.ts                   — Prisma singleton
  utils.ts                    — cn(), formatDate(), formatCurrency()
  supabase/
    server.ts                 — createClient() for Server Components + Actions
    client.ts                 — createBrowserClient() for Client Components
  validations/
    lead.ts                   — leadSchema (Zod), LeadFormValues, constants (PIPELINE_STAGES, PRIORITIES, etc.)
    note.ts                   — noteSchema
    activity.ts               — activitySchema
    task.ts                   — taskSchema
    follow-up.ts              — followUpSchema, FollowUpFormValues
  ai/
    types.ts                  — FollowUpTone/Length/Channel/Style, FollowUpGenerationOptions, FollowUpVariation, LeadAIContext, BusinessContext
    openai.ts                 — singleton OpenAI client + AI_MODEL constant
    prompts/
      follow-up.ts            — buildFollowUpSystemPrompt(business?), buildFollowUpUserPrompt(lead, activities, options, followUpTitle?)

components/
  ui/                         — shadcn primitives (button, input, label, dialog, sheet, sidebar, etc.)
  auth/
    login-form.tsx            — login form (Client Component, useActionState)
  layout/
    app-sidebar.tsx           — nav sidebar (Client, usePathname)
    topbar.tsx                — top bar
  leads/
    lead-form.tsx             — full lead form (react-hook-form + Zod)
    create-lead-dialog.tsx    — Dialog wrapper for creating leads
    edit-lead-dialog.tsx      — Dialog wrapper for editing leads
    delete-lead-dialog.tsx    — Alert dialog for deleting (onSuccess? prop for navigation)
    leads-table-client.tsx    — Client: search/filter/sort, single shared edit+delete dialog
  lead-detail/
    edit-delete-buttons.tsx   — Client wrapper managing edit/delete dialog state
    follow-up-banner.tsx      — Server: overdue/today/soon banner using lead.nextFollowUp
    overview-card.tsx         — Lead fields display
    notes-section.tsx         — Server wrapper for notes list + add form
    add-note-form.tsx         — Client: inline note creation
    note-item.tsx             — Note display with edit/delete
    activities-section.tsx    — Server wrapper for activity list + add form
    add-activity-form.tsx     — Client: activity type + description form
    activity-item.tsx         — Activity display
    delete-activity-button.tsx — Client delete button
    tasks-section.tsx         — Server wrapper for tasks list + add form
    add-task-form.tsx         — Client: inline task creation (title + date + assignee)
    task-item.tsx             — Client: checkbox toggle + delete
    lead-follow-ups-section.tsx — Server: renders pending + completed follow-ups, "+ Add" button
    lead-follow-up-item.tsx   — Client: follow-up row with Sparkles (AI) + Complete + Delete buttons
  follow-ups/
    follow-up-card.tsx        — Client: dashboard card with Sparkles + Complete + Delete
    create-follow-up-dialog.tsx — Client: modal form (lead selector + template selector + fields). leadId prop hides lead selector when pre-filled.
    complete-follow-up-dialog.tsx — Client: mark complete + optional next follow-up form (title, date, assignee, notes)
    ai-generator-sheet.tsx    — Client: right-side Sheet. Controls (channel/tone/length/style + custom intent) → Generate → 3 copy-ready message variations

types/
  index.ts      — ActionResult<T>, Profile, Role

middleware.ts   — auth guard, redirects
prisma/
  schema.prisma
  seed.ts       — seeds 4 FollowUpTemplates (run: npx tsx prisma/seed.ts)
  migrations/
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
Actions that modify a lead revalidate both `/leads` and `/leads/${id}`. Follow-up actions also revalidate `/follow-ups`.

### Zod validations — NO `.default()`
Zod v3 is used. `.default()` makes input/output types differ, breaking `react-hook-form` v7.75.0. All defaults live in the form's `defaultValues`, not the schema.

### Form imports — shadcn Form component
The `Form` component was hand-built (not in shadcn registry). Uses `Slot.Root` from `radix-ui` umbrella package — NOT `@radix-ui/react-slot` or just `Slot`.

---

## AI Infrastructure

`actions/ai.ts` — `generateFollowUpDrafts(leadId, options)`:
- Fetches lead fields + last 5 activities from DB
- Calls `buildFollowUpSystemPrompt()` + `buildFollowUpUserPrompt()`
- Uses `gpt-4o-mini` with `response_format: { type: "json_object" }`
- Returns `ActionResult<FollowUpVariation[]>` (3 variations by default)

`lib/ai/types.ts` has a `BusinessContext` interface reserved for a future Settings layer — pass it to `buildFollowUpSystemPrompt(business?)` when that's built.

Future AI features (proposals, emails, summaries) follow the same pattern: add `lib/ai/prompts/<domain>.ts`, add action to `actions/ai.ts`.

---

## Follow-up System — How It Works

- `FollowUp` records are created per lead with a `dueDate`.
- Creating or completing a follow-up calls `syncLeadNextFollowUp(leadId)` which updates `lead.nextFollowUp` to the earliest pending follow-up date.
- `lead.nextFollowUp` drives the `FollowUpBanner` on the lead detail page (overdue/today/soon).
- Completing a follow-up: marks done, logs `Activity(FOLLOW_UP)`, sets `lead.lastContacted = now`. Optional: creates next follow-up with full config.
- `/follow-ups` dashboard partitions all follow-ups into: Overdue / Due Today / Upcoming / Recently Completed (last 20).
- 4 templates seeded: "Proposal Follow-up", "Discovery Reminder", "No Response", "Re-engagement".

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
OPENAI_MODEL=gpt-4o-mini   # override AI model
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
| AI Follow-up Generator | Complete |
| Pipeline (Kanban) | Placeholder page only |
| Proposals | Placeholder page only |
| Invoices | Placeholder page only |
| Clients | Placeholder page only |
| Tasks (global) | Placeholder page only |
| Templates | Placeholder page only |
| Settings | Placeholder page only |
| Dashboard stats | Placeholder page only |

---

## Windows-Specific Issue

On Windows, Prisma's query engine DLL (`query_engine-windows.dll.node`) is locked by the dev server process. Before running `prisma generate` or `prisma migrate dev`, **kill the dev server** (the large node.exe process, ~800MB+). Restart dev server after.
