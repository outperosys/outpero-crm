import { getTasks, getCurrentUserName } from "@/actions/tasks"
import { getLeads } from "@/actions/leads"
import { getInvoices } from "@/actions/invoices"
import { getReceipts } from "@/actions/receipts"
import { getActiveServices } from "@/actions/services"
import { getTeamMembers } from "@/actions/settings"
import { TasksPageClient } from "@/components/tasks/tasks-page-client"

export const metadata = { title: "Tasks — Outpero CRM" }

export default async function TasksPage() {
  const [tasks, currentUserName, leads, invoices, receipts, services, teamMembers] = await Promise.all([
    getTasks(),
    getCurrentUserName(),
    getLeads(),
    getInvoices(),
    getReceipts(),
    getActiveServices(),
    getTeamMembers().catch(() => []),
  ])

  return (
    <TasksPageClient
      tasks={tasks}
      currentUserName={currentUserName}
      teamMembers={teamMembers}
      leads={leads.map((l) => ({ id: l.id, name: l.name, companyName: l.companyName }))}
      invoices={invoices.map((i) => ({ id: i.id, invoiceNumber: i.invoiceNumber }))}
      receipts={receipts.map((r: { id: string; receiptNumber: string }) => ({ id: r.id, receiptNumber: r.receiptNumber }))}
      services={services}
    />
  )
}
