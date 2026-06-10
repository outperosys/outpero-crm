import Link from "next/link"
import { FileText, Receipt, Kanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog"
import { TaskDialog } from "@/components/tasks/task-dialog"

interface QuickActionsProps {
  services: { id: string; name: string }[]
  teamMembers: { id: string; name: string }[]
}

export function QuickActions({ services, teamMembers }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CreateLeadDialog services={services} teamMembers={teamMembers} />
      <TaskDialog teamMembers={teamMembers} />
      <Button variant="outline" size="sm" className="gap-1.5" asChild>
        <Link href="/financial/invoices/new">
          <FileText className="size-4" />
          New Invoice
        </Link>
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" asChild>
        <Link href="/financial/receipts/new">
          <Receipt className="size-4" />
          New Receipt
        </Link>
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" asChild>
        <Link href="/pipeline">
          <Kanban className="size-4" />
          Open Pipeline
        </Link>
      </Button>
    </div>
  )
}
