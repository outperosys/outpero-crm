import { getSettings, getTeamMembers } from "@/actions/settings"
import { getActiveServices } from "@/actions/services"
import { SettingsClient } from "./settings-form"

export const metadata = { title: "Settings — Outpero CRM" }

export default async function SettingsPage() {
  const [settings, teamMembers, services] = await Promise.all([
    getSettings(),
    getTeamMembers(),
    getActiveServices(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Central configuration for your agency — consumed by AI, documents, and pipeline.
        </p>
      </div>
      <SettingsClient
        settings={settings}
        teamMembers={teamMembers}
        services={services}
      />
    </div>
  )
}
