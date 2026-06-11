import { Video, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MeetingCard } from "@/components/meetings/meeting-card"
import { MeetingDialog } from "@/components/meetings/meeting-dialog"
import type { MeetingWithLead } from "@/actions/meetings"

interface LeadMeetingsSectionProps {
  meetings: MeetingWithLead[]
  leadId: string
  teamMembers?: { id: string; name: string }[]
}

export function LeadMeetingsSection({ meetings, leadId, teamMembers = [] }: LeadMeetingsSectionProps) {
  const scheduled = meetings.filter((m) => m.status === "SCHEDULED")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Meetings</h2>
        <div className="ml-auto flex items-center gap-2">
          {scheduled.length > 0 && (
            <span className="text-xs text-muted-foreground">{scheduled.length} scheduled</span>
          )}
          <MeetingDialog
            leadId={leadId}
            teamMembers={teamMembers}
            trigger={
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                <Plus className="size-3.5" />
                Add
              </Button>
            }
          />
        </div>
      </div>

      {meetings.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No meetings yet</p>
      ) : (
        <div className="space-y-2">
          {meetings.map((m) => (
            <MeetingCard key={m.id} meeting={m} showLead={false} teamMembers={teamMembers} />
          ))}
        </div>
      )}
    </div>
  )
}
