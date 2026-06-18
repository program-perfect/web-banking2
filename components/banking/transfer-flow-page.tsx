"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  CreditCard,
  Download,
  Home,
  Phone,
  Receipt,
  Repeat,
  Send,
  Share2,
  UserRound,
  Wallet,
} from "lucide-react"
import { Topbar } from "@/components/banking/topbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { contacts, formatUsd } from "@/lib/bank-data"
import { cn } from "@/lib/utils"
import { PixelButton, PixelCard, PixelInput, PixelSkeleton, PixelStatus } from "@/components/banking/pixel-ui"

type TransferStep = "recipient" | "amount" | "review" | "processing" | "success"
type RecipientMethod = "contact" | "card" | "phone"

type TransferRecord = {
  id: string
  recipient: string
  recipientHandle: string
  initials: string
  method: RecipientMethod
  amount: number
  fee: number
  source: string
  status: "completed" | "pending"
  createdAt: string
  operationCode: string
  bank: string
  purpose: string
}

const existingTransfers: Record<string, TransferRecord> = {
  "op-1": {
    id: "op-1",
    recipient: "Maria Lopez",
    recipientHandle: "@maria",
    initials: "ML",
    method: "contact",
    amount: 250,
    fee: 0,
    source: "Main account · **** 4921",
    status: "pending",
    createdAt: "Yesterday, 18:40",
    operationCode: "VX-2026-OP1-8842",
    bank: "VOXEL Internal Rail",
    purpose: "Private transfer",
  },
  "op-2": {
    id: "op-2",
    recipient: "James Carter",
    recipientHandle: "Card · **** 9021",
    initials: "JC",
    method: "card",
    amount: 75,
    fee: 0,
    source: "Main account · **** 4921",
    status: "completed",
    createdAt: "Jun 17, 11:12",
    operationCode: "VX-2026-OP2-3811",
    bank: "External card network",
    purpose: "Card-to-card transfer",
  },
  "op-3": {
    id: "op-3",
    recipient: "Sofia Reyes",
    recipientHandle: "+1 555 011 489",
    initials: "SR",
    method: "phone",
    amount: 120,
    fee: 0,
    source: "Main account · **** 4921",
    status: "completed",
    createdAt: "Jun 16, 09:05",
    operationCode: "VX-2026-OP3-1297",
    bank: "Phone lookup rail",
    purpose: "Phone transfer",
  },
}

const stepOrder: TransferStep[] = ["recipient", "amount", "review", "processing", "success"]

