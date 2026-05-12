export const metadata = {
  title: "Dashboard — Outpero CRM",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your workspace at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Leads", value: "—" },
          { label: "Follow-ups Due", value: "—" },
          { label: "Open Proposals", value: "—" },
          { label: "Tasks Today", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-5 space-y-1"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
