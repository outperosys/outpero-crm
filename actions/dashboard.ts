"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getCurrentUserName } from "@/actions/tasks"
import { getTeamMembers } from "@/actions/settings"
import { rankHotLeads } from "@/lib/dashboard/scoring"
import { buildInsights } from "@/lib/dashboard/insights"
import type { DashboardData, PipelineSnapshotItem } from "@/lib/dashboard/types"
import type { PipelineStage } from "@prisma/client"

const DAY_MS = 24 * 60 * 60 * 1000

// Contacted, Discovery (scheduled + done), Negotiation — excludes New Lead and Won/Lost.
const EXPECTED_REVENUE_STAGES = ["QUALIFIED", "DISCOVERY_CALL", "DISCOVERY_DONE", "FOLLOW_UP"] as const

const PIPELINE_STAGE_DEFS = [
  { key: "NEW_LEAD", label: "New Lead" },
  { key: "QUALIFIED", label: "Contacted" },
  { key: "DISCOVERY_CALL", label: "Discovery Scheduled" },
  { key: "DISCOVERY_DONE", label: "Discovery Done" },
  { key: "PROPOSAL_SENT", label: "Proposal Sent" },
  { key: "FOLLOW_UP", label: "Negotiation" },
  { key: "WON", label: "Won" },
  { key: "LOST", label: "Lost" },
] as const

const HIGH_VALUE_THRESHOLD = 50000
const UNCONTACTED_DAYS = 5