export function TransferFlowPage({ transferId }: { transferId: string }) {
  const router = useRouter()
  const transferFromHistory = existingTransfers[transferId]
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<TransferStep>(transferFromHistory ? "success" : "recipient")
  const [direction, setDirection] = useState<1 | -1>(1)
  const [method, setMethod] = useState<RecipientMethod>("contact")
  const [selectedContact, setSelectedContact] = useState(contacts[0]?.id ?? "")
  const [cardNumber, setCardNumber] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState(250)
  const [purpose, setPurpose] = useState("Private transfer")
  const [showReceipt, setShowReceipt] = useState(Boolean(transferFromHistory))

  const operationCode = useMemo(() => `VX-${transferId.toUpperCase().replace(/[^A-Z0-9]/g, "-")}`, [transferId])
  const contact = contacts.find((item) => item.id === selectedContact) ?? contacts[0]

  const draft: TransferRecord = transferFromHistory ?? {
    id: transferId,
    recipient: method === "contact" ? contact?.name ?? "Recipient" : method === "card" ? "Card recipient" : "Phone recipient",
    recipientHandle: method === "contact" ? contact?.handle ?? "@recipient" : method === "card" ? maskCard(cardNumber) : phoneNumber || "+1 ___ ___ ____",
    initials: method === "contact" ? contact?.initials ?? "RX" : method === "card" ? "CR" : "PH",
    method,
    amount,
    fee: 0,
    source: "Main account · **** 4921",
    status: step === "success" ? "completed" : "pending",
    createdAt: step === "success" ? "Just now" : "Draft",
    operationCode,
    bank: method === "contact" ? "VOXEL Internal Rail" : method === "card" ? "External card network" : "Phone lookup rail",
    purpose,
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 520)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (step !== "processing") return
    const timer = window.setTimeout(() => {
      setDirection(1)
      setShowReceipt(true)
      setStep("success")
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [step])

  function goNext(nextStep: TransferStep) {
    setDirection(1)
    setStep(nextStep)
  }

  function goBack() {
    const currentIndex = stepOrder.indexOf(step)
    if (currentIndex <= 0 || transferFromHistory) {
      router.push("/")
      return
    }

    const previous = stepOrder[currentIndex - 1]
    if (previous === "processing") {
      setStep("review")
      return
    }

    setDirection(-1)
    setStep(previous)
  }

  const canContinue =
    method === "contact" ||
    (method === "card" && cardNumber.replace(/\D/g, "").length >= 12) ||
    (method === "phone" && phoneNumber.replace(/\D/g, "").length >= 7)

  return (
    <div className="min-h-svh bg-background">
      <Topbar />

      <header className="border-b-2 border-foreground bg-background px-4 py-3 md:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <PixelButton onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            Назад
          </PixelButton>
          <div className="text-right">
            <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">Transfer slug</p>
            <p className="text-sm font-semibold text-foreground">{transferId}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        {loading ? (
          <TransferSkeleton />
        ) : (
          <div key={step} className={cn("animate-transfer-in", direction < 0 && "animate-transfer-back")}>
            {transferFromHistory ? (
              <TransferReceipt record={draft} showReceipt={showReceipt} setShowReceipt={setShowReceipt} />
            ) : (
              <>
                <ProgressBar step={step} />

                {step === "recipient" && (
                  <PixelCard eyebrow="Step 1" title="Choose recipient">
                    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                      <div className="grid gap-3">
                        <MethodButton active={method === "contact"} icon={UserRound} label="Из контактов" onClick={() => setMethod("contact")} />
                        <MethodButton active={method === "card"} icon={CreditCard} label="Номер карты" onClick={() => setMethod("card")} />
                        <MethodButton active={method === "phone"} icon={Phone} label="Телефон" onClick={() => setMethod("phone")} />
                      </div>

                      <div className="border-2 border-foreground bg-secondary p-4">
                        {method === "contact" && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {contacts.map((item) => {
                              const active = selectedContact === item.id
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => setSelectedContact(item.id)}
                                  className={cn(
                                    "flex cursor-pointer items-center gap-3 border-2 p-3 text-left transition-all",
                                    active ? "border-foreground bg-accent pixel-shadow-sm" : "border-foreground bg-card hover:bg-secondary",
                                  )}
                                >
                                  <Avatar className="h-11 w-11 rounded-none">
                                    <AvatarFallback className="rounded-none bg-primary font-pixel text-[10px] text-primary-foreground">
                                      {item.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>
                                    <span className="block text-sm font-semibold text-foreground">{item.name}</span>
                                    <span className="block text-xs text-muted-foreground">{item.handle}</span>
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {method === "card" && (
                          <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Card number</span>
                            <PixelInput
                              value={cardNumber}
                              onChange={(event) => setCardNumber(formatCard(event.target.value))}
                              placeholder="0000 0000 0000 0000"
                              className="mt-2 text-lg font-semibold tabular-nums"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">The card will be checked before confirmation.</p>
                          </label>
                        )}

                        {method === "phone" && (
                          <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone number</span>
                            <PixelInput
                              value={phoneNumber}
                              onChange={(event) => setPhoneNumber(event.target.value)}
                              placeholder="+1 555 000 0000"
                              className="mt-2 text-lg font-semibold tabular-nums"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">VOXEL will search for a connected bank recipient.</p>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <PixelButton disabled={!canContinue} onClick={() => goNext("amount")} className="bg-primary text-primary-foreground">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </PixelButton>
                    </div>
                  </PixelCard>
                )}

                {step === "amount" && (
                  <PixelCard eyebrow="Step 2" title="Amount and purpose">
                    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                      <div className="space-y-4">
                        <label className="block">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</span>
                          <PixelInput
                            type="number"
                            min={1}
                            value={amount}
                            onChange={(event) => setAmount(Number(event.target.value))}
                            className="mt-2 h-14 text-2xl font-semibold tabular-nums"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Purpose</span>
                          <PixelInput value={purpose} onChange={(event) => setPurpose(event.target.value)} className="mt-2" />
                        </label>
                      </div>

                      <PixelCard as="div" title="Preview" className="bg-secondary">
                        <DetailsGrid record={draft} compact />
                      </PixelCard>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <PixelButton disabled={amount <= 0} onClick={() => goNext("review")} className="bg-primary text-primary-foreground">
                        Review
                        <ArrowRight className="h-4 w-4" />
                      </PixelButton>
                    </div>
                  </PixelCard>
                )}

                {step === "review" && (
                  <PixelCard eyebrow="Step 3" title="Confirm transfer" action={<PixelStatus tone="warning">Needs approval</PixelStatus>}>
                    <TransferSummary record={draft} />
                    <div className="mt-5 flex flex-wrap justify-between gap-3">
                      <PixelButton onClick={goBack}>
                        <ArrowLeft className="h-4 w-4" />
                        Назад
                      </PixelButton>
                      <PixelButton onClick={() => goNext("processing")} className="bg-primary text-primary-foreground">
                        Confirm transfer
                        <Send className="h-4 w-4" />
                      </PixelButton>
                    </div>
                  </PixelCard>
                )}

                {step === "processing" && (
                  <PixelCard eyebrow="Processing" title="Transfer is being sent">
                    <div className="flex min-h-80 flex-col items-center justify-center text-center">
                      <div className="pixel-loader" aria-hidden>
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                      <p className="mt-6 font-pixel text-[10px] uppercase tracking-wider text-foreground">Authorizing rail</p>
                      <p className="mt-2 max-w-md text-sm text-muted-foreground">Checking recipient, account limits, fraud rules and ledger reservation.</p>
                      <div className="mt-6 w-full max-w-md space-y-3">
                        <PixelSkeleton className="h-10" />
                        <PixelSkeleton className="h-10" />
                        <PixelSkeleton className="h-10" />
                      </div>
                    </div>
                  </PixelCard>
                )}

                {step === "success" && (
                  <TransferReceipt record={draft} showReceipt={showReceipt} setShowReceipt={setShowReceipt} />
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function TransferReceipt({
  record,
  showReceipt,
  setShowReceipt,
}: {
  record: TransferRecord
  showReceipt: boolean
  setShowReceipt: (value: boolean) => void
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <PixelCard
        eyebrow={record.status === "completed" ? "Transfer completed" : "Transfer pending"}
        title={record.status === "completed" ? "Money is on the way" : "Operation is waiting"}
        action={<PixelStatus tone={record.status === "completed" ? "success" : "warning"}>{record.status}</PixelStatus>}
      >
        <div className="flex min-h-64 flex-col items-center justify-center text-center">
          <span className="flex h-20 w-20 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground pixel-shadow">
            <Check className="h-9 w-9" />
          </span>
          <p className="mt-6 text-3xl font-semibold tabular-nums text-foreground">{formatUsd(record.amount)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sent to <span className="font-semibold text-foreground">{record.recipient}</span>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="pixel-btn inline-flex cursor-pointer items-center justify-center gap-2 bg-primary px-4 py-2.5 font-pixel text-[10px] uppercase text-primary-foreground">
              <Home className="h-4 w-4" />
              На главную
            </Link>
            <PixelButton onClick={() => setShowReceipt(!showReceipt)}>
              <Receipt className="h-4 w-4" />
              Чек
            </PixelButton>
            <PixelButton>
              <Repeat className="h-4 w-4" />
              Repeat
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      <PixelCard title="Operation controls" eyebrow="Actions">
        <div className="grid gap-3">
          <PixelButton className="w-full justify-between">
            <Download className="h-4 w-4" />
            Download PDF
          </PixelButton>
          <PixelButton className="w-full justify-between">
            <Share2 className="h-4 w-4" />
            Share receipt
          </PixelButton>
          <PixelButton className="w-full justify-between">
            <Copy className="h-4 w-4" />
            Copy operation ID
          </PixelButton>
        </div>
      </PixelCard>

      {showReceipt && (
        <PixelCard className="lg:col-span-2" title="Receipt">
          <TransferSummary record={record} />
        </PixelCard>
      )}
    </div>
  )
}

function TransferSummary({ record }: { record: TransferRecord }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <div className="border-2 border-foreground bg-secondary p-4">
        <Avatar className="h-16 w-16 rounded-none border-2 border-foreground">
          <AvatarFallback className="rounded-none bg-primary font-pixel text-[12px] text-primary-foreground">{record.initials}</AvatarFallback>
        </Avatar>
        <p className="mt-4 text-base font-semibold text-foreground">{record.recipient}</p>
        <p className="text-xs text-muted-foreground">{record.recipientHandle}</p>
      </div>
      <DetailsGrid record={record} />
    </div>
  )
}

function DetailsGrid({ record, compact }: { record: TransferRecord; compact?: boolean }) {
  const rows = [
    ["Operation ID", record.operationCode],
    ["Created", record.createdAt],
    ["Source", record.source],
    ["Method", record.method],
    ["Bank rail", record.bank],
    ["Purpose", record.purpose],
    ["Fee", formatUsd(record.fee)],
    ["Total", formatUsd(record.amount + record.fee)],
  ]

  return (
    <div className={cn("grid gap-3", compact ? "text-sm" : "md:grid-cols-2")}>
      {rows.map(([label, value]) => (
        <div key={label} className="border-2 border-foreground bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold text-foreground">{value}</p>
        </div>
      ))}
    </div>
  )
}

function MethodButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: typeof UserRound
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-3 border-2 px-3 py-3 text-left text-sm font-semibold transition-all",
        active ? "border-foreground bg-primary text-primary-foreground pixel-shadow-sm" : "border-foreground bg-card text-foreground hover:bg-secondary",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function ProgressBar({ step }: { step: TransferStep }) {
  const activeIndex = Math.max(0, stepOrder.indexOf(step))

  return (
    <div className="mb-5 grid grid-cols-4 gap-2">
      {["Recipient", "Amount", "Review", "Done"].map((label, index) => (
        <div key={label} className={cn("border-2 border-foreground p-2 text-center", index <= activeIndex ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>
          <p className="font-pixel text-[8px] uppercase">{label}</p>
        </div>
      ))}
    </div>
  )
}

function TransferSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <PixelCard>
        <div className="space-y-4">
          <PixelSkeleton className="h-8 w-1/3" />
          <PixelSkeleton className="h-40" />
          <div className="grid gap-3 sm:grid-cols-3">
            <PixelSkeleton className="h-20" />
            <PixelSkeleton className="h-20" />
            <PixelSkeleton className="h-20" />
          </div>
        </div>
      </PixelCard>
      <PixelCard>
        <div className="space-y-3">
          <PixelSkeleton className="h-8" />
          <PixelSkeleton className="h-16" />
          <PixelSkeleton className="h-8 w-2/3" />
        </div>
      </PixelCard>
    </div>
  )
}

function formatCard(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
}

function maskCard(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.length < 4) return "Card · ****"
  return `Card · **** ${digits.slice(-4)}`
}
