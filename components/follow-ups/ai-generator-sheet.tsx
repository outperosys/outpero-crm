"use client"

import { useState, useTransition } from "react"
import { Sparkles, Copy, Check, Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { generateFollowUpDrafts } from "@/actions/ai"
import { cn } from "@/lib/utils"
import type {
  FollowUpTone,
  FollowUpLength,
  FollowUpChannel,
  FollowUpStyle,
  FollowUpVariation,
} from "@/lib/ai/types"

interface AIGeneratorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string
  leadName: string
  followUpTitle?: string
}

type GeneratorOptions = {
  tone: FollowUpTone
  length: FollowUpLength
  channel: FollowUpChannel
  style: FollowUpStyle
  customIntent: string
}

// Simple toggle button group — reused for all option rows
function OptionRow({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-40",
              value === opt.value
                ? "border-foreground bg-foreground text-background"
                : "border-input text-muted-foreground hover:border-foreground/50 hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function AIGeneratorSheet({
  open,
  onOpenChange,
  leadId,
  leadName,
  followUpTitle,
}: AIGeneratorSheetProps) {
  const [isPending, startTransition] = useTransition()
  const [opts, setOpts] = useState<GeneratorOptions>({
    tone: "professional",
    length: "medium",
    channel: "whatsapp",
    style: "direct",
    customIntent: "",
  })
  const [variations, setVariations] = useState<FollowUpVariation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<Record<number, boolean>>({})

  function set<K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) {
    setOpts((prev) => ({ ...prev, [key]: value }))
  }

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const result = await generateFollowUpDrafts(leadId, {
        tone: opts.tone,
        length: opts.length,
        channel: opts.channel,
        style: opts.style,
        customIntent: opts.customIntent.trim() || undefined,
        count: 3,
      })
      if (!result.success) {
        setError(result.error)
      } else {
        setVariations(result.data)
        setCopied({})
      }
    })
  }

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text)
    setCopied((prev) => ({ ...prev, [index]: true }))
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [index]: false }))
    }, 2000)
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setVariations([])
      setError(null)
      setCopied({})
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b px-5 py-4 gap-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <SheetTitle className="text-sm">AI Follow-up Generator</SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground pl-6">{leadName}</p>
          {followUpTitle && (
            <p className="text-xs text-muted-foreground/70 pl-6 italic truncate">
              "{followUpTitle}"
            </p>
          )}
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 space-y-5">

            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Custom Intent (optional)
                </Label>
                <Textarea
                  value={opts.customIntent}
                  onChange={(e) => set("customIntent", e.target.value)}
                  placeholder="e.g. Follow up on the proposal sent last week, ask about their timeline for decision…"
                  disabled={isPending}
                  className="text-sm min-h-[68px] resize-none"
                />
              </div>

              <OptionRow
                label="Channel"
                options={[
                  { value: "whatsapp", label: "WhatsApp" },
                  { value: "email", label: "Email" },
                ]}
                value={opts.channel}
                onChange={(v) => set("channel", v as FollowUpChannel)}
                disabled={isPending}
              />

              <OptionRow
                label="Tone"
                options={[
                  { value: "professional", label: "Professional" },
                  { value: "friendly", label: "Friendly" },
                  { value: "assertive", label: "Assertive" },
                ]}
                value={opts.tone}
                onChange={(v) => set("tone", v as FollowUpTone)}
                disabled={isPending}
              />

              <OptionRow
                label="Length"
                options={[
                  { value: "short", label: "Short" },
                  { value: "medium", label: "Medium" },
                  { value: "detailed", label: "Detailed" },
                ]}
                value={opts.length}
                onChange={(v) => set("length", v as FollowUpLength)}
                disabled={isPending}
              />

              <OptionRow
                label="Style"
                options={[
                  { value: "soft", label: "Soft" },
                  { value: "direct", label: "Direct" },
                  { value: "urgent", label: "Urgent" },
                ]}
                value={opts.style}
                onChange={(v) => set("style", v as FollowUpStyle)}
                disabled={isPending}
              />
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={isPending}
              className="w-full gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {variations.length > 0 ? "Regenerate" : "Generate Messages"}
                </>
              )}
            </Button>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
                {error}
              </p>
            )}

            {/* Loading placeholder */}
            {isPending && (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Crafting personalized messages…
              </div>
            )}

            {/* Variations output */}
            {!isPending && variations.length > 0 && (
              <div className="space-y-3 border-t pt-5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {variations.length} Variations — Copy &amp; Paste
                </p>

                {variations.map((variation, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-muted/20 overflow-hidden"
                  >
                    {/* Variation header */}
                    <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {variation.label}
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleCopy(variation.message, index)}
                        className={cn(
                          "gap-1.5 text-xs",
                          copied[index] && "text-green-600 dark:text-green-400"
                        )}
                      >
                        {copied[index] ? (
                          <>
                            <Check className="size-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Message text */}
                    <div className="px-3 py-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                        {variation.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
