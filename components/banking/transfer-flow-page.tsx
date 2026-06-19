"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
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
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { Topbar } from "@/components/banking/topbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { accounts, contacts as fallbackContacts, formatUsd } from "@/lib/bank-data"
import { cn } from "@/lib/utils"
import { type AppContact, useAppPreferences } from "@/components/banking/app-preferences"
import { PixelAmount, PixelButton, PixelCard, PixelInput, PixelLoader, PixelSkeleton, PixelStatus } from "@/components/banking/pixel-ui"

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
  riskScore: string
  speed: string
}

const existingTransfers: Record<string, TransferRecord> = {
  "op-1": {
    id: "op-1",
    recipient: "Мария Лопес",
    recipientHandle: "@maria",
    initials: "МЛ",
    method: "contact",
    amount: 250,
    fee: 0,
    source: "Основной счёт · **** 4921",
    status: "pending",
    createdAt: "Вчера, 18:40",
    operationCode: "VX-2026-OP1-8842",
    bank: "VOXEL внутренний канал",
    purpose: "Личный перевод",
    riskScore: "Низкий",
    speed: "Мгновенно",
  },
  "op-2": {
    id: "op-2",
    recipient: "Джеймс Картер",
    recipientHandle: "Карта · **** 9021",
    initials: "ДК",
    method: "card",
    amount: 75,
    fee: 0,
    source: "Основной счёт · **** 4921",
    status: "completed",
    createdAt: "17 июн, 11:12",
    operationCode: "VX-2026-OP2-3811",
    bank: "Внешняя карточная сеть",
    purpose: "Перевод на карту",
    riskScore: "Низкий",
    speed: "До 2 минут",
  },
  "op-3": {
    id: "op-3",
    recipient: "София Рейес",
    recipientHandle: "+1 555 011 489",
    initials: "СР",
    method: "phone",
    amount: 120,
    fee: 0,
    source: "Основной счёт · **** 4921",
    status: "completed",
    createdAt: "16 июн, 09:05",
    operationCode: "VX-2026-OP3-1297",
    bank: "Поиск банка по телефону",
    purpose: "Перевод по телефону",
    riskScore: "Низкий",
    speed: "Мгновенно",
  },
}

const stepOrder: TransferStep[] = ["recipient", "amount", "review", "processing", "success"]
const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"]

