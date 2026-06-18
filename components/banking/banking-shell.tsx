"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  FileText,
  Landmark,
  LifeBuoy,
  Lock,
  PiggyBank,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Target,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Sidebar, bankingNavItems, type BankingView } from "@/components/banking/sidebar"
import { Topbar } from "@/components/banking/topbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { accounts, cards, contacts, cryptoAssets, formatUsd, transactions } from "@/lib/bank-data"
import { cn } from "@/lib/utils"
import { PixelButton, PixelCard, PixelInput, PixelSkeleton, PixelStatus } from "@/components/banking/pixel-ui"

const viewCopy: Record<BankingView, { title: string; description: string }> = {
  dashboard: {
    title: "Welcome back, Alex",
    description: "A single pixel-banking system for balances, cards, payments and BLOK assets.",
  },
  cards: {
    title: "Cards",
    description: "Manage physical and virtual cards, limits, frozen states and card activity.",
  },
  payments: {
    title: "Payments",
    description: "Start transfers, open operation pages and review payment history.",
  },
  wallet: {
    title: "BLOK Wallet",
    description: "Track holdings, staking rewards and chain actions from one wallet view.",
  },
  savings: {
    title: "Savings",
    description: "Follow vault progress, automatic rules and long-term goals.",
  },
  bills: {
    title: "Bills",
    description: "See upcoming bills, autopay status and recent bill payments.",
  },
  support: {
    title: "Support",
    description: "Open tickets, security help and fast answers from the support desk.",
  },
}

type Operation = {
  id: string
  name: string
  handle: string
  initials: string
  amount: number
  date: string
  status: "completed" | "pending"
  method: "Contact" | "Card" | "Phone"
}

const paymentHistory: Operation[] = [
  { id: "op-1", name: "Maria Lopez", handle: "@maria", initials: "ML", amount: -250, date: "Yesterday, 18:40", status: "pending", method: "Contact" },
  { id: "op-2", name: "James Carter", handle: "@jcarter", initials: "JC", amount: -75, date: "Jun 17, 11:12", status: "completed", method: "Card" },
  { id: "op-3", name: "Sofia Reyes", handle: "@sofia", initials: "SR", amount: 120, date: "Jun 16, 09:05", status: "completed", method: "Phone" },
]

const bills = [
  { id: "b1", name: "Electric Grid", category: "Utilities", due: "Due Jun 22", amount: 148.2, autopay: true, status: "scheduled" },
  { id: "b2", name: "Fiber Internet", category: "Home", due: "Due Jun 24", amount: 79.99, autopay: true, status: "scheduled" },
  { id: "b3", name: "City Rent", category: "Housing", due: "Due Jul 01", amount: 2400, autopay: false, status: "due" },
  { id: "b4", name: "BLOK Pro", category: "Subscription", due: "Paid Jun 12", amount: 19, autopay: true, status: "paid" },
] as const

const savingsVaults = [
  { id: "sv1", name: "Emergency fund", target: 18000, saved: 12480, rule: "$400 monthly", apy: "4.6%" },
  { id: "sv2", name: "Japan trip", target: 6500, saved: 3920, rule: "$75 weekly", apy: "3.8%" },
  { id: "sv3", name: "New hardware", target: 4200, saved: 3180, rule: "Round-ups", apy: "2.4%" },
]

const supportTickets = [
  { id: "SUP-1042", title: "Travel card limit review", status: "Waiting for agent", updated: "12 min ago" },
  { id: "SUP-1039", title: "Merchant refund trace", status: "In progress", updated: "Today" },
  { id: "SUP-1028", title: "New device approval", status: "Resolved", updated: "Jun 15" },
]

export function BankingShell() {
  const [activeView, setActiveView] = useState<BankingView>("dashboard")
  const current = viewCopy[activeView]

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar active={activeView} onNavigate={setActiveView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <MobileTabs active={activeView} onNavigate={setActiveView} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">{current.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
          </div>

          {activeView === "dashboard" && <DashboardView />}
          {activeView === "payments" && <PaymentsView />}
          {activeView === "cards" && <CardsView />}
          {activeView === "wallet" && <WalletView />}
          {activeView === "savings" && <SavingsView />}
          {activeView === "bills" && <BillsView />}
          {activeView === "support" && <SupportView />}
        </main>
      </div>
    </div>
  )
}

