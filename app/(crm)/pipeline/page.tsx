import { getPipelineLeads } from "@/actions/leads"
import { getTeamMembers } from "@/actions/settings"
import { getTags } from "@/actions/tags"
import { PipelineBoard } from "@/components/pipeline/pipeline-board"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Pipeline — Outpero CRM" }

export default async function PipelinePage() {
  const db = prisma as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const [leads, settings, teamMembers, tags] = await Promise.all([
    getPipelineLeads(),
    db.agencySettings.findUnique({ where: { id: "1" }, select: { pipelineStageLabels: true } }).catch(() => null),
    getTeamMembers().catch(() => []),
    getTags(),
  ])

  const stageLabels = (settings?.pipelineStageLabels as Record<string, string> | null) ?? {}

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">Drag cards to move leads through stages</p>
      </div>
      <PipelineBoard initialLeads={leads} stageLabels={stageLabels} teamMembers={teamMembers} allTags={tags} />
    </div>
  )
}
