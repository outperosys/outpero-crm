import { CalendarClock } from "lucide-react"
import type { FollowUp, FollowUpTemplate } from "@prisma/client"
import { LeadFollowUpItem } from "./lead-follow-up-item"
import { CreateFollowUpDialog } from "@/components/follow-ups/create-follow-up-dialog"

interface LeadFollowUpsSectionProps {
  followUps: FollowUp[]
  leadId: string
  leadName: string
  templates: FollowUpTemplate[]
  teamMembers?: { id: string; name: string }[]
}

export function LeadFollowUpsSection({
  followUps,
  leadId,
  leadName,
  templates,
  teamMembers = [],
}: LeadFollowUpsSectionProps) {
  const pending = followUps.filter((f) => !f.completed)
  const completed = followUps.filter((f) => f.completed)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Follow-ups</h2>
        {pending.length > 0 && (
          <span className="text-xs text-muted-foreground">{pending.length} pending</span>
        )}
        <div className="ml-auto">
          <CreateFollowUpDialog
            templates={templates}
            leadId={leadId}
            teamMembers={teamMembers}
            trigger={
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                + Add
              </button>
            }
          />
        </div>
      </div>

      {followUps.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No follow-ups yet
        </p>
      ) : (
        <div className="space-y-2">
          {pending.map((f) => (
            <LeadFollowUpItem key={f.id} followUp={f} leadName={leadName} teamMembers={teamMembers} />
          ))}

          {completed.length > 0 && pending.length > 0 && (
            <div className="border-t pt-2" />
          )}

          {completed.map((f) => (
            <LeadFollowUpItem key={f.id} followUp={f} leadName={leadName} teamMembers={teamMembers} />
          ))}
        </div>
      )}
    </div>
  )
}
