import { ArrowUpRight, ArrowDownLeft, Repeat } from "lucide-react"
import { cryptoAssets, formatUsd } from "@/lib/bank-data"
import { cn } from "@/lib/utils"

const symbolStyles: Record<string, string> = {
  VOXL: "bg-primary text-primary-foreground",
  PIXL: "bg-accent text-accent-foreground",
  USDT: "bg-secondary text-secondary-foreground",
}

export function CryptoWallet() {
  const totalValue = cryptoAssets.reduce((s, a) => s + a.amount * a.priceUsd, 0)

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">BLOK Wallet</h2>
          <p className="text-xs text-muted-foreground">VOXL, PIXL and stable assets</p>
        </div>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
          On-chain
        </span>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatUsd(totalValue)}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Receive", icon: ArrowDownLeft },
          { label: "Send", icon: ArrowUpRight },
          { label: "Swap", icon: Repeat },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-secondary/50 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Icon className="h-4 w-4 text-primary" />
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-5 flex flex-col gap-1">
        {cryptoAssets.map((a) => {
          const value = a.amount * a.priceUsd
          const up = a.change24h >= 0
          return (
            <li key={a.id} className="flex items-center gap-3 rounded-xl px-1 py-2.5">
              <span
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold",
                  symbolStyles[a.symbol] ?? "bg-secondary text-secondary-foreground",
                )}
              >
                {a.symbol.slice(0, 3)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{a.name}</p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {a.amount.toLocaleString()} {a.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">{formatUsd(value)}</p>
                <p className={cn("text-xs font-medium tabular-nums", up ? "text-success" : "text-destructive")}>
                  {up ? "+" : ""}
                  {a.change24h}%
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
