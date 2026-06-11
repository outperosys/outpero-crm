import type { Lead } from "@prisma/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { AssigneeBadge } from "@/components/leads/assignee-badge"

function Field({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value || <span className="text-muted-foreground/50">—</span>}</p>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  )
}

const STAGE_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead", QUALIFIED: "Qualified", DISCOVERY_CALL: "Discovery Call",
  PROPOSAL_SENT: "Proposal Sent", FOLLOW_UP: "Follow-up", WON: "Won", LOST: "Lost",
}

export function LeadOverviewCard({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact */}
        <Section title="Contact">
          <Field label="Email" value={lead.email} />
          <Field label="Phone" value={lead.phone} />
        </Section>

        {/* Lead Context */}
        <Section title="Lead Context">
          <Field label="Source" value={lead.source} />
          <Field label="Service Interested" value={lead.serviceInterested} />
          <Field label="Calls per Day / Month" value={(lead as any).callVolume} />
          <Field label="Industry" value={lead.industry} />
          <Field label="Team Size" value={lead.teamSize} />
        </Section>

        {/* Online Presence */}
        <Section title="Online Presence">
          <Field label="Website" value={lead.existingWebsite} />
          <div className="col-span-2">
            <Field label="Social Profiles" value={lead.socialProfiles} />
          </div>
        </Section>

        {/* Deal & Status */}
        <Section title="Deal & Status">
          <Field
            label="Deal Value"
            value={lead.dealValue != null ? formatCurrency(lead.dealValue) : null}
          />
          <Field label="Proposal Sent" value={lead.proposalSent ? "Yes" : "No"} />
          <Field label="Stage" value={STAGE_LABELS[lead.pipelineStage]} />
          <Field label="Priority" value={lead.priority.charAt(0) + lead.priority.slice(1).toLowerCase()} />
          <Field label="Urgency" value={lead.urgency.charAt(0) + lead.urgency.slice(1).toLowerCase()} />
        </Section>
      </div>

      {/* Discovery — full width */}
      {(lead.currentProblem || lead.currentTools) && (
        <div className="border-t pt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Discovery
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {lead.currentProblem && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Current Problem</p>
                <p className="text-sm whitespace-pre-wrap">{lead.currentProblem}</p>
              </div>
            )}
            {lead.currentTools && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Current Tools</p>
                <p className="text-sm whitespace-pre-wrap">{lead.currentTools}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Follow-up & Internal — full width */}
      <div className="border-t pt-5 grid gap-6 md:grid-cols-2">
        <Section title="Follow-up">
          <Field
            label="Last Contacted"
            value={lead.lastContacted ? formatDate(lead.lastContacted) : null}
          />
          <Field
            label="Next Follow-up"
            value={lead.nextFollowUp ? formatDate(lead.nextFollowUp) : null}
          />
        </Section>

        <Section title="Internal">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Assigned To</p>
            <AssigneeBadge name={lead.assignedTo} />
          </div>
          <div className="col-span-2">
            <Field label="Quick Note" value={lead.notes} />
          </div>
        </Section>
      </div>
    </div>
  )
}
