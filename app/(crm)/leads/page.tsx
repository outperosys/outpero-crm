import { getLeads } from "@/actions/leads"
import { getActiveServices } from "@/actions/services"
import { getTeamMembers } from "@/actions/settings"
import { LeadsTableClient } from "@/components/leads/leads-table-client"

export const metadata = { title: "Leads — Outpero CRM" }

export default async function LeadsPage() {
  const [leads, services, teamMembers] = await Promise.all([
    getLeads(),
    getActiveServices(),
    getTeamMembers().catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">
          {leads.length === 0
            ? "No leads yet"
            : `${leads.length} ${leads.length === 1 ? "lead" : "leads"} in your pipeline`}
        </p>
      </div>

      <LeadsTableClient leads={leads} services={services} teamMembers={teamMembers} />
    </div>
  )
}
