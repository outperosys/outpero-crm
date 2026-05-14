import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getLead } from "@/actions/leads"
import { getNotes } from "@/actions/notes"
import { getActivities } from "@/actions/activities"
import { getTasks } from "@/actions/tasks"
import { getLeadFollowUps, getTemplates } from "@/actions/follow-ups"
import { getLeadProposals } from "@/actions/proposals"
import { EditDeleteButtons } from "@/components/lead-detail/edit-delete-buttons"
import { FollowUpBanner } from "@/components/lead-detail/follow-up-banner"
import { LeadOverviewCard } from "@/components/lead-detail/overview-card"
import { NotesSection } from "@/components/lead-detail/notes-section"
import { ActivitiesSection } from "@/components/lead-detail/activities-section"
import { TasksSection } from "@/components/lead-detail/tasks-section"
import { LeadFollowUpsSection } from "@/components/lead-detail/lead-follow-ups-section"
import { LeadProposalsSection } from "@/components/lead-detail/lead-proposals-section"

const STAGE_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead", QUALIFIED: "Qualified", DISCOVERY_CALL: "Discovery Call",
  PROPOSAL_SENT: "Proposal Sent", FOLLOW_UP: "Follow-up", WON: "Won", LOST: "Lost",
}

const STAGE_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  QUALIFIED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  DISCOVERY_CALL: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  PROPOSAL_SENT: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  FOLLOW_UP: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  WON: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  LOST: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lead = await getLead(id)
  return { title: lead ? `${lead.name} — Outpero CRM` : "Lead — Outpero CRM" }
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [lead, notes, activities, tasks, followUps, templates, proposals] = await Promise.all([
    getLead(id),
    getNotes(id),
    getActivities(id),
    getTasks(id),
    getLeadFollowUps(id),
    getTemplates(),
    getLeadProposals(id),
  ])

  if (!lead) notFound()

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Leads
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
            {lead.companyName && (
              <p className="text-sm text-muted-foreground">{lead.companyName}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[lead.pipelineStage]}`}>
                {STAGE_LABELS[lead.pipelineStage]}
              </span>
              <span className="text-xs text-muted-foreground">
                {lead.priority.charAt(0) + lead.priority.slice(1).toLowerCase()} priority
              </span>
              {lead.dealValue != null && (
                <span className="text-xs text-muted-foreground">
                  · ${lead.dealValue.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <EditDeleteButtons lead={lead} />
          </div>
        </div>
      </div>

      {/* Follow-up banner */}
      <FollowUpBanner lead={lead} />

      {/* Overview */}
      <LeadOverviewCard lead={lead} />

      {/* Notes + Activities — side by side on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <NotesSection notes={notes} leadId={id} />
        </div>
        <div className="rounded-lg border bg-card p-5">
          <ActivitiesSection activities={activities} leadId={id} />
        </div>
      </div>

      {/* Tasks + Follow-ups — side by side on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <TasksSection tasks={tasks} leadId={id} />
        </div>
        <div className="rounded-lg border bg-card p-5">
          <LeadFollowUpsSection
            followUps={followUps}
            leadId={id}
            leadName={lead.name}
            templates={templates}
          />
        </div>
      </div>

      {/* Proposals */}
      <div className="rounded-lg border bg-card p-5">
        <LeadProposalsSection proposals={proposals} leadId={id} />
      </div>
    </div>
  )
}
