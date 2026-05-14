import { getProposalTemplates } from "@/actions/proposal-templates"
import { CreateTemplateDialog } from "@/components/proposal-templates/create-template-dialog"
import { TemplateCard } from "@/components/proposal-templates/template-card"
import { Layers } from "lucide-react"

export const metadata = { title: "Proposal Templates — Outpero CRM" }

export default async function TemplatesPage() {
  const templates = await getProposalTemplates()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proposal Templates</h1>
          <p className="text-sm text-muted-foreground">
            {templates.length === 0
              ? "No templates yet"
              : `${templates.length} ${templates.length === 1 ? "template" : "templates"}`}
          </p>
        </div>
        <CreateTemplateDialog />
      </div>

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="rounded-lg border border-dashed p-16 text-center">
          <Layers className="size-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">No proposal templates</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a template to define the structure of your proposals
          </p>
        </div>
      )}

      {/* Template grid */}
      {templates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  )
}