function MobileTabs({ active, onNavigate }: { active: BankingView; onNavigate: (view: BankingView) => void }) {
  return (
    <div className="border-b-2 border-foreground bg-background px-4 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[...bankingNavItems, { id: "support" as const, label: "Support", icon: LifeBuoy }].map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-2 border-2 px-3 py-2 text-xs font-semibold transition-all",
                isActive
                  ? "border-foreground bg-primary text-primary-foreground pixel-shadow-sm"
                  : "border-foreground bg-card text-foreground hover:bg-secondary",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DashboardView() {
  const total = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <PixelCard className="lg:col-span-2" eyebrow="Total balance" title={formatUsd(total)} action={<PixelStatus tone="success">+6.8% month</PixelStatus>}>
        <div className="grid gap-3 md:grid-cols-3">
          {accounts.map((account) => (
            <div key={account.id} className="border-2 border-foreground bg-secondary p-4">
              <p className="text-sm font-semibold text-foreground">{account.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{account.type} · {account.number}</p>
              <p className="mt-4 text-lg font-semibold tabular-nums text-foreground">{formatUsd(account.balance)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <NewTransferButton className="bg-primary text-primary-foreground" />
          <PixelButton>
            <ArrowDownLeft className="h-4 w-4" />
            Request
          </PixelButton>
        </div>
      </PixelCard>

      <PixelCard title="Payments" eyebrow="Quick access">
        <div className="flex -space-x-2">
          {contacts.map((contact) => (
            <Avatar key={contact.id} className="h-10 w-10 rounded-none border-2 border-foreground">
              <AvatarFallback className="rounded-none bg-secondary text-xs font-semibold text-secondary-foreground">
                {contact.initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Link href={`/payments/${paymentHistory[0].id}`} className="mt-4 flex cursor-pointer items-center justify-between border-2 border-foreground bg-secondary p-3 hover:bg-card">
          <span>
            <span className="block text-sm font-semibold text-foreground">Latest operation</span>
            <span className="block text-xs text-muted-foreground">{paymentHistory[0].name}</span>
          </span>
          <span className="text-sm font-semibold tabular-nums text-foreground">{formatUsd(paymentHistory[0].amount, { sign: true })}</span>
        </Link>
      </PixelCard>

      <div className="grid gap-5 lg:col-span-3 md:grid-cols-3">
        <MetricCard icon={CreditCard} label="Cards" value={String(cards.length)} detail="Physical and virtual cards" />
        <MetricCard icon={Wallet} label="BLOK wallet" value={formatUsd(cryptoAssets.reduce((sum, asset) => sum + asset.amount * asset.priceUsd, 0))} detail="Assets and staking" />
        <MetricCard icon={Receipt} label="Upcoming bills" value={formatUsd(bills.filter((bill) => bill.status !== "paid").reduce((sum, bill) => sum + bill.amount, 0))} detail="Next 30 days" />
      </div>

      <PixelCard className="lg:col-span-3" title="Recent activity" action={<PixelStatus tone="info">Live ledger</PixelStatus>}>
        <div className="divide-y-2 divide-border border-2 border-foreground bg-card">
          {transactions.slice(0, 5).map((tx) => (
            <LedgerRow
              key={tx.id}
              title={tx.merchant}
              subtitle={`${tx.category} · ${tx.date}`}
              amount={formatUsd(tx.amount, { sign: true })}
              positive={tx.amount > 0}
            />
          ))}
        </div>
      </PixelCard>
    </div>
  )
}

function PaymentsView() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <PixelCard className="lg:col-span-2" eyebrow="New operation" title="Transfer money">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="border-2 border-foreground bg-secondary p-4">
            <p className="text-sm leading-relaxed text-foreground">
              A transfer now opens as its own dynamic operation page. Recipient selection happens there:
              from contacts, card number or phone number.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <TransferMethodCard label="Contacts" value={`${contacts.length} saved`} />
              <TransferMethodCard label="Card number" value="Any bank card" />
              <TransferMethodCard label="Phone" value="Fast lookup" />
            </div>
          </div>
          <div className="flex flex-col justify-between border-2 border-foreground bg-card p-4">
            <div>
              <p className="font-pixel text-[9px] uppercase text-muted-foreground">Start</p>
              <p className="mt-2 text-sm text-foreground">Create a payment draft with its own slug and receipt page.</p>
            </div>
            <NewTransferButton className="mt-4 w-full bg-primary text-primary-foreground" />
          </div>
        </div>
      </PixelCard>

      <PixelCard title="Skeleton preview" eyebrow="Loading states">
        <div className="space-y-3">
          <PixelSkeleton className="h-10" />
          <PixelSkeleton className="h-20" />
          <PixelSkeleton className="h-10 w-2/3" />
        </div>
      </PixelCard>

      <PixelCard className="lg:col-span-3" title="Operation history" action={<SearchBox />}>
        <div className="divide-y-2 divide-border border-2 border-foreground bg-card">
          {paymentHistory.map((operation) => (
            <Link key={operation.id} href={`/payments/${operation.id}`} className="block cursor-pointer hover:bg-secondary">
              <HistoryRow operation={operation} />
            </Link>
          ))}
        </div>
      </PixelCard>
    </div>
  )
}

function CardsView() {
  const available = cards.reduce((sum, card) => sum + card.balance, 0)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <MetricCard icon={CreditCard} label="Available on cards" value={formatUsd(available)} detail={`${cards.length} issued cards`} />
      <MetricCard icon={Lock} label="Frozen cards" value={String(cards.filter((card) => card.frozen).length)} detail="Instant freeze controls" />
      <MetricCard icon={ShieldCheck} label="3DS protection" value="Active" detail="Every online payment" />

      <PixelCard className="lg:col-span-3" title="Cards">
        <div className="grid gap-4 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className="flex min-h-48 flex-col justify-between border-2 border-foreground bg-secondary p-5 pixel-shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{card.label}</p>
                  <p className="text-xs text-muted-foreground">{card.network}</p>
                </div>
                <PixelStatus tone={card.frozen ? "warning" : "success"}>{card.frozen ? "Frozen" : "Active"}</PixelStatus>
              </div>
              <p className="font-mono text-lg tracking-[0.18em] text-foreground">•••• {card.last4}</p>
              <div className="flex items-end justify-between gap-3">
                <span>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Holder</span>
                  <span className="block text-sm font-semibold text-foreground">{card.holder}</span>
                </span>
                <span className="text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Expires</span>
                  <span className="block text-sm font-semibold text-foreground">{card.expiry}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </PixelCard>

      <PixelCard className="lg:col-span-3" title="Card activity">
        <div className="grid gap-3 md:grid-cols-2">
          {transactions.slice(0, 6).map((tx) => (
            <LedgerRow key={tx.id} title={tx.merchant} subtitle={`${tx.category} · ${tx.date}`} amount={formatUsd(tx.amount, { sign: true })} positive={tx.amount > 0} />
          ))}
        </div>
      </PixelCard>
    </div>
  )
}

function WalletView() {
  const totalAssets = cryptoAssets.reduce((sum, asset) => sum + asset.amount * asset.priceUsd, 0)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <MetricCard icon={Wallet} label="Wallet value" value={formatUsd(totalAssets)} detail="Across BLOK assets" />
      <MetricCard icon={Zap} label="Staking APY" value="4.6%" detail="Rewards settle daily" />
      <MetricCard icon={ArrowUpRight} label="24h movement" value="+7.2%" detail="Portfolio weighted" />

      <PixelCard className="lg:col-span-2" title="Assets" action={<PixelStatus tone="success">On-chain</PixelStatus>}>
        <div className="divide-y-2 divide-border border-2 border-foreground bg-card">
          {cryptoAssets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary font-pixel text-[9px]">
                  {asset.symbol.slice(0, 3)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">{asset.amount.toLocaleString()} {asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">{formatUsd(asset.amount * asset.priceUsd)}</p>
                <p className={cn("text-xs font-semibold", asset.change24h >= 0 ? "text-success" : "text-destructive")}>{asset.change24h >= 0 ? "+" : ""}{asset.change24h}%</p>
              </div>
            </div>
          ))}
        </div>
      </PixelCard>

      <PixelCard title="Chain actions">
        <div className="grid gap-3">
          {["Receive", "Send", "Swap", "Stake"].map((label) => (
            <PixelButton key={label} className="w-full justify-between">
              {label}
              <ArrowUpRight className="h-4 w-4" />
            </PixelButton>
          ))}
        </div>
      </PixelCard>
    </div>
  )
}

function SavingsView() {
  const savedTotal = savingsVaults.reduce((sum, vault) => sum + vault.saved, 0)
  const targetTotal = savingsVaults.reduce((sum, vault) => sum + vault.target, 0)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <MetricCard icon={PiggyBank} label="Saved total" value={formatUsd(savedTotal)} detail={`${Math.round((savedTotal / targetTotal) * 100)}% of all goals`} />
      <MetricCard icon={Target} label="Target total" value={formatUsd(targetTotal)} detail="3 active vaults" />
      <MetricCard icon={Landmark} label="Monthly auto-save" value="$700" detail="Rules active" />

      <PixelCard className="lg:col-span-2" title="Savings vaults">
        <div className="space-y-4">
          {savingsVaults.map((vault) => {
            const progress = Math.round((vault.saved / vault.target) * 100)
            return (
              <div key={vault.id} className="border-2 border-foreground bg-secondary p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{vault.name}</p>
                    <p className="text-xs text-muted-foreground">{vault.rule} · {vault.apy} APY</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-foreground">{formatUsd(vault.saved)} / {formatUsd(vault.target)}</p>
                </div>
                <div className="mt-4 h-3 border-2 border-foreground bg-card">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </PixelCard>

      <PixelCard title="Smart rules">
        <div className="space-y-3">
          {["Round every purchase", "Move 12% of salary", "Boost every Friday"].map((rule) => (
            <div key={rule} className="flex gap-3 border-2 border-foreground bg-secondary p-3">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm text-foreground">{rule}</p>
            </div>
          ))}
        </div>
      </PixelCard>
    </div>
  )
}

function BillsView() {
  const upcomingTotal = bills.filter((bill) => bill.status !== "paid").reduce((sum, bill) => sum + bill.amount, 0)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <MetricCard icon={Receipt} label="Upcoming" value={formatUsd(upcomingTotal)} detail="Next 30 days" />
      <MetricCard icon={CalendarClock} label="Autopay enabled" value="3" detail="No missed bills" />
      <MetricCard icon={FileText} label="Paid this month" value="$19.00" detail="1 bill settled" />

      <PixelCard className="lg:col-span-3" title="Bills" action={<PixelButton><Plus className="h-4 w-4" />Add bill</PixelButton>}>
        <div className="divide-y-2 divide-border border-2 border-foreground bg-card">
          {bills.map((bill) => (
            <div key={bill.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary">
                  <Receipt className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">{bill.category} · {bill.due}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">{formatUsd(bill.amount)}</p>
                <PixelStatus tone={bill.status === "paid" ? "success" : bill.autopay ? "info" : "warning"}>
                  {bill.status === "paid" ? "Paid" : bill.autopay ? "Autopay" : "Manual"}
                </PixelStatus>
              </div>
            </div>
          ))}
        </div>
      </PixelCard>
    </div>
  )
}

function SupportView() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <PixelCard className="lg:col-span-2" eyebrow="Help center" title="How can we help?" action={<PixelStatus tone="success">Avg reply 4 min</PixelStatus>}>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Chat with agent", icon: LifeBuoy },
            { label: "Lock account", icon: Lock },
            { label: "Report a card", icon: CreditCard },
          ].map(({ label, icon: Icon }) => (
            <button key={label} className="flex min-h-28 cursor-pointer flex-col items-start justify-between border-2 border-foreground bg-card p-4 text-left hover:bg-secondary">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 divide-y-2 divide-border border-2 border-foreground bg-card">
          {supportTickets.map((ticket) => (
            <div key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{ticket.title}</p>
                <p className="text-xs text-muted-foreground">{ticket.id} · Updated {ticket.updated}</p>
              </div>
              <PixelStatus tone={ticket.status === "Resolved" ? "success" : "info"}>{ticket.status}</PixelStatus>
            </div>
          ))}
        </div>
      </PixelCard>

      <PixelCard title="Security checklist">
        <div className="space-y-3">
          <InfoLine icon={ShieldCheck} label="Passkey" value="Enabled" />
          <InfoLine icon={Lock} label="2FA" value="Active" />
          <InfoLine icon={BadgeCheck} label="Device trust" value="Verified" />
        </div>
      </PixelCard>
    </div>
  )
}

function NewTransferButton({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <PixelButton
      className={className}
      onClick={() => router.push(`/payments/tr-${Date.now().toString(36)}`)}
    >
      <ArrowUpRight className="h-4 w-4" />
      New transfer
    </PixelButton>
  )
}

function TransferMethodCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-foreground bg-card p-3">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{value}</p>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <PixelCard>
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </PixelCard>
  )
}

function LedgerRow({ title, subtitle, amount, positive }: { title: string; subtitle: string; amount: string; positive?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <p className={cn("text-sm font-semibold tabular-nums", positive ? "text-success" : "text-foreground")}>{amount}</p>
    </div>
  )
}

function HistoryRow({ operation }: { operation: Operation }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 rounded-none">
          <AvatarFallback className="rounded-none bg-secondary text-xs font-semibold text-secondary-foreground">
            {operation.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{operation.name}</p>
          <p className="text-xs text-muted-foreground">{operation.method} · {operation.handle} · {operation.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-semibold tabular-nums", operation.amount < 0 ? "text-foreground" : "text-success")}>
          {formatUsd(operation.amount, { sign: true })}
        </p>
        <PixelStatus tone={operation.status === "completed" ? "success" : "warning"}>
          {operation.status === "completed" ? "Completed" : "Pending"}
        </PixelStatus>
      </div>
    </div>
  )
}

function InfoLine({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-2 border-foreground bg-secondary p-3">
      <span className="flex items-center gap-2 text-sm text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

function SearchBox() {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <PixelInput placeholder="Search operations" className="pl-9" />
    </div>
  )
}
