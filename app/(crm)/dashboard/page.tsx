import { getDashboardData } from "@/actions/dashboard"
import { getActiveServices } from "@/actions/services"
import { getTeamMembers } from "@/actions/settings"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TodaysFocusCard } from "@/components/dashboard/todays-focus"
import { SalesOverview } from "@/components/dashboard/sales-overview"
import { PipelineValueCard } from "@/components/dashboard/pipeline-value"
import { PipelineSnapshot } from "@/components/dashboard/pipeline-snapshot"
import { HotLeads } from "@/components/dashboard/hot-leads"
import { FinancialOverview } from "@/components/dashboard/financial-overview"
import { RecentActivityFeed } from "@/components/dashboard/recent-activity"
import { MyTasks } from "@/components/dashboard/my-tasks"
import { TeamSnapshot } from "@/components/dashboard/team-snapshot"
import { AIInsights } from "@/components/dashboard/ai-insights"

export const metadata = {
  title: "Dashboard — Outpero CRM",
}

export default async function DashboardPage() {
  const [data, services, teamMembers] = await Promise.all([
    getDashboardData(),
    getActiveServices().catch(() => []),
    getTeamMembers().catch(() => []),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your operational home base</p>
        </div>
        <QuickActions services={services} teamMembers={teamMembers} />
      </div>

      {/* Top: Today's Focus */}
      <TodaysFocusCard data={data.todaysFocus} />

      {/* Middle: Sales + Pipeline value */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalesOverview data={data.salesOverview} />
        <PipelineValueCard data={data.pipelineValue} />
      </div>

      <PipelineSnapshot data={data.pipelineSnapshot} />

      <div className="grid gap-4 lg:grid-cols-2">
        <HotLeads data={data.hotLeads} />
        <FinancialOverview data={data.financial} />
      </div>

      {/* Bottom: Activity + Tasks + Insights */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RecentActivityFeed data={data.recentActivity} />
        <MyTasks data={data.myTasks} />
        <AIInsights data={data.insights} />
      </div>

      <TeamSnapshot data={data.teamSnapshot} />
    </div>
  )
}
