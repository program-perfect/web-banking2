"use client"

import { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react"
import { AnimatedAmount } from "@/components/banking/animated-amount"
import { cn } from "@/lib/utils"

type PixelCardProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article" | "header"
  title?: ReactNode
  eyebrow?: string
  action?: ReactNode
}

export function PixelCard({ as: Comp = "section", title, eyebrow, action, className, children, ...props }: PixelCardProps) {
  return (
    <Comp className={cn("pixel-card animate-view-enter p-5 transition-all duration-200 ease-out md:p-6", className)} {...props}>
      {(title || eyebrow || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {eyebrow && <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-base font-semibold text-foreground">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </Comp>
  )
}

export function PixelButton({ className, children, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn("pixel-btn pixel-pressable inline-flex cursor-pointer items-center justify-center gap-2 bg-card px-4 py-2.5 font-pixel text-[10px] uppercase text-foreground transition-all disabled:cursor-not-allowed disabled:opacity-50", className)} data-cursor={disabled ? "disabled" : "pointer"} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export function PixelInput({ className, disabled, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full border-2 border-foreground bg-secondary px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-card disabled:opacity-50", className)} data-cursor={disabled ? "disabled" : "text"} disabled={disabled} {...props} />
}

export function PixelStatus({ children, tone = "info" }: { children: ReactNode; tone?: "success" | "warning" | "info" | "danger" }) {
  return (
    <span className={cn("inline-flex w-fit items-center border-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all", tone === "success" && "border-foreground bg-accent text-accent-foreground", tone === "warning" && "border-foreground bg-secondary text-foreground", tone === "info" && "border-foreground bg-card text-muted-foreground", tone === "danger" && "border-foreground bg-destructive text-primary-foreground")}>{children}</span>
  )
}

export function PixelAmount({ value, sign, className }: { value: number; sign?: boolean; className?: string }) {
  return <AnimatedAmount value={value} sign={sign} animateOnMount className={cn("inline-block tabular-nums", className)} />
}

export function PixelFigure({ value, suffix, sign, className }: { value: number; suffix?: string; sign?: boolean; className?: string }) {
  return <AnimatedAmount value={value} currency={false} sign={sign} suffix={suffix} animateOnMount className={cn("inline-block tabular-nums", className)} />
}

export function PixelSkeleton({ className }: { className?: string }) {
  return <div className={cn("pixel-skeleton border-2 border-foreground bg-secondary", className)} aria-hidden />
}

export function PixelLoader({ variant = "bars", label, className }: { variant?: "bars" | "coin" | "dots" | "card" | "orbit"; label?: string; className?: string }) {
  const safeLabel = label ?? "Загрузка"
  if (variant === "coin" || variant === "card") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 text-center", className)} role="status" aria-label={safeLabel} data-cursor="wait">
        <div className={variant === "card" ? "pixel-loader--card" : "pixel-loader--coin"} aria-hidden />
        {label && <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>}
      </div>
    )
  }

  if (variant === "orbit") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 text-center", className)} role="status" aria-label={safeLabel} data-cursor="wait">
        <div className="pixel-loader--orbit" aria-hidden><span /><span /><span /><span /></div>
        {label && <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>}
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("inline-flex items-center gap-3", className)} role="status" aria-label={safeLabel} data-cursor="wait">
        <div className="pixel-loader--dots" aria-hidden><span /><span /><span /></div>
        {label && <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-center", className)} role="status" aria-label={safeLabel} data-cursor="wait">
      <div className="pixel-loader" aria-hidden><span /><span /><span /><span /></div>
      {label && <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>}
    </div>
  )
}

export function PixelSkeletonText({ lines = 3 }: { lines?: number }) {
  return <div className="space-y-2">{Array.from({ length: lines }).map((_, index) => <PixelSkeleton key={index} className={cn("h-4", index === lines - 1 && "w-2/3")} />)}</div>
}

export function PixelSkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <PixelCard aria-busy="true">
      <div className="space-y-4">
        <PixelLoader variant={tall ? "card" : "dots"} label="Загрузка" />
        <PixelSkeleton className={cn("h-12 w-2/3", tall && "h-24")} />
        <PixelSkeletonText lines={3} />
      </div>
    </PixelCard>
  )
}
