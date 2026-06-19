"use client"

import Link from "next/link"
import { type ClipboardEvent, type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useState } from "react"
import { ArrowLeft, BadgeCheck, EyeOff, FileText, Keyboard, MonitorOff, Play, ReceiptText, ShieldCheck, TimerReset } from "lucide-react"
import { lipatovSceneConfig } from "@/lib/lipatov-scene-config"
import { cn } from "@/lib/utils"
import { PixelButton, PixelCard, PixelFigure, PixelInput, PixelLoader, PixelSkeleton, PixelStatus } from "@/components/banking/pixel-ui"

type SceneStep = "ready" | "processing" | "success" | "blackout"

const auditRows = [
  ["Тип операции", lipatovSceneConfig.bank.operationType],
  ["Канал", lipatovSceneConfig.bank.channel],
  ["Статус", lipatovSceneConfig.bank.operationStatus],
  ["Проверка", lipatovSceneConfig.bank.verification],
]

const digitFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
  useGrouping: true,
})

function normalizeAmountDigits(value: string) {
  const integerPart = value.split(/[.,]/)[0] ?? value
  const digits = integerPart.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
  return digits
}

function formatAmountMask(digits: string) {
  if (!digits) return ""
  return `${digitFormatter.format(Number(digits))}.00`
}

