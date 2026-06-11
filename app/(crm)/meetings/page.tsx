import { getMeetings } from "@/actions/meetings"
import { getLeads } from "@/actions/leads"
import { getTeamMembers } from "@/actions/settings"
import { MeetingDialog } from "@/components/meetings/meeting-dialog"
import { MeetingsView } from "@/components/meetings/meetings-view"

export const metadata = { title: "Meetings — Outpero CRM" }

export default async function MeetingsPage() {
  const [meetings, leads, teamMembers] = await Promise.all([
    getMeetings(),
    getLeads(),
    getTeamMembers().catch(() => []),
  ])

  const scheduledCount = meetings.filter((m) => m.status === "SCHEDULED").length

  const leadOptions = leads.map((l) => ({
    id: l.id,
    name: l.name,
    companyName: l.companyName,
  }))

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground">
            {scheduledCount === 0 ? "No meetings scheduled" : `${scheduledCount} scheduled`}
          </p>
        </div>
        <MeetingDialog leads={leadOptions} teamMembers={teamMembers} />
      </div>

      <MeetingsView meetings={meetings} leads={leadOptions} teamMembers={teamMembers} />
    </div>
  )
}