export async function getDashboardData(): Promise<DashboardData> {
  await requireAuth()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + DAY_MS)
  const days30Ago = new Date(now.getTime() - 30 * DAY_MS)
  const days5Ago = new Date(now.getTime() - UNCONTACTED_DAYS * DAY_MS)

  const userName = await getCurrentUserName()

  const [
    followUpsDueToday,
    overdueFollowUps,
    tasksDueToday,
    overdueTasks,
    unpaidInvoices,
    totalLeads,
    totalLeadsLast30,
    activeLeads,
    activeLeadsLast30,
    hotLeadsCount,
    wonDeals,
    wonDealsLast30,
    lostDeals,
    lostDealsLast30,
    pipelineValueAgg,
    highPriorityValueAgg,
    wonRevenueAgg,
    expectedRevenueAgg,
    pipelineGroups,
    hotLeadCandidates,
    invoiceStatusGroups,
    totalInvoicedAgg,
    totalCollectedAgg,
    recentActivity,
    pipelineStageLabelsRow,
    teamMembers,
    leadAssigneeGroups,
    taskAssigneeGroups,
    followUpAssigneeGroups,
    highValueUncontactedLeads,
    hotLeadsAwaitingFollowUp,
    myTaskCounts,
    myTasks,
  ] = await Promise.all([
    prisma.followUp.count({ where: { completed: false, dueDate: { gte: todayStart, lt: todayEnd } } }),
    prisma.followUp.count({ where: { completed: false, dueDate: { lt: todayStart } } }),
    prisma.task.count({ where: { status: { not: "DONE" }, dueDate: { gte: todayStart, lt: todayEnd } } }),
    prisma.task.count({ where: { status: { not: "DONE" }, dueDate: { lt: todayStart } } }),
    prisma.invoice.count({ where: { status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] } } }),

    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: days30Ago } } }),
    prisma.lead.count({ where: { pipelineStage: { notIn: ["WON", "LOST"] } } }),
    prisma.lead.count({ where: { pipelineStage: { notIn: ["WON", "LOST"] }, createdAt: { gte: days30Ago } } }),
    prisma.lead.count({ where: { priority: "HIGH", pipelineStage: { notIn: ["WON", "LOST"] } } }),
    prisma.lead.count({ where: { pipelineStage: "WON" } }),
    prisma.lead.count({ where: { pipelineStage: "WON", updatedAt: { gte: days30Ago } } }),
    prisma.lead.count({ where: { pipelineStage: "LOST" } }),
    prisma.lead.count({ where: { pipelineStage: "LOST", updatedAt: { gte: days30Ago } } }),

    prisma.lead.aggregate({ _sum: { dealValue: true }, where: { pipelineStage: { notIn: ["WON", "LOST"] } } }),
    prisma.lead.aggregate({ _sum: { dealValue: true }, where: { pipelineStage: { notIn: ["WON", "LOST"] }, priority: "HIGH" } }),
    prisma.lead.aggregate({ _sum: { dealValue: true }, where: { pipelineStage: "WON" } }),
    prisma.lead.aggregate({ _sum: { dealValue: true }, where: { pipelineStage: { in: [...EXPECTED_REVENUE_STAGES] } } }),

    prisma.lead.groupBy({ by: ["pipelineStage"], _count: { _all: true } }),

    prisma.lead.findMany({
      where: { pipelineStage: { notIn: ["WON", "LOST"] } },
      select: { id: true, name: true, companyName: true, dealValue: true, priority: true, urgency: true, nextFollowUp: true, lastContacted: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),

    prisma.invoice.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.invoice.aggregate({ _sum: { grandTotal: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.receipt.aggregate({ _sum: { amountReceived: true } }),

    prisma.activity.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { lead: { select: { id: true, name: true, companyName: true } } },
    }),

    prisma.agencySettings.findUnique({ where: { id: "1" }, select: { pipelineStageLabels: true } }).catch(() => null),

    getTeamMembers().catch(() => []),

    prisma.lead.groupBy({
      by: ["assignedTo"],
      where: { pipelineStage: { notIn: ["WON", "LOST"] }, assignedTo: { not: null } },
      _count: { _all: true },
    }),
    prisma.task.groupBy({
      by: ["assignedTo"],
      where: { status: { not: "DONE" }, assignedTo: { not: null } },
      _count: { _all: true },
    }),
    prisma.followUp.groupBy({
      by: ["assignedTo"],
      where: { completed: false, assignedTo: { not: null } },
      _count: { _all: true },
    }),

    prisma.lead.count({
      where: {
        pipelineStage: { notIn: ["WON", "LOST"] },
        dealValue: { gte: HIGH_VALUE_THRESHOLD },
        OR: [{ lastContacted: null }, { lastContacted: { lt: days5Ago } }],
      },
    }),
    prisma.lead.count({
      where: {
        pipelineStage: { notIn: ["WON", "LOST"] },
        priority: "HIGH",
        OR: [{ nextFollowUp: null }, { nextFollowUp: { lt: now } }],
      },
    }),

    userName
      ? Promise.all([
          prisma.task.count({ where: { assignedTo: userName, status: { not: "DONE" } } }),
          prisma.task.count({ where: { assignedTo: userName, status: { not: "DONE" }, dueDate: { gte: todayStart, lt: todayEnd } } }),
          prisma.task.count({ where: { assignedTo: userName, status: { not: "DONE" }, dueDate: { lt: todayStart } } }),
        ])
      : Promise.resolve([0, 0, 0] as [number, number, number]),
    userName
      ? prisma.task.findMany({
          where: { assignedTo: userName, status: { not: "DONE" } },
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          take: 5,
          select: { id: true, title: true, dueDate: true, priority: true, status: true },
        })
      : Promise.resolve([]),
  ])

  // ─── Pipeline snapshot ──────────────────────────────────────────────────
  const pipelineCounts = new Map(pipelineGroups.map((g) => [g.pipelineStage, g._count._all]))
  const stageLabels = (pipelineStageLabelsRow?.pipelineStageLabels as Record<string, string> | null) ?? {}
  const pipelineSnapshot: PipelineSnapshotItem[] = PIPELINE_STAGE_DEFS.map((stage) => ({
    stage: stage.key,
    label: stageLabels[stage.key] ?? stage.label,
    count: pipelineCounts.get(stage.key as PipelineStage) ?? 0,
  }))

  // ─── Hot leads ──────────────────────────────────────────────────────────
  const hotLeads = rankHotLeads(hotLeadCandidates)

  // ─── Financial ──────────────────────────────────────────────────────────
  const invoiceCountByStatus = new Map(invoiceStatusGroups.map((g) => [g.status, g._count._all]))
  const totalInvoiced = totalInvoicedAgg._sum.grandTotal ?? 0
  const totalCollected = totalCollectedAgg._sum.amountReceived ?? 0

  // ─── Recent activity ────────────────────────────────────────────────────
  const recentActivityItems = recentActivity.map((a) => ({
    id: a.id,
    type: a.type,
    description: a.description,
    link: a.link,
    createdAt: a.createdAt,
    leadId: a.leadId,
    leadName: a.lead.companyName || a.lead.name,
  }))

  // ─── Team snapshot ──────────────────────────────────────────────────────
  const leadCountByAssignee = new Map(leadAssigneeGroups.map((g) => [g.assignedTo, g._count._all]))
  const taskCountByAssignee = new Map(taskAssigneeGroups.map((g) => [g.assignedTo, g._count._all]))
  const followUpCountByAssignee = new Map(followUpAssigneeGroups.map((g) => [g.assignedTo, g._count._all]))

  const teamSnapshot = teamMembers
    .filter((m) => m.isActive)
    .map((m) => ({
      name: m.name,
      assignedLeads: leadCountByAssignee.get(m.name) ?? 0,
      openTasks: taskCountByAssignee.get(m.name) ?? 0,
      followUpsDue: followUpCountByAssignee.get(m.name) ?? 0,
    }))

  // ─── My tasks ───────────────────────────────────────────────────────────
  const [myOpenTasks, myDueToday, myOverdue] = myTaskCounts

  return {
    todaysFocus: {
      followUpsDueToday,
      overdueFollowUps,
      tasksDueToday,
      overdueTasks,
      unpaidInvoices,
    },
    salesOverview: {
      totalLeads,
      totalLeadsLast30,
      activeLeads,
      activeLeadsLast30,
      hotLeads: hotLeadsCount,
      wonDeals,
      wonDealsLast30,
      lostDeals,
      lostDealsLast30,
    },
    pipelineValue: {
      totalPipelineValue: pipelineValueAgg._sum.dealValue ?? 0,
      highPriorityPipelineValue: highPriorityValueAgg._sum.dealValue ?? 0,
      wonRevenue: wonRevenueAgg._sum.dealValue ?? 0,
      expectedRevenue: expectedRevenueAgg._sum.dealValue ?? 0,
    },
    pipelineSnapshot,
    hotLeads,
    financial: {
      invoiceCounts: {
        draft: invoiceCountByStatus.get("DRAFT") ?? 0,
        sent: invoiceCountByStatus.get("SENT") ?? 0,
        overdue: invoiceCountByStatus.get("OVERDUE") ?? 0,
        paid: invoiceCountByStatus.get("PAID") ?? 0,
      },
      totalInvoiced,
      totalCollected,
      outstanding: Math.max(0, totalInvoiced - totalCollected),
    },
    recentActivity: recentActivityItems,
    myTasks: {
      openTasks: myOpenTasks,
      dueToday: myDueToday,
      overdue: myOverdue,
      tasks: myTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority,
        status: t.status,
      })),
    },
    teamSnapshot,
    insights: buildInsights({
      highValueUncontactedLeads,
      overdueInvoices: invoiceCountByStatus.get("OVERDUE") ?? 0,
      overdueFollowUps,
      overdueTasks,
      hotLeadsAwaitingFollowUp,
    }),
  }
}
