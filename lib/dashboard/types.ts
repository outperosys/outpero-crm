// Shapes returned by actions/dashboard.ts. Kept additive so future sections
// (charts, forecasting, AI analytics) can extend this without breaking
// existing dashboard sections.

export interface TodaysFocus {
  followUpsDueToday: number
  overdueFollowUps: number
  tasksDueToday: number
  overdueTasks: number
  unpaidInvoices: number
}

export interface SalesOverview {
  totalLeads: number
  totalLeadsLast30: number
  activeLeads: number
  activeLeadsLast30: number
  hotLeads: number
  wonDeals: number
  wonDealsLast30: number
  lostDeals: number
  lostDealsLast30: number
}

export interface PipelineValue {
  totalPipelineValue: number
  highPriorityPipelineValue: number
  wonRevenue: number
  expectedRevenue: number
}

export interface PipelineSnapshotItem {
  stage: string
  label: string
  count: number
}

export interface HotLead {
  id: string
  name: string
  companyName: string | null
  dealValue: number | null
  priority: string
  nextFollowUp: Date | null
  score: number
}

export interface FinancialOverview {
  invoiceCounts: {
    draft: number
    sent: number
    overdue: number
    paid: number
  }
  totalInvoiced: number
  totalCollected: number
  outstanding: number
}

export interface RecentActivityItem {
  id: string
  type: string
  description: string
  link: string | null
  createdAt: Date
  leadId: string
  leadName: string
}

export interface MyTask {
  id: string
  title: string
  dueDate: Date | null
  priority: string
  status: string
}

export interface MyTasksData {
  openTasks: number
  dueToday: number
  overdue: number
  tasks: MyTask[]
}

export interface TeamSnapshotItem {
  name: string
  assignedLeads: number
  openTasks: number
  followUpsDue: number
}

export interface DashboardInsight {
  text: string
  href: string
}

export interface DashboardData {
  todaysFocus: TodaysFocus
  salesOverview: SalesOverview
  pipelineValue: PipelineValue
  pipelineSnapshot: PipelineSnapshotItem[]
  hotLeads: HotLead[]
  financial: FinancialOverview
  recentActivity: RecentActivityItem[]
  myTasks: MyTasksData
  teamSnapshot: TeamSnapshotItem[]
  insights: DashboardInsight[]
}
