import { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type PixelCardProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article" | "header"
  title?: string
  eyebrow?: string
  action?: ReactNode
}

export function PixelCard({
  as: Comp = "section",
  title,
  eyebrow,
  action,
  className,
  children,
  ...props
}: PixelCardProps) {
  return (
    <Comp className={cn("pixel-card p-5 md:p-6", className)} {...props}>
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

export function PixelButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "pixel-btn inline-flex cursor-pointer items-center justify-center gap-2 bg-card px-4 py-2.5 font-pixel text-[10px] uppercase text-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function PixelInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full border-2 border-foreground bg-secondary px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:bg-card",
        className,
      )}
      {...props}
    />
  )
}

export function PixelStatus({
  children,
  tone = "info",
}: {
  children: ReactNode
  tone?: "success" | "warning" | "info" | "danger"
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center border-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
        tone === "success" && "border-foreground bg-accent text-accent-foreground",
        tone === "warning" && "border-foreground bg-secondary text-foreground",
        tone === "info" && "border-foreground bg-card text-muted-foreground",
        tone === "danger" && "border-foreground bg-destructive text-primary-foreground",
      )}
    >
      {children}
    </span>
  )
}

export function PixelSkeleton({ className }: { className?: string }) {
  return <div className={cn("border-2 border-foreground bg-secondary pixel-skeleton", className)} />
}