export function TransferFlowPage({ transferId }: { transferId: string }) {
  const router = useRouter()
  const prefs = useAppPreferences()
  const { profileName, t, transferContacts, transferDefaults, animationSettings } = prefs
  const transferFromHistory = existingTransfers[transferId]
  const amountInputRef = useRef<HTMLInputElement>(null)
  const availableContacts: AppContact[] = transferContacts.length > 0 ? transferContacts : fallbackContacts
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<TransferStep>(transferFromHistory ? "success" : "recipient")
  const [direction, setDirection] = useState<1 | -1>(1)
  const [method, setMethod] = useState<RecipientMethod>("contact")
  const [selectedContact, setSelectedContact] = useState(availableContacts[0]?.id ?? "")
  const [cardNumber, setCardNumber] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amountInput, setAmountInput] = useState(transferDefaults.defaultAmount || "250")
  const [purpose, setPurpose] = useState(transferDefaults.defaultPurpose || t("Личный перевод", "Private transfer"))
  const [showReceipt, setShowReceipt] = useState(Boolean(transferFromHistory || transferDefaults.autoOpenReceipt))

  const operationCode = useMemo(() => `VX-${transferId.toUpperCase().replace(/[^A-Z0-9]/g, "-")}`, [transferId])
  const contact = availableContacts.find((item) => item.id === selectedContact) ?? availableContacts[0]
  const amount = Math.max(0, Number(amountInput) || 0)
  const sourceAccount = accounts[0]
  const configuredFee = Math.max(0, Number(transferDefaults.transferFee) || 0)
  const dailyLimit = Math.max(0, Number(transferDefaults.dailyLimit) || 0)

  const draft: TransferRecord = transferFromHistory ?? {
    id: transferId,
    recipient: method === "contact" ? contact?.name ?? t("Получатель", "Recipient") : method === "card" ? t("Получатель по карте", "Card recipient") : t("Получатель по телефону", "Phone recipient"),
    recipientHandle: method === "contact" ? contact?.handle ?? "@recipient" : method === "card" ? maskCard(cardNumber, t) : phoneNumber || "+_ ___ ___ ____",
    initials: method === "contact" ? contact?.initials ?? "ПЛ" : method === "card" ? "КР" : "ТЛ",
    method,
    amount,
    fee: method === "contact" ? 0 : configuredFee,
    source: `${localizeAccountName(sourceAccount.name)} · ${sourceAccount.number}`,
    status: step === "success" ? "completed" : "pending",
    createdAt: step === "success" ? t("Только что", "Just now") : t("Черновик", "Draft"),
    operationCode,
    bank: method === "contact" ? transferDefaults.preferredRail : method === "card" ? t("Внешняя карточная сеть", "External card network") : t("Поиск банка по телефону", "Phone lookup rail"),
    purpose,
    riskScore: transferDefaults.requireRiskCheck ? t("Низкий", "Low") : t("Отключено", "Disabled"),
    speed: method === "card" ? t("До 2 минут", "Up to 2 min") : transferDefaults.speedLabel,
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), animationSettings.loaderMotion ? 420 : 80)
    return () => window.clearTimeout(timer)
  }, [animationSettings.loaderMotion])

  useEffect(() => {
    if (!availableContacts.some((item) => item.id === selectedContact) && availableContacts[0]) {
      setSelectedContact(availableContacts[0].id)
    }
  }, [availableContacts, selectedContact])

  useEffect(() => {
    if (step !== "processing") return
    const timer = window.setTimeout(() => {
      setDirection(1)
      setShowReceipt(true)
      setStep("success")
    }, animationSettings.loaderMotion ? 1500 : 520)
    return () => window.clearTimeout(timer)
  }, [step, animationSettings.loaderMotion])

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
    setDirection(-1)
    const previous = stepOrder[Math.max(0, currentIndex - 1)]
    setStep(previous === "processing" ? "review" : previous)
  }

  function pressKey(key: string) {
    setAmountInput((current) => {
      const input = amountInputRef.current
      const start = input?.selectionStart ?? current.length
      const end = input?.selectionEnd ?? current.length
      const nextRaw = key === "⌫" ? `${current.slice(0, Math.max(0, start - 1))}${current.slice(end)}` : `${current.slice(0, start)}${key}${current.slice(end)}`
      const next = sanitizeAmount(nextRaw)
      const nextPosition = key === "⌫" ? Math.max(0, start - 1) : start + key.length
      window.requestAnimationFrame(() => input?.setSelectionRange(Math.min(nextPosition, next.length), Math.min(nextPosition, next.length)))
      return next || "0"
    })
  }

  const canContinue = method === "contact" || (method === "card" && cardNumber.replace(/\D/g, "").length >= 12) || (method === "phone" && phoneNumber.replace(/\D/g, "").length >= 7)
  const canReview = amount > 0 && (dailyLimit <= 0 || amount + draft.fee <= dailyLimit)

  return (
    <div className="min-h-svh bg-background neo-mobile-shell">
      <Topbar />

      <header className="border-b-2 border-foreground bg-background px-4 py-3 md:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <PixelButton onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            {t("Назад", "Back")}
          </PixelButton>
          <div className="text-center">
            <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">{t("Операция", "Operation")}</p>
            <p className="text-sm font-black text-foreground">{transferId}</p>
          </div>
          <PixelStatus tone="info">{profileName}</PixelStatus>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        {loading ? (
          <TransferSkeleton />
        ) : (
          <div key={step} className={cn("animate-transfer-in", direction < 0 && "animate-transfer-back")}> 
            {transferFromHistory ? (
              <TransferReceipt record={draft} showReceipt={showReceipt} setShowReceipt={setShowReceipt} completed />
            ) : (
              <>
                <ProgressBar step={step} />

                {step === "recipient" && (
                  <PixelCard eyebrow={t("Шаг 1", "Step 1")} title={t("Кому переводим", "Choose recipient")} className="payment-hero-card pixel-gradient">
                    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                      <div className="grid gap-3">
                        <MethodButton active={method === "contact"} icon={UserRound} label={t("Из контактов", "Contacts")} onClick={() => setMethod("contact")} />
                        <MethodButton active={method === "card"} icon={CreditCard} label={t("Номер карты", "Card number")} onClick={() => setMethod("card")} />
                        <MethodButton active={method === "phone"} icon={Phone} label={t("Телефон", "Phone")} onClick={() => setMethod("phone")} />
                      </div>

                      <div className="border-2 border-foreground bg-secondary p-4 pixel-shadow-sm">
                        {method === "contact" && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {availableContacts.map((item) => (
                              <button key={item.id} onClick={() => setSelectedContact(item.id)} className={cn("flex min-h-20 cursor-pointer items-center gap-3 border-2 p-3 text-left transition-all", selectedContact === item.id ? "border-foreground bg-accent pixel-shadow-sm" : "border-foreground bg-card hover:bg-secondary")}>
                                <Avatar className="h-11 w-11 rounded-none border-2 border-foreground">
                                  <AvatarFallback className="rounded-none bg-primary font-pixel text-[10px] text-primary-foreground">{item.initials}</AvatarFallback>
                                </Avatar>
                                <span>
                                  <span className="block text-sm font-black text-foreground">{item.name}</span>
                                  <span className="block text-xs text-muted-foreground">{item.handle} · {t("проверен VOXEL", "VOXEL verified")}</span>
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {method === "card" && (
                          <label className="block">
                            <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">{t("Номер карты", "Card number")}</span>
                            <PixelInput value={cardNumber} onChange={(event) => setCardNumber(formatCard(event.target.value))} placeholder="0000 0000 0000 0000" className="mt-2 text-lg font-black tabular-nums" />
                            <p className="mt-2 text-xs text-muted-foreground">{t("Проверим банк, лимит, риск и комиссию перед подтверждением.", "We check bank, limit, risk and fee before confirmation.")}</p>
                          </label>
                        )}

                        {method === "phone" && (
                          <label className="block">
                            <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">{t("Телефон", "Phone number")}</span>
                            <PixelInput value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+7 900 000 00 00" className="mt-2 text-lg font-black tabular-nums" />
                            <p className="mt-2 text-xs text-muted-foreground">{t("Найдём подключённый банковский профиль по телефону.", "VOXEL will search for a connected bank recipient.")}</p>
                          </label>
                        )}
                      </div>
                    </div>

                    <TransferInfoStrip dailyLimit={dailyLimit} fee={configuredFee} speed={transferDefaults.speedLabel} />

                    <div className="mt-5 flex justify-end">
                      <PixelButton disabled={!canContinue} onClick={() => goNext("amount")} className="bg-primary text-primary-foreground">
                        {t("Продолжить", "Continue")}
                        <ArrowRight className="h-4 w-4" />
                      </PixelButton>
                    </div>
                  </PixelCard>
                )}

                {step === "amount" && (
                  <PixelCard eyebrow={t("Шаг 2", "Step 2")} title={t("Сумма и детали", "Amount and details")} className="payment-hero-card">
                    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                      <div className="space-y-4">
                        <div className="border-2 border-foreground bg-secondary p-5 pixel-shadow-sm">
                          <label htmlFor="transfer-amount" className="text-xs font-black uppercase tracking-wide text-muted-foreground">{t("Сумма", "Amount")}</label>
                          <input
                            id="transfer-amount"
                            ref={amountInputRef}
                            value={amountInput}
                            onChange={(event) => setAmountInput(sanitizeAmount(event.target.value) || "0")}
                            inputMode="decimal"
                            aria-label={t("Сумма перевода", "Transfer amount")}
                            className="mt-3 w-full bg-transparent text-5xl font-black tracking-tight text-foreground outline-none tabular-nums caret-primary"
                            data-cursor="text"
                          />
                          <p className="mt-2 text-xs text-muted-foreground">{t("Доступно", "Available")}: {formatUsd(sourceAccount.balance)} · {t("лимит", "limit")}: {formatUsd(dailyLimit)}</p>
                          <div className="mobile-number-pad mt-5">
                            {keypad.map((key) => <button key={key} type="button" onClick={() => pressKey(key)}>{key}</button>)}
                          </div>
                        </div>
                        <label className="block">
                          <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">{t("Назначение", "Purpose")}</span>
                          <PixelInput value={purpose} onChange={(event) => setPurpose(event.target.value)} className="mt-2" />
                        </label>
                      </div>

                      <PixelCard as="div" title={t("Предпросмотр", "Preview")} className="bg-secondary">
                        <DetailsGrid record={draft} compact />
                      </PixelCard>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <PixelButton disabled={!canReview} onClick={() => goNext("review")} className="bg-primary text-primary-foreground">
                        {canReview ? t("Проверить", "Review") : t("Сверх лимита", "Over limit")}
                        <ArrowRight className="h-4 w-4" />
                      </PixelButton>
                    </div>
                  </PixelCard>
                )}

                {step === "review" && (
                  <PixelCard eyebrow={t("Шаг 3", "Step 3")} title={t("Подтвердить перевод", "Confirm transfer")} action={<PixelStatus tone="warning">{t("2FA готова", "2FA ready")}</PixelStatus>}>
                    <TransferSummary record={draft} />
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <InfoLine icon={ShieldCheck} label={t("Риск", "Risk score")} value={draft.riskScore} />
                      <InfoLine icon={Wallet} label={t("Скорость", "Rail speed")} value={draft.speed} />
                      <InfoLine icon={BadgeCheck} label={t("Лимит", "Limit")} value={formatUsd(dailyLimit)} />
                    </div>
                    <div className="mt-5 flex flex-wrap justify-between gap-3">
                      <PixelButton onClick={goBack}><ArrowLeft className="h-4 w-4" />{t("Назад", "Back")}</PixelButton>
                      <PixelButton onClick={() => goNext("processing")} className="bg-primary text-primary-foreground">
                        {t("Перевести", "Confirm transfer")}
                        <Send className="h-4 w-4" />
                      </PixelButton>
                    </div>
                  </PixelCard>
                )}

                {step === "processing" && (
                  <PixelCard eyebrow={t("Обработка", "Processing")} title={t("Деньги отправляются", "Transfer is being sent")}>
                    <div className="flex min-h-80 flex-col items-center justify-center text-center">
                      <PixelLoader variant="card" label={t("Авторизация", "Authorizing rail")} />
                      <p className="mt-6 font-pixel text-[10px] uppercase tracking-wider text-foreground">{t("Проверяем маршрут", "Checking route")}</p>
                      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("Резервируем сумму, проверяем получателя, лимиты, риск и создаём запись в реестре.", "Checking recipient, limits, risk rules and ledger reservation.")}</p>
                      <div className="mt-6 w-full max-w-md space-y-3"><PixelSkeleton className="h-10" /><PixelSkeleton className="h-10" /><PixelSkeleton className="h-10" /></div>
                    </div>
                  </PixelCard>
                )}

                {step === "success" && <TransferReceipt record={draft} showReceipt={showReceipt} setShowReceipt={setShowReceipt} completed />}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function TransferReceipt({ record, showReceipt, setShowReceipt, completed }: { record: TransferRecord; showReceipt: boolean; setShowReceipt: (value: boolean) => void; completed?: boolean }) {
  const { t, animationSettings } = useAppPreferences()
  return (
    <div className="relative grid gap-5 lg:grid-cols-[1fr_340px]">
      {completed && animationSettings.celebrationEffects && <TransferCelebration />}
      <PixelCard eyebrow={record.status === "completed" ? t("Перевод выполнен", "Transfer completed") : t("Перевод ожидает", "Transfer pending")} title={record.status === "completed" ? t("Деньги переведены", "Money transferred") : t("Операция ожидает", "Operation is waiting")} action={<PixelStatus tone={record.status === "completed" ? "success" : "warning"}>{record.status === "completed" ? t("Готово", "Completed") : t("Ожидает", "Pending")}</PixelStatus>} className="receipt-glow-ring pixel-gradient">
        <div className="flex min-h-72 flex-col items-center justify-center text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-[28px] border-2 border-foreground bg-primary text-primary-foreground pixel-shadow">
            <Check className="h-11 w-11" />
          </span>
          <p className="mt-6 text-4xl font-black tabular-nums text-foreground"><PixelAmount value={record.amount} /></p>
          <p className="mt-2 text-sm text-muted-foreground">{t("Отправлено получателю", "Sent to")} <span className="font-black text-foreground">{record.recipient}</span></p>
          <div className="mt-4 grid w-full max-w-md grid-cols-3 gap-2 text-xs">
            <InfoPill label={t("Канал", "Rail")} value={record.bank} />
            <InfoPill label={t("Скорость", "Speed")} value={record.speed} />
            <InfoPill label={t("Риск", "Risk")} value={record.riskScore} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="pixel-btn inline-flex cursor-pointer items-center justify-center gap-2 bg-primary px-4 py-2.5 font-pixel text-[10px] uppercase text-primary-foreground"><Home className="h-4 w-4" />{t("Главная", "Home")}</Link>
            <PixelButton onClick={() => setShowReceipt(!showReceipt)}><Receipt className="h-4 w-4" />{t("Чек", "Receipt")}</PixelButton>
            <PixelButton><Repeat className="h-4 w-4" />{t("Повторить", "Repeat")}</PixelButton>
          </div>
        </div>
      </PixelCard>

      <PixelCard title={t("Действия", "Operation controls")} eyebrow={t("Операция", "Actions")}>
        <div className="grid gap-3">
          <PixelButton className="w-full justify-between"><Download className="h-4 w-4" />{t("Скачать PDF", "Download PDF")}</PixelButton>
          <PixelButton className="w-full justify-between"><Share2 className="h-4 w-4" />{t("Поделиться", "Share")}</PixelButton>
          <PixelButton className="w-full justify-between"><Copy className="h-4 w-4" />{t("Скопировать ID", "Copy ID")}</PixelButton>
        </div>
      </PixelCard>

      {showReceipt && <PixelCard className="lg:col-span-2" title={t("Чек операции", "Receipt")}><TransferSummary record={record} /></PixelCard>}
    </div>
  )
}

function TransferCelebration() {
  return (
    <div className="transfer-celebration" aria-hidden>
      <span className="pixel-firework" style={{ left: "12%", top: "18%" }} />
      <span className="pixel-firework" style={{ right: "16%", top: "12%", animationDelay: "0.22s" }} />
      <span className="pixel-coin-burst" style={{ left: "42%", bottom: "16%", animationDelay: "0.1s" }} />
      <span className="pixel-coin-burst" style={{ left: "58%", bottom: "10%", animationDelay: "0.34s" }} />
      <span className="pixel-confetti" style={{ left: "24%", top: "0%" }} />
      <span className="pixel-confetti" style={{ left: "76%", top: "0%", animationDelay: "0.18s" }} />
    </div>
  )
}

function TransferSummary({ record }: { record: TransferRecord }) {
  return <div className="grid gap-5 lg:grid-cols-[260px_1fr]"><div className="border-2 border-foreground bg-secondary p-4 pixel-shadow-sm"><Avatar className="h-16 w-16 rounded-none border-2 border-foreground"><AvatarFallback className="rounded-none bg-primary font-pixel text-[12px] text-primary-foreground">{record.initials}</AvatarFallback></Avatar><p className="mt-4 text-base font-black text-foreground">{record.recipient}</p><p className="text-xs text-muted-foreground">{record.recipientHandle}</p></div><DetailsGrid record={record} /></div>
}

function DetailsGrid({ record, compact }: { record: TransferRecord; compact?: boolean }) {
  const { t } = useAppPreferences()
  const rows = [[t("ID операции", "Operation ID"), record.operationCode], [t("Создано", "Created"), record.createdAt], [t("Счёт списания", "Source"), record.source], [t("Метод", "Method"), localizeMethod(record.method, t)], [t("Канал банка", "Bank rail"), record.bank], [t("Назначение", "Purpose"), record.purpose], [t("Комиссия", "Fee"), formatUsd(record.fee)], [t("Итого", "Total"), formatUsd(record.amount + record.fee)], [t("Скорость", "Speed"), record.speed], [t("Риск", "Risk"), record.riskScore]]
  return <div className={cn("grid gap-3", compact ? "text-sm" : "md:grid-cols-2")}>{rows.map(([label, value]) => <div key={label} className="border-2 border-foreground bg-card p-3"><p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-black text-foreground">{value}</p></div>)}</div>
}

function MethodButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={cn("flex cursor-pointer items-center gap-3 border-2 px-3 py-3 text-left text-sm font-black transition-all", active ? "border-foreground bg-primary text-primary-foreground pixel-shadow-sm" : "border-foreground bg-card text-foreground hover:bg-secondary")}><Icon className="h-4 w-4" />{label}</button>
}

function ProgressBar({ step }: { step: TransferStep }) {
  const { t } = useAppPreferences()
  const activeIndex = Math.max(0, stepOrder.indexOf(step))
  return <div className="mb-5 grid grid-cols-4 gap-2">{[t("Получатель", "Recipient"), t("Сумма", "Amount"), t("Проверка", "Review"), t("Готово", "Done")].map((label, index) => <div key={label} className={cn("border-2 border-foreground p-2 text-center", index <= activeIndex ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}><p className="font-pixel text-[8px] uppercase">{label}</p></div>)}</div>
}

function TransferSkeleton() {
  const { t } = useAppPreferences()
  return <div className="grid gap-5 lg:grid-cols-[1fr_320px]"><PixelCard><div className="space-y-4"><PixelSkeleton className="h-8 w-1/3" /><PixelSkeleton className="h-44" /><div className="grid gap-3 sm:grid-cols-3"><PixelSkeleton className="h-20" /><PixelSkeleton className="h-20" /><PixelSkeleton className="h-20" /></div></div></PixelCard><PixelCard><div className="space-y-3"><PixelLoader variant="card" label={t("Загрузка", "Loading")} /><PixelSkeleton className="h-8" /><PixelSkeleton className="h-16" /></div></PixelCard></div>
}

function TransferInfoStrip({ dailyLimit, fee, speed }: { dailyLimit: number; fee: number; speed: string }) {
  const { t } = useAppPreferences()
  return <div className="payment-stat-strip mt-5"><InfoPill label="2FA" value={t("Ключ доступа", "Passkey")} /><InfoPill label={t("Лимит", "Limit")} value={formatUsd(dailyLimit)} /><InfoPill label={t("Комиссия", "Fee")} value={formatUsd(fee)} /><InfoPill label={t("Скорость", "Speed")} value={speed} /></div>
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-full border-2 border-foreground bg-card px-3 py-2 text-center pixel-shadow-sm"><p className="font-pixel text-[8px] uppercase text-muted-foreground">{label}</p><p className="mt-1 truncate text-xs font-black text-foreground">{value}</p></div>
}

function InfoLine({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 border-2 border-foreground bg-secondary p-3"><span className="flex items-center gap-2 text-sm font-black text-foreground"><Icon className="h-4 w-4 text-primary" />{label}</span><span className="text-sm font-black text-foreground">{value}</span></div>
}

function formatCard(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ")
}

function maskCard(value: string, t: (ru: string, en: string) => string) {
  const digits = value.replace(/\D/g, "")
  if (digits.length < 4) return t("Карта · ****", "Card · ****")
  return `${t("Карта", "Card")} · **** ${digits.slice(-4)}`
}

function sanitizeAmount(value: string) {
  const cleaned = value.replace(/,/g, ".").replace(/[^\d.]/g, "")
  const [whole, ...rest] = cleaned.split(".")
  const decimals = rest.join("").slice(0, 2)
  const normalizedWhole = (whole || "0").replace(/^0+(?=\d)/, "")
  return decimals.length > 0 || cleaned.includes(".") ? `${normalizedWhole}.${decimals}`.slice(0, 12) : normalizedWhole.slice(0, 12)
}

function localizeAccountName(name: string) {
  const map: Record<string, string> = {
    "Main account": "Основной счёт",
    "Savings vault": "Накопительный сейф",
    "VOXEL wallet": "VOXEL-кошелёк",
  }
  return map[name] ?? name
}

function localizeMethod(method: RecipientMethod, t: (ru: string, en: string) => string) {
  if (method === "contact") return t("Контакт", "Contact")
  if (method === "card") return t("Карта", "Card")
  return t("Телефон", "Phone")
}
