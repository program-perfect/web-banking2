"use client"

import { type FormEvent, useMemo, useState } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Clock3,
  CreditCard,
  FileText,
  Landmark,
  LifeBuoy,
  Lock,
  MessageCircle,
  PiggyBank,
  Plus,
  Receipt,
  Repeat,
  Search,
  Send,
  ShieldCheck,
  Target,
  Wallet,
  Zap,
} from "lucide-react"
import { Sidebar, bankingNavItems, type BankingView } from "@/components/banking/sidebar"
import { Topbar } from "@/components/banking/topbar"
import { BalanceSummary } from "@/components/banking/balance-summary"
import { AccountsStrip } from "@/components/banking/accounts-strip"
import { CardsPanel } from "@/components/banking/cards-panel"
import { TransactionsList } from "@/components/banking/transactions-list"
import { CryptoWallet } from "@/components/banking/crypto-wallet"
import { SpendingBreakdown } from "@/components/banking/spending-breakdown"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { accounts, cards, contacts, cryptoAssets, formatUsd, transactions, type Contact } from "@/lib/bank-data"
import { cn } from "@/lib/utils"

const viewCopy: Record<BankingView, { title: string; description: string }> = {
  dashboard: {
    title: "Welcome back, Alex",
    description: "Here's an overview of your money across accounts and BLOK assets.",
  },
  cards: {
    title: "Cards",
    description: "Manage physical and virtual cards, limits, frozen states and card activity.",
  },
  payments: {
    title: "Payments",
    description: "Transfer to contacts, add recipients and review payment operations.",
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

const paymentHistorySeed = [
  { id: "op-1", name: "Maria Lopez", handle: "@maria", initials: "ML", amount: -250, date: "Yesterday, 18:40", status: "pending" },
  { id: "op-2", name: "James Carter", handle: "@jcarter", initials: "JC", amount: -75, date: "Jun 17, 11:12", status: "completed" },
  { id: "op-3", name: "Sofia Reyes", handle: "@sofia", initials: "SR", amount: 120, date: "Jun 16, 09:05", status: "completed" },
]

type PaymentHistoryItem = (typeof paymentHistorySeed)[number]

type Bill = {
  id: string
  name: string
  category: string
  due: string
  amount: number
  autopay: boolean
  status: "due" | "scheduled" | "paid"
}

const bills: Bill[] = [
  { id: "b1", name: "Electric Grid", category: "Utilities", due: "Due Jun 22", amount: 148.2, autopay: true, status: "scheduled" },
  { id: "b2", name: "Fiber Internet", category: "Home", due: "Due Jun 24", amount: 79.99, autopay: true, status: "scheduled" },
  { id: "b3", name: "City Rent", category: "Housing", due: "Due Jul 01", amount: 2400, autopay: false, status: "due" },
  { id: "b4", name: "BLOK Pro", category: "Subscription", due: "Paid Jun 12", amount: 19, autopay: true, status: "paid" },
]

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

const walletOperations = [
  { id: "w1", label: "Stake reward", amount: "+42.18 VOXL", date: "Today", status: "Confirmed" },
  { id: "w2", label: "Swap PIXL to USDT", amount: "-1,200 PIXL", date: "Yesterday", status: "Confirmed" },
  { id: "w3", label: "Network fee", amount: "-0.8 VOXL", date: "Jun 16", status: "Confirmed" },
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
                "inline-flex shrink-0 items-center gap-2 border-2 px-3 py-2 text-xs font-semibold transition-all",
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
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <BalanceSummary />
        <AccountsStrip />
        <CardsPanel />
        <TransactionsList />
      </div>

      <div className="flex flex-col gap-5">
        <PaymentsMiniPanel />
        <CryptoWallet />
        <SpendingBreakdown />
      </div>
    </div>
  )
}

function PaymentsView() {
  const [people, setPeople] = useState<Contact[]>(contacts)
  const [selected, setSelected] = useState(contacts[0]?.id ?? "")
  const [amount, setAmount] = useState(100)
  const [note, setNote] = useState("")
  const [newName, setNewName] = useState("")
  const [newHandle, setNewHandle] = useState("")
  const [history, setHistory] = useState<PaymentHistoryItem[]>(paymentHistorySeed)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const selectedContact = people.find((person) => person.id === selected) ?? people[0]

  function addContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return

    const handleBase = newHandle.trim().replace(/^@/, "") || name.toLowerCase().replace(/[^a-z0-9]+/g, "")
    const newContact: Contact = {
      id: `p-${Date.now()}`,
      name,
      handle: `@${handleBase}`,
      initials: getInitials(name),
    }

    setPeople((current) => [newContact, ...current])
    setSelected(newContact.id)
    setNewName("")
    setNewHandle("")
  }

  function sendPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedContact || amount <= 0) return

    const nextItem: PaymentHistoryItem = {
      id: `op-${Date.now()}`,
      name: selectedContact.name,
      handle: selectedContact.handle,
      initials: selectedContact.initials,
      amount: -amount,
      date: "Just now",
      status: "pending",
    }

    setHistory((current) => [nextItem, ...current])
    setSentTo(selectedContact.name)
    setNote("")
    window.setTimeout(() => setSentTo(null), 1800)
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <section className="pixel-card p-5 md:p-6 lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">Transfer desk</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Send money to a contact</h2>
          </div>
          <StatusPill tone="success">Secure rail online</StatusPill>
        </div>

        <form onSubmit={sendPayment} className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {people.map((person) => {
                const isActive = selected === person.id
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setSelected(person.id)}
                    className={cn(
                      "flex items-center gap-3 border-2 p-3 text-left transition-all",
                      isActive
                        ? "border-foreground bg-accent pixel-shadow-sm"
                        : "border-border bg-card hover:border-foreground hover:bg-secondary",
                    )}
                    aria-pressed={isActive}
                  >
                    <Avatar className="h-11 w-11 rounded-none">
                      <AvatarFallback className="rounded-none bg-primary font-pixel text-[10px] text-primary-foreground">
                        {person.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{person.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{person.handle}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr]">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  className="mt-2 h-12 w-full border-2 border-foreground bg-secondary px-3 text-lg font-semibold tabular-nums outline-none focus:bg-card"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note</span>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Dinner, rent, split bill…"
                  className="mt-2 h-12 w-full border-2 border-foreground bg-secondary px-3 text-sm outline-none placeholder:text-muted-foreground focus:bg-card"
                />
              </label>
            </div>
          </div>

          <div className="border-2 border-foreground bg-secondary p-4">
            <p className="font-pixel text-[9px] uppercase text-muted-foreground">Payment preview</p>
            <div className="mt-4 space-y-3 text-sm">
              <PreviewRow label="Recipient" value={selectedContact?.name ?? "—"} />
              <PreviewRow label="Account" value="Main **** 4921" />
              <PreviewRow label="Amount" value={formatUsd(-amount)} emphasis />
              <PreviewRow label="Fee" value="$0.00" />
            </div>
            <button className="pixel-btn mt-5 inline-flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 font-pixel text-[10px] uppercase text-primary-foreground">
              {sentTo ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {sentTo ? `Sent to ${sentTo.split(" ")[0]}` : "Send payment"}
            </button>
          </div>
        </form>
      </section>

      <section className="pixel-card p-5 md:p-6">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Add contact</h2>
        </div>
        <form onSubmit={addContact} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full name</span>
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="New recipient"
              className="mt-2 h-11 w-full border-2 border-foreground bg-secondary px-3 text-sm outline-none placeholder:text-muted-foreground focus:bg-card"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Handle</span>
            <input
              value={newHandle}
              onChange={(event) => setNewHandle(event.target.value)}
              placeholder="@handle"
              className="mt-2 h-11 w-full border-2 border-foreground bg-secondary px-3 text-sm outline-none placeholder:text-muted-foreground focus:bg-card"
            />
          </label>
          <button className="pixel-btn inline-flex w-full items-center justify-center gap-2 bg-card px-4 py-3 font-pixel text-[10px] uppercase text-foreground">
            <Plus className="h-4 w-4" />
            Save contact
          </button>
        </form>

        <div className="mt-5 border-t-2 border-foreground pt-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            New recipients are stored locally for the session. The screen prop is interactive, but it does not send real money.
          </p>
        </div>
      </section>

      <section className="pixel-card p-5 md:p-6 lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Operation history</h2>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search operations"
              className="h-10 w-full border-2 border-foreground bg-secondary pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:bg-card"
            />
          </div>
        </div>
        <div className="mt-4 divide-y-2 divide-border border-2 border-foreground bg-card">
          {history.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

function CardsView() {
  const available = cards.reduce((sum, card) => sum + card.balance, 0)
  const frozenCount = cards.filter((card) => card.frozen).length

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <CardsPanel />
      </div>
      <div className="grid gap-5">
        <MetricCard icon={CreditCard} label="Available on cards" value={formatUsd(available)} detail={`${cards.length} issued cards`} />
        <MetricCard icon={Lock} label="Frozen cards" value={String(frozenCount)} detail="Instant freeze controls" />
        <section className="pixel-card p-5">
          <h2 className="text-base font-semibold text-foreground">Card controls</h2>
          <div className="mt-4 grid gap-3">
            {["Create virtual card", "Change spending limit", "Reveal card details", "Replace physical card"].map((label) => (
              <button key={label} className="flex items-center justify-between border-2 border-foreground bg-card px-3 py-3 text-sm font-semibold hover:bg-secondary">
                {label}
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </button>
            ))}
          </div>
        </section>
      </div>
      <section className="pixel-card p-5 md:p-6 lg:col-span-3">
        <h2 className="text-base font-semibold text-foreground">Recent card activity</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {transactions.slice(0, 4).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between border-2 border-border bg-secondary/60 p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{tx.merchant}</p>
                <p className="text-xs text-muted-foreground">{tx.category} · {tx.date}</p>
              </div>
              <p className={cn("text-sm font-semibold tabular-nums", tx.amount < 0 ? "text-foreground" : "text-success")}>{formatUsd(tx.amount, { sign: true })}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function WalletView() {
  const totalAssets = cryptoAssets.reduce((sum, asset) => sum + asset.amount * asset.priceUsd, 0)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <CryptoWallet />
      </div>
      <div className="grid gap-5">
        <MetricCard icon={Wallet} label="Wallet value" value={formatUsd(totalAssets)} detail="Across BLOK assets" />
        <MetricCard icon={Zap} label="Staking APY" value="4.6%" detail="Rewards settle daily" />
        <section className="pixel-card p-5">
          <h2 className="text-base font-semibold text-foreground">Chain actions</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Receive", icon: ArrowDownLeft },
              { label: "Send", icon: ArrowUpRight },
              { label: "Swap", icon: Repeat },
            ].map(({ label, icon: Icon }) => (
              <button key={label} className="flex flex-col items-center gap-2 border-2 border-foreground bg-card py-3 text-xs font-semibold hover:bg-secondary">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </button>
            ))}
          </div>
        </section>
      </div>
      <section className="pixel-card p-5 md:p-6 lg:col-span-3">
        <h2 className="text-base font-semibold text-foreground">Wallet operations</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {walletOperations.map((operation) => (
            <div key={operation.id} className="border-2 border-border bg-secondary/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{operation.label}</p>
                <StatusPill tone="success">{operation.status}</StatusPill>
              </div>
              <p className="mt-3 text-lg font-semibold tabular-nums text-foreground">{operation.amount}</p>
              <p className="mt-1 text-xs text-muted-foreground">{operation.date}</p>
            </div>
          ))}
        </div>
      </section>
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

      <section className="pixel-card p-5 md:p-6 lg:col-span-2">
        <h2 className="text-base font-semibold text-foreground">Savings vaults</h2>
        <div className="mt-4 space-y-4">
          {savingsVaults.map((vault) => {
            const progress = Math.round((vault.saved / vault.target) * 100)
            return (
              <div key={vault.id} className="border-2 border-border bg-secondary/60 p-4">
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
                <p className="mt-2 text-xs font-semibold text-muted-foreground">{progress}% complete</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="pixel-card p-5 md:p-6">
        <h2 className="text-base font-semibold text-foreground">Smart rules</h2>
        <div className="mt-4 space-y-3">
          {["Round every purchase to the next dollar", "Move 12% of salary into Emergency fund", "Boost Japan trip vault every Friday"].map((rule) => (
            <div key={rule} className="flex gap-3 border-2 border-border bg-card p-3">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm text-foreground">{rule}</p>
            </div>
          ))}
        </div>
        <button className="pixel-btn mt-5 inline-flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 font-pixel text-[10px] uppercase text-primary-foreground">
          <Plus className="h-4 w-4" />
          Add rule
        </button>
      </section>
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

      <section className="pixel-card p-5 md:p-6 lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Upcoming bills</h2>
          <button className="pixel-btn bg-primary px-3 py-2 font-pixel text-[9px] uppercase text-primary-foreground">Add bill</button>
        </div>
        <div className="mt-4 divide-y-2 divide-border border-2 border-foreground bg-card">
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
                <StatusPill tone={bill.status === "paid" ? "success" : bill.autopay ? "info" : "warning"}>
                  {bill.status === "paid" ? "Paid" : bill.autopay ? "Autopay" : "Manual"}
                </StatusPill>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pixel-card p-5 md:p-6">
        <h2 className="text-base font-semibold text-foreground">Bill health</h2>
        <div className="mt-4 space-y-3">
          <InfoLine icon={ShieldCheck} label="Payment protection" value="Active" />
          <InfoLine icon={Clock3} label="Next debit" value="Jun 22" />
          <InfoLine icon={Receipt} label="Missing invoices" value="0" />
        </div>
      </section>
    </div>
  )
}

function SupportView() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <section className="pixel-card p-5 md:p-6 lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">Help center</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">How can we help?</h2>
          </div>
          <StatusPill tone="success">Avg reply 4 min</StatusPill>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Chat with agent", icon: MessageCircle },
            { label: "Lock account", icon: Lock },
            { label: "Report a card", icon: CreditCard },
          ].map(({ label, icon: Icon }) => (
            <button key={label} className="flex min-h-28 flex-col items-start justify-between border-2 border-foreground bg-card p-4 text-left hover:bg-secondary">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">Open tickets</h3>
          <div className="mt-3 divide-y-2 divide-border border-2 border-foreground bg-card">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground">{ticket.id} · Updated {ticket.updated}</p>
                </div>
                <StatusPill tone={ticket.status === "Resolved" ? "success" : "info"}>{ticket.status}</StatusPill>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pixel-card p-5 md:p-6">
        <h2 className="text-base font-semibold text-foreground">Security checklist</h2>
        <div className="mt-4 space-y-3">
          <InfoLine icon={ShieldCheck} label="Passkey" value="Enabled" />
          <InfoLine icon={Lock} label="2FA" value="Active" />
          <InfoLine icon={BadgeCheck} label="Device trust" value="Verified" />
        </div>
        <div className="mt-5 border-2 border-foreground bg-accent p-4">
          <p className="font-pixel text-[9px] uppercase text-accent-foreground">Emergency</p>
          <p className="mt-2 text-sm leading-relaxed text-accent-foreground/80">
            Freeze cards and wallet transfers from this panel before contacting an agent.
          </p>
        </div>
      </section>
    </div>
  )
}

function PaymentsMiniPanel() {
  const recentTransfer = paymentHistorySeed[0]

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Payments</h2>
          <p className="text-xs text-muted-foreground">Contacts and transfers</p>
        </div>
        <Send className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-4 flex -space-x-2">
        {contacts.map((contact) => (
          <Avatar key={contact.id} className="h-9 w-9 rounded-none border-2 border-card">
            <AvatarFallback className="rounded-none bg-secondary text-xs font-semibold text-secondary-foreground">
              {contact.initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="mt-4 border-2 border-border bg-secondary/60 p-3">
        <p className="text-xs text-muted-foreground">Latest operation</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-foreground">{recentTransfer.name}</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatUsd(recentTransfer.amount, { sign: true })}</p>
        </div>
      </div>
    </section>
  )
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Wallet; label: string; value: string; detail: string }) {
  return (
    <section className="pixel-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </section>
  )
}

function HistoryRow({ item }: { item: PaymentHistoryItem }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 rounded-none">
          <AvatarFallback className="rounded-none bg-secondary text-xs font-semibold text-secondary-foreground">
            {item.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.handle} · {item.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-semibold tabular-nums", item.amount < 0 ? "text-foreground" : "text-success")}>
          {formatUsd(item.amount, { sign: true })}
        </p>
        <StatusPill tone={item.status === "completed" ? "success" : "warning"}>
          {item.status === "completed" ? "Completed" : "Pending"}
        </StatusPill>
      </div>
    </div>
  )
}

function PreviewRow({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold tabular-nums text-foreground", emphasis && "text-base")}>{value}</span>
    </div>
  )
}

function InfoLine({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-2 border-border bg-secondary/60 p-3">
      <span className="flex items-center gap-2 text-sm text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

function StatusPill({ children, tone }: { children: React.ReactNode; tone: "success" | "warning" | "info" }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
        tone === "success" && "border-primary bg-accent text-accent-foreground",
        tone === "warning" && "border-foreground bg-secondary text-foreground",
        tone === "info" && "border-border bg-card text-muted-foreground",
      )}
    >
      {children}
    </span>
  )
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean)
  const first = parts[0]?.[0] ?? "?"
  const second = parts[1]?.[0] ?? ""
  return `${first}${second}`.toUpperCase()
}