export function LipatovSceneBank() {
  const [step, setStep] = useState<SceneStep>("ready")
  const [lastStep, setLastStep] = useState<Exclude<SceneStep, "blackout">>("ready")
  const [clock, setClock] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [amountDigits, setAmountDigits] = useState(() => String(lipatovSceneConfig.transfer.amount))

  const isSuccess = step === "success"
  const isProcessing = step === "processing"
  const isBlackout = step === "blackout"
  const maskedAmount = useMemo(() => formatAmountMask(amountDigits), [amountDigits])
  const amountReady = amountDigits.length > 0 && Number(amountDigits) > 0

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && step === "ready") {
        event.preventDefault()
        submitRequest()
      }
      if (event.key === "Escape" && step === "blackout") {
        event.preventDefault()
        setStep(lastStep)
      }
      if ((event.key === "f" || event.key === "F") && document.fullscreenEnabled) {
        document.documentElement.requestFullscreen().catch(() => undefined)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [amountReady, isProcessing, isSuccess, lastStep, step])

  useEffect(() => {
    if (step !== "processing") return
    setClock(0)
    const interval = window.setInterval(() => setClock((value) => value + 1), 260)
    const timeout = window.setTimeout(() => {
      setLastStep("success")
      setStep("success")
    }, 1500)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [step])

  const progressWidth = useMemo(() => {
    if (step === "ready") return amountReady ? "28%" : "10%"
    if (step === "processing") return `${Math.min(88, 28 + clock * 14)}%`
    if (step === "success") return "100%"
    return "100%"
  }, [amountReady, clock, step])

  function submitRequest() {
    if (!amountReady || isProcessing || isSuccess) return
    setLastStep("ready")
    setStep("processing")
  }

  function openBlackout() {
    if (step !== "blackout") setLastStep(step === "processing" ? "success" : step)
    setStep("blackout")
  }

  function enterFullscreen() {
    if (!document.fullscreenElement && document.fullscreenEnabled) {
      document.documentElement.requestFullscreen().catch(() => undefined)
    }
  }

  if (isBlackout) {
    return (
      <main className="fixed inset-0 z-[999] grid place-items-center bg-black text-white" data-cursor="disabled" onClick={() => setStep(lastStep)}>
        <div className="max-w-xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-white bg-black">
            <MonitorOff className="h-8 w-8" />
          </div>
          <p className="font-pixel text-[10px] uppercase tracking-[0.35em] text-white/50">screen blackout preview</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">{lipatovSceneConfig.sceneControls.screenMessage}</h1>
          <p className="mt-3 text-sm text-white/55">{lipatovSceneConfig.sceneControls.offlineMessage}</p>
          <p className="mt-8 font-pixel text-[9px] uppercase tracking-widest text-white/35">Click or press Esc to return</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background px-4 py-5 text-foreground md:px-6">
      <button
        aria-label={showControls ? "Hide scene setup controls" : "Show scene setup controls"}
        className={cn(
          "fixed right-3 top-3 z-[80] h-5 w-5 border-2 border-foreground bg-background/20 opacity-0 outline-none transition-all duration-500 hover:scale-125 hover:bg-primary hover:opacity-100 focus-visible:scale-125 focus-visible:bg-primary focus-visible:opacity-100 active:translate-x-0.5 active:translate-y-0.5",
          !showControls && "opacity-10",
        )}
        data-cursor="pointer"
        onClick={() => setShowControls((value) => !value)}
      />

      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 animate-view-enter">
          <div className="flex items-center gap-3">
            <Link href="/" className="pixel-btn inline-flex h-11 items-center gap-2 bg-card px-4 font-pixel text-[10px] uppercase" data-cursor="pointer">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Link>
            <div>
              <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">{lipatovSceneConfig.scene.episode} / {lipatovSceneConfig.scene.id}</p>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">Экран интернет-банка Липатова</h1>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-wrap gap-2 overflow-hidden transition-all duration-500 ease-out",
              showControls ? "max-h-24 translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-2 opacity-0",
            )}
          >
            <PixelButton onClick={enterFullscreen}><Play className="h-4 w-4" />Fullscreen</PixelButton>
            <PixelButton onClick={openBlackout}><EyeOff className="h-4 w-4" />Blackout preview</PixelButton>
          </div>
        </header>

        <section className={cn("grid gap-5 transition-all duration-500 ease-out", showControls ? "lg:grid-cols-[minmax(0,1fr)_340px]" : "lg:grid-cols-1")}>
          <PixelCard className="min-h-[680px] overflow-hidden p-0 transition-all duration-500" as="section">
            <BankScreen
              amountDigits={amountDigits}
              amountReady={amountReady}
              maskedAmount={maskedAmount}
              onAmountDigitsChange={setAmountDigits}
              onSubmit={submitRequest}
              progressWidth={progressWidth}
              step={step}
            />
          </PixelCard>

          <aside
            className={cn(
              "space-y-5 overflow-hidden transition-all duration-500 ease-out",
              showControls ? "max-h-[1200px] translate-x-0 opacity-100" : "pointer-events-none max-h-0 translate-x-5 opacity-0 lg:hidden",
            )}
          >
            <PixelCard eyebrow="Сцена" title="Контекст для постановки">
              <div className="space-y-3 text-sm leading-relaxed text-foreground">
                <p>{lipatovSceneConfig.scene.context}</p>
                <div className="grid gap-2 text-xs">
                  <InfoPair label="Локация" value={lipatovSceneConfig.scene.location} />
                  <InfoPair label="Съёмочный день" value={lipatovSceneConfig.scene.productionDay} />
                  <InfoPair label="Подсказка" value={lipatovSceneConfig.sceneControls.blackoutHint} />
                </div>
              </div>
            </PixelCard>

            <PixelCard eyebrow="Горячие клавиши" title="Управление в кадре">
              <div className="space-y-3">
                <ControlLine icon={Keyboard} label="Enter" value="проверить платеж" />
                <ControlLine icon={MonitorOff} label="Esc" value="вернуться из затемнения" />
                <ControlLine icon={Play} label="F" value="попросить fullscreen" />
              </div>
            </PixelCard>

            <PixelCard eyebrow="Skeleton" title="Состояние загрузки">
              <div className="space-y-3">
                <PixelSkeleton className="h-10" />
                <PixelSkeleton className="h-24" />
                <PixelLoader variant="card" label="банковская обработка" />
              </div>
            </PixelCard>
          </aside>
        </section>
      </div>
    </main>
  )
}

