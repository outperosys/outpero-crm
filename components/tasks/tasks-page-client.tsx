"use client"

import { useMemo, useState } from "react"
import { Search, CheckSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskRow } from "./task-row"
import { TaskDialog } from "./task-dialog"
import { TASK_STATUSES, TASK_PRIORITIES, TASK_RELATED_TYPES } from "@/lib/validations/task"
import type { TaskWithRelations } from "@/actions/tasks"

interface TasksPageClientProps {
  tasks: TaskWithRelations[]
  currentUserName: string | null
  teamMembers: { id: string; name: string }[]
  leads: { id: string; name: string; companyName: string | null }[]
  invoices: { id: string; invoiceNumber: string }[]
  receipts: { id: string; receiptNumber: string }[]
  services: { id: string; name: string }[]
}

function startOfDay(date: Date | string) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function EmptySection({ message }: { message: string }) {
  return <p className="py-3 text-center text-sm text-muted-foreground">{message}</p>
}

export function TasksPageClient({
  tasks,
  currentUserName,
  teamMembers,
  leads,
  invoices,
  receipts,
  services,
}: TasksPageClientProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [assignedToFilter, setAssignedToFilter] = useState("ALL")
  const [relatedTypeFilter, setRelatedTypeFilter] = useState("ALL")

  const isFiltered =
    !!search || statusFilter !== "ALL" || priorityFilter !== "ALL" || assignedToFilter !== "ALL" || relatedTypeFilter !== "ALL"

  const entityProps = { teamMembers, leads, invoices, receipts, services }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tasks.filter((task) => {
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        (task.description?.toLowerCase().includes(q) ?? false)
      const matchesStatus = statusFilter === "ALL" || task.status === statusFilter
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter
      const matchesAssignedTo =
        assignedToFilter === "ALL" ||
        (assignedToFilter === "UNASSIGNED" ? !task.assignedTo : task.assignedTo === assignedToFilter)
      const matchesRelatedType = relatedTypeFilter === "ALL" || task.relatedType === relatedTypeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignedTo && matchesRelatedType
    })
  }, [tasks, search, statusFilter, priorityFilter, assignedToFilter, relatedTypeFilter])

  const sections = useMemo(() => {
    const today = startOfDay(new Date())
    const open = filtered.filter((t) => t.status !== "DONE")

    const myTasks = currentUserName
      ? open.filter((t) => t.assignedTo === currentUserName)
      : []
    const overdue = open.filter((t) => t.dueDate && startOfDay(t.dueDate) < today)
    const dueToday = open.filter((t) => t.dueDate && isSameDay(startOfDay(t.dueDate), today))
    const upcoming = open.filter((t) => !t.dueDate || startOfDay(t.dueDate) > today)
    const completed = filtered.filter((t) => t.status === "DONE").slice(0, 20)

    return { myTasks, overdue, dueToday, upcoming, completed }
  }, [filtered, currentUserName])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.length === 0
              ? "No tasks yet"
              : `${tasks.filter((t) => t.status !== "DONE").length} open task${
                  tasks.filter((t) => t.status !== "DONE").length === 1 ? "" : "s"
                }`}
          </p>
        </div>
        <TaskDialog {...entityProps} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[180px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            {TASK_PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Anyone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Anyone</SelectItem>
            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.name}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={relatedTypeFilter} onValueChange={setRelatedTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {TASK_RELATED_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="rounded-lg border border-dashed p-16 text-center">
          <CheckSquare className="size-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No tasks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first task to start tracking action items
          </p>
        </div>
      )}

      {/* Filtered flat list */}
      {tasks.length > 0 && isFiltered && (
        <section className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="font-medium">No tasks match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map((task) => <TaskRow key={task.id} task={task} {...entityProps} />)
          )}
        </section>
      )}

      {/* Sectioned view */}
      {tasks.length > 0 && !isFiltered && (
        <div className="space-y-6">
          {sections.myTasks.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">My Tasks</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {sections.myTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {sections.myTasks.map((task) => (
                  <TaskRow key={task.id} task={task} {...entityProps} />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-destructive">Overdue</h2>
              {sections.overdue.length > 0 && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {sections.overdue.length}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {sections.overdue.length === 0 ? (
                <EmptySection message="No overdue tasks" />
              ) : (
                sections.overdue.map((task) => <TaskRow key={task.id} task={task} {...entityProps} />)
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-amber-600 dark:text-amber-400">Due Today</h2>
              {sections.dueToday.length > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {sections.dueToday.length}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {sections.dueToday.length === 0 ? (
                <EmptySection message="Nothing due today" />
              ) : (
                sections.dueToday.map((task) => <TaskRow key={task.id} task={task} {...entityProps} />)
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Upcoming</h2>
            <div className="space-y-2">
              {sections.upcoming.length === 0 ? (
                <EmptySection message="Nothing upcoming" />
              ) : (
                sections.upcoming.map((task) => <TaskRow key={task.id} task={task} {...entityProps} />)
              )}
            </div>
          </section>

          {sections.completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Recently Completed</h2>
              <div className="space-y-2">
                {sections.completed.map((task) => (
                  <TaskRow key={task.id} task={task} {...entityProps} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
