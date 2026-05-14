import { notFound } from "next/navigation"
import Link from "next/link"
import { getProposalTemplate } from "@/actions/proposal-templates"
import { EditTemplateHeader } from "@/components/proposal-templates/edit-template-header"
import { TemplateSectionItem } from "@/components/proposal-templates/template-section-item"
import { AddSectionForm } from "@/components/proposal-templates/add-section-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Sparkles, Star } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await getProposalTemplate(id)
  return { title: template ? `${template.name} — Outpero CRM` : "Template — Outpero CRM" }
}

export default async function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await getProposalTemplate(id)

  if (!template) notFound()

  const aiCount = template.sections.filter((s) => s.isAIGenerated).length

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href="/templates">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          All templates
        </Link>
      </Button>

      {/* Header — inline editable */}
      <div className="space-y-3">
        <EditTemplateHeader template={template} />

        {/* Meta badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {template.isDefault && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Star className="h-3 w-3" />
              Default template
            </Badge>
          )}
          <Badge variant="outline" className="text-xs font-normal">
            {template.sections.length} {template.sections.length === 1 ? "section" : "sections"}
          </Badge>
          {aiCount > 0 && (
            <Badge variant="outline" className="text-xs font-normal gap-1">
              <Sparkles className="h-3 w-3" />
              {aiCount} AI-generated
            </Badge>
          )}
          {template._count.proposals > 0 && (
            <Badge variant="outline" className="text-xs font-normal">
              Used in {template._count.proposals} {template._count.proposals === 1 ? "proposal" : "proposals"}
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Sections</h2>
          <p className="text-xs text-muted-foreground">
            Drag handles replaced by ↑ ↓ — use the arrows to reorder
          </p>
        </div>

        {/* Section list */}
        {template.sections.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center">
            <p className="text-sm text-muted-foreground">No sections yet — add one below</p>
          </div>
        ) : (
          <div className="space-y-2">
            {template.sections.map((section, index) => (
              <TemplateSectionItem
                key={section.id}
                section={section}
                templateId={template.id}
                isFirst={index === 0}
                isLast={index === template.sections.length - 1}
              />
            ))}
          </div>
        )}

        {/* Add section */}
        <AddSectionForm templateId={template.id} />
      </div>

      {/* Placeholder reference */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3 space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Available placeholders</p>
        <div className="flex flex-wrap gap-2">
          {[
            "{{lead.name}}",
            "{{lead.company}}",
            "{{lead.service}}",
            "{{lead.problem}}",
            "{{lead.industry}}",
            "{{proposal.date}}",
            "{{proposal.validity}}",
          ].map((p) => (
            <code key={p} className="text-xs bg-background border rounded px-1.5 py-0.5">
              {p}
            </code>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Agency placeholders (e.g. <code className="bg-background border rounded px-1 py-0.5">{"{{agency.name}}"}</code>) will be available once Business Settings are configured.
        </p>
      </div>
    </div>
  )
}