function BankScreen({
  amountDigits,
  amountReady,
  maskedAmount,
  onAmountDigitsChange,
  onSubmit,
  progressWidth,
  step,
}: {
  amountDigits: string
  amountReady: boolean
  maskedAmount: string
  onAmountDigitsChange: (value: string) => void
  onSubmit: () => void
  progressWidth: string
  step: SceneStep
}) {
  const isProcessing = step === "processing"
  const isSuccess = step === "success"
  const isReady = step === "ready"

  return (
    <div className="flex min-h-[680px] flex-col bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground bg-background px-5 py-4">
        <div>
          <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">{lipatovSceneConfig.bank.productName}</p>
          <h2 className="text-xl font-black tracking-tight">{lipatovSceneConfig.bank.pageTitle}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <PixelStatus tone={isSuccess ? "success" : isProcessing ? "warning" : amountReady ? "success" : "info"}>{isSuccess ? "Обработана" : isProcessing ? "Проверка" : amountReady ? "К проверке" : "Черновик"}</PixelStatus>
          <PixelStatus tone="info">{lipatovSceneConfig.bank.pageSection}</PixelStatus>
        </div>
      </div>

      <div className="grid flex-1 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          <div className="border-2 border-foreground bg-background p-5 pixel-shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <label className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground" htmlFor="lipatov-amount-input">{lipatovSceneConfig.transfer.amountInputLabel}</label>
                <div className="mt-2 flex items-end gap-3">
                  <MaskedAmountInput
                    amountDigits={amountDigits}
                    disabled={!isReady}
                    maskedAmount={maskedAmount}
                    onAmountDigitsChange={onAmountDigitsChange}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{lipatovSceneConfig.transfer.amountMaskHint}</p>
                <p className="mt-1 text-xs text-muted-foreground">{lipatovSceneConfig.transfer.currencyNote}</p>
              </div>
              <div className="min-w-52 border-2 border-foreground bg-secondary p-3 text-right">
                <p className="font-pixel text-[9px] uppercase text-muted-foreground">Request ID</p>
                <p className="mt-1 font-mono text-sm font-black">{lipatovSceneConfig.transfer.requestId}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DataPanel title="Отправитель" rows={[["ФИО", lipatovSceneConfig.transfer.sender], ["Роль", lipatovSceneConfig.transfer.senderRole], ["Клиент", lipatovSceneConfig.transfer.client]]} />
            <DataPanel title="Получатель" rows={[["Получатель", lipatovSceneConfig.transfer.recipientDisplay], ["Направление", `${lipatovSceneConfig.transfer.destination}, ${lipatovSceneConfig.transfer.destinationDetail}`], ["Счёт", lipatovSceneConfig.transfer.accountDisplay]]} />
          </div>

          <div className="border-2 border-foreground bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black">Прогресс обработки</p>
              <p className="font-pixel text-[9px] uppercase text-muted-foreground">{lipatovSceneConfig.transfer.processedAt}</p>
            </div>
            <div className="h-5 border-2 border-foreground bg-secondary p-0.5">
              <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: progressWidth }} />
            </div>
          </div>

          {isReady && (
            <div className="border-2 border-foreground bg-secondary p-5 animate-view-enter">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-base font-black">Заявка готова к проверке</p>
                  <p className="mt-1 text-sm text-muted-foreground">{lipatovSceneConfig.sceneControls.enterHint}</p>
                </div>
                <PixelButton className="bg-primary text-primary-foreground" disabled={!amountReady} onClick={onSubmit}><Keyboard className="h-4 w-4" />ENTER / {lipatovSceneConfig.transfer.checkButtonText}</PixelButton>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="border-2 border-foreground bg-secondary p-6 text-center animate-transfer-in">
              <PixelLoader variant="orbit" label="обработка банковской заявки" />
              <p className="mt-4 text-sm text-muted-foreground">Система проверяет параметры требования и фиксирует событие в журнале.</p>
            </div>
          )}

          {isSuccess && (
            <div className="receipt-glow-ring border-2 border-foreground bg-accent p-6 text-accent-foreground pixel-shadow-sm animate-transfer-in">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-pixel text-[9px] uppercase tracking-wider opacity-70">финальный экран для кадра</p>
                  <h3 className="mt-2 text-4xl font-black tracking-tight">{lipatovSceneConfig.bank.statusTitle}</h3>
                  <p className="mt-3 max-w-2xl text-sm font-semibold opacity-75">{lipatovSceneConfig.bank.statusDescription}</p>
                </div>
                <BadgeCheck className="h-12 w-12" />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="border-2 border-foreground bg-background p-4 pixel-shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <ReceiptText className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black">Сводка операции</h3>
            </div>
            <div className="space-y-2">
              {auditRows.map(([label, value]) => <InfoPair key={label} label={label} value={value} />)}
            </div>
          </div>

          <div className="border-2 border-foreground bg-background p-4 pixel-shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black">Журнал</h3>
            </div>
            <TimelineRow active={amountReady} label="Сумма заполнена" time="маска .00" />
            <TimelineRow active={step !== "ready"} label="ENTER принят" time={lipatovSceneConfig.transfer.createdAt} />
            <TimelineRow active={isProcessing || isSuccess} label="Проверка запроса" time="автоматически" />
            <TimelineRow active={isSuccess} label="Заявка обработана" time={lipatovSceneConfig.transfer.processedAt} />
          </div>

          <div className="border-2 border-foreground bg-secondary p-4">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">{lipatovSceneConfig.transfer.operatorNote}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function MaskedAmountInput({ amountDigits, disabled, maskedAmount, onAmountDigitsChange }: { amountDigits: string; disabled: boolean; maskedAmount: string; onAmountDigitsChange: (value: string) => void }) {
  function appendDigit(digit: string) {
    onAmountDigitsChange(normalizeAmountDigits(`${amountDigits}${digit}`))
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) return

    if (/^\d$/.test(event.key)) {
      event.preventDefault()
      appendDigit(event.key)
      return
    }

    if (event.key === "Backspace") {
      event.preventDefault()
      onAmountDigitsChange(amountDigits.slice(0, -1))
      return
    }

    if (event.key === "Delete") {
      event.preventDefault()
      onAmountDigitsChange("")
      return
    }

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Home", "End", "Enter", "Escape"].includes(event.key)) return

    event.preventDefault()
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    onAmountDigitsChange(normalizeAmountDigits(event.clipboardData.getData("text")))
  }

  return (
    <PixelInput
      aria-label={lipatovSceneConfig.transfer.amountInputLabel}
      autoComplete="off"
      className="h-auto min-h-20 bg-card px-4 py-3 font-mono text-5xl font-black tracking-tight md:text-6xl"
      data-cursor="text"
      disabled={disabled}
      id="lipatov-amount-input"
      inputMode="numeric"
      onChange={(event) => onAmountDigitsChange(normalizeAmountDigits(event.target.value))}
      onFocus={(event) => event.currentTarget.select()}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder="0.00"
      value={maskedAmount}
    />
  )
}

function DataPanel({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="border-2 border-foreground bg-background p-4 pixel-shadow-sm">
      <h3 className="mb-3 text-sm font-black">{title}</h3>
      <div className="space-y-2">{rows.map(([label, value]) => <InfoPair key={label} label={label} value={value} />)}</div>
    </div>
  )
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"><span className="text-xs text-muted-foreground">{label}</span><span className="text-right text-xs font-black text-foreground">{value}</span></div>
}

function ControlLine({ icon: Icon, label, value }: { icon: typeof Keyboard; label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 border-2 border-foreground bg-card p-3"><span className="flex items-center gap-2 text-sm font-black"><Icon className="h-4 w-4 text-primary" />{label}</span><span className="text-right text-xs text-muted-foreground">{value}</span></div>
}

function TimelineRow({ active, label, time }: { active: boolean; label: string; time: string }) {
  return <div className={cn("flex items-center justify-between gap-3 border-b border-border py-3 last:border-0", active ? "text-foreground" : "text-muted-foreground opacity-55")}><span className="flex items-center gap-2 text-xs font-black"><TimerReset className="h-4 w-4" />{label}</span><span className="text-right font-mono text-[11px]">{time}</span></div>
}
