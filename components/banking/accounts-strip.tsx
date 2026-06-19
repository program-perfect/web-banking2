import { Landmark, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { accounts, type Account } from "@/lib/bank-data"
import { cn } from "@/lib/utils"
import { AnimatedAmount } from "./animated-amount"

const iconFor = {
  Текущий: Landmark,
  Накопительный: PiggyBank,
  Крипто: Wallet,
} satisfies Record<Account["type"], typeof Wallet>

export function AccountsStrip() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {accounts.map((acc) => {
        const Icon = iconFor[acc.type]
        const up = acc.delta >= 0
        return (
          <div key={acc.id} className="pixel-card p-4 transition-transform duration-150 hover:-translate-x-px hover:-translate-y-px">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className={cn("inline-flex items-center gap-1 font-pixel text-[9px]", up ? "text-success" : "text-destructive")}>
                {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {up ? "+" : ""}{acc.delta}%
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">{acc.name}</p>
            <AnimatedAmount value={acc.balance} animateOnMount className="block font-pixel text-sm text-foreground tabular-nums" />
            <p className="mt-1 font-mono text-xs text-muted-foreground">{acc.type} · {acc.number}</p>
          </div>
        )
      })}
    </section>
  )
}
