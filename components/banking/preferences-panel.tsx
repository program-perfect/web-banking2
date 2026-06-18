"use client"

import { useState } from "react"
import { MousePointer2, Palette, Sparkles, Zap, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { PixelCard, PixelLoader, PixelSkeleton, PixelStatus } from "@/components/banking/pixel-ui"

const motionItems = [
  { id: "transitions", label: "Smooth page transitions", detail: "Fade and slide between screens", defaultOn: true },
  { id: "number-flow", label: "Number Flow", detail: "Animated balances and counters", defaultOn: true },
  { id: "pixel-loaders", label: "Pixel-art loaders", detail: "Neo-brutalist pending states", defaultOn: true },
  { id: "calm", label: "Calm motion", detail: "Reduce big movement", defaultOn: false },
]

const themes = [
  { id: "system", label: "System", detail: "Follow device appearance" },
  { id: "light", label: "Light", detail: "Bright interface" },
  { id: "dark", label: "Dark", detail: "High contrast interface" },
]

const cursors = [
  { id: "pixel", label: "Pixel macOS cursor", detail: "Smooth custom pointer" },
  { id: "native", label: "Native cursor fallback", detail: "Browser default when needed" },
  { id: "large", label: "Large pixel cursor", detail: "Better for demo screens" },
]

export function PreferencesPanel() {
  const [theme, setTheme] = useState("system")
  const [cursor, setCursor] = useState("pixel")
  const [motion, setMotion] = useState<Record<string, boolean>>(
    Object.fromEntries(motionItems.map((item) => [item.id, item.defaultOn])),
  )

  function toggleMotion(id: string) {
    setMotion((current) => ({ ...current, [id]: !current[id] }))
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <PixelCard className="lg:col-span-2" eyebrow="Control center" title="Preferences" action={<PixelStatus tone="success">Live preview</PixelStatus>}>
        <div className="grid gap-4 md:grid-cols-3">
          <PreviewTile icon={Palette} label="Theme" value={themes.find((item) => item.id === theme)?.label ?? "System"} />
          <PreviewTile icon={Sparkles} label="Motion" value={`${Object.values(motion).filter(Boolean).length}/${motionItems.length} enabled`} />
          <PreviewTile icon={MousePointer2} label="Cursor" value={cursors.find((item) => item.id === cursor)?.label ?? "Pixel"} />
        </div>

        <div className="mt-5 border-2 border-foreground bg-secondary p-4">
          <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">Skeleton preview</p>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="space-y-3">
              <PixelSkeleton className="h-8" />
              <PixelSkeleton className="h-20" />
              <PixelSkeleton className="h-8 w-2/3" />
            </div>
            <PixelLoader variant={motion["pixel-loaders"] ? "card" : "dots"} label="Loading UI" />
          </div>
        </div>
      </PixelCard>

      <PixelCard title="Interface" eyebrow="Base">
        <div className="space-y-3">
          <InfoLine icon={Zap} label="Density" value="Comfortable" />
          <InfoLine icon={Palette} label="Contrast" value="Neo-brutal" />
          <InfoLine icon={MousePointer2} label="Pointer" value={cursor === "pixel" ? "Custom" : "Fallback"} />
        </div>
      </PixelCard>

      <PixelCard className="lg:col-span-2" title="Animation controls" eyebrow="Motion">
        <div className="grid gap-3 md:grid-cols-2">
          {motionItems.map((option) => (
            <ToggleCard
              key={option.id}
              label={option.label}
              detail={option.detail}
              checked={motion[option.id]}
              onToggle={() => toggleMotion(option.id)}
            />
          ))}
        </div>
      </PixelCard>

      <PixelCard title="Cursor controls" eyebrow="Pointer">
        <div className="space-y-3">
          {cursors.map((option) => (
            <SelectRow
              key={option.id}
              label={option.label}
              detail={option.detail}
              active={cursor === option.id}
              onSelect={() => setCursor(option.id)}
            />
          ))}
        </div>
      </PixelCard>

      <PixelCard className="lg:col-span-3" title="Theme controls" eyebrow="Appearance">
        <div className="grid gap-3 md:grid-cols-3">
          {themes.map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={cn(
                "min-h-36 cursor-pointer border-2 border-foreground bg-card p-4 text-left transition-all hover:-translate-y-1 hover:pixel-shadow-sm",
                theme === option.id && "bg-primary text-primary-foreground pixel-shadow-sm",
              )}
              aria-pressed={theme === option.id}
            >
              <Palette className="h-5 w-5" />
              <span className="mt-8 block text-sm font-semibold">{option.label}</span>
              <span className={cn("mt-1 block text-xs", theme === option.id ? "text-primary-foreground/75" : "text-muted-foreground")}>
                {option.detail}
              </span>
            </button>
          ))}
        </div>
      </PixelCard>
    </div>
  )
}

function PreviewTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="border-2 border-foreground bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function ToggleCard({ label, detail, checked, onToggle }: { label: string; detail: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex min-h-32 cursor-pointer flex-col justify-between border-2 border-foreground bg-card p-4 text-left transition-all hover:-translate-y-1 hover:pixel-shadow-sm"
      aria-pressed={checked}
    >
      <span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{detail}</span>
      </span>
      <span className="mt-4 flex items-center justify-between gap-3">
        <PixelStatus tone={checked ? "success" : "warning"}>{checked ? "Enabled" : "Off"}</PixelStatus>
        <span className={cn("h-7 w-12 border-2 border-foreground p-1", checked ? "bg-primary" : "bg-secondary")}>
          <span className={cn("block h-full w-5 border-2 border-foreground bg-card transition-transform", checked && "translate-x-4")} />
        </span>
      </span>
    </button>
  )
}

function SelectRow({ label, detail, active, onSelect }: { label: string; detail: string; active: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full cursor-pointer border-2 border-foreground p-3 text-left transition-all hover:-translate-y-0.5",
        active ? "bg-primary text-primary-foreground pixel-shadow-sm" : "bg-card text-foreground",
      )}
      aria-pressed={active}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className={cn("mt-1 block text-xs", active ? "text-primary-foreground/75" : "text-muted-foreground")}>{detail}</span>
    </button>
  )
}

function InfoLine({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-2 border-foreground bg-secondary p-3">
      <span className="flex items-center gap-2 text-sm text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}
