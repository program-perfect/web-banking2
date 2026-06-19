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
  Phone,
  PiggyBank,
  Plus,
  Receipt,
  Search,
  Send,
  ShieldCheck,
  Target,
  UserRound,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Sidebar, bankingNavItems, type BankingView } from "@/components/banking/sidebar"
import { Topbar } from "@/components/banking/topbar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { accounts, cards, contacts, cryptoAssets, formatUsd, transactions } from "@/lib/bank-data"
import { cn } from "@/lib/utils"
import { useAppPreferences } from "@/components/banking/app-preferences"
import { PixelAmount, PixelButton, PixelCard, PixelInput, PixelSkeleton, PixelStatus } from "@/components/banking/pixel-ui"

const viewCopy: Record<BankingView, { title: string; description: string }> = {
  dashboard: { title: "Главная", description: "Общий баланс, быстрые переводы, карты и активность в одном neo-brutal окне." },
  cards: { title: "Карты", description: "Физические и виртуальные карты, лимиты, блокировки и операции." },
  payments: { title: "Платежи", description: "Переводы по контактам, карте или телефону с отдельной страницей каждой операции." },
  wallet: { title: "BLOK-кошелёк", description: "Активы, стейкинг, on-chain действия и движение портфеля." },
  savings: { title: "Накопления", description: "Цели, автоправила и прогресс накоплений." },
  bills: { title: "Счета", description: "Автоплатежи, коммунальные счета, подписки и статус оплат." },
  support: { title: "Поддержка", description: "Безопасность, заявки и быстрые действия поддержки." },
}

type Operation = {
  id: string
  name: string
  handle: string
  initials: string
  amount: number
  date: string
  status: "completed" | "pending"
  method: "Контакт" | "Карта" | "Телефон"
}

const paymentHistory: Operation[] = [
  { id: "op-1", name: "Мария Лопес", handle: "@maria", initials: "МЛ", amount: -250, date: "Вчера, 18:40", status: "pending", method: "Контакт" },
  { id: "op-2", name: "Джеймс Картер", handle: "Карта **** 9021", initials: "ДК", amount: -75, date: "17 июн, 11:12", status: "completed", method: "Карта" },
  { id: "op-3", name: "София Рейес", handle: "+1 555 011 489", initials: "СР", amount: 120, date: "16 июн, 09:05", status: "completed", method: "Телефон" },
]

const bills = [
  { id: "b1", name: "Электричество", category: "Коммунальные", due: "22 июн", amount: 148.2, autopay: true, status: "scheduled" },
  { id: "b2", name: "Домашний интернет", category: "Дом", due: "24 июн", amount: 79.99, autopay: true, status: "scheduled" },
  { id: "b3", name: "Аренда квартиры", category: "Жильё", due: "01 июл", amount: 2400, autopay: false, status: "due" },
  { id: "b4", name: "BLOK Pro", category: "Подписка", due: "Оплачено", amount: 19, autopay: true, status: "paid" },
] as const

const savingsVaults = [
  { id: "sv1", name: "Резервный фонд", target: 18000, saved: 12480, rule: "$400 каждый месяц", apy: "4.6%" },
  { id: "sv2", name: "Поездка в Японию", target: 6500, saved: 3920, rule: "$75 каждую неделю", apy: "3.8%" },
  { id: "sv3", name: "Новое железо", target: 4200, saved: 3180, rule: "Округления", apy: "2.4%" },
]

const supportTickets = [
  { id: "SUP-1042", title: "Проверка лимита travel-карты", status: "Ждёт оператора", updated: "12 мин назад" },
  { id: "SUP-1039", title: "Отслеживание возврата от магазина", status: "В работе", updated: "Сегодня" },
  { id: "SUP-1028", title: "Подтверждение нового устройства", status: "Решено", updated: "15 июн" },
]

const transferStats = [
  { label: "2FA", value: "Ключ доступа" },
  { label: "Лимит", value: "$10k" },
  { label: "Комиссия", value: "$0–0.35" },
  { label: "Скорость", value: "Мгновенно" },
]

export function BankingShell() {
  const [activeView, setActiveView] = useState<BankingView>("dashboard")
  const { profileName } = useAppPreferences()
  const current = viewCopy[activeView]

  return (
    <div className="flex min-h-svh bg-background neo-mobile-shell">
      <Sidebar active={activeView} onNavigate={setActiveView} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <MobileTabs active={activeView} onNavigate={setActiveView} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
          <div className="mb-6 animate-view-enter">
            <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">VOXEL / {viewCopy[activeView].title}</p>
            <h1 className="text-3xl font-black tracking-tight text-foreground text-balance">{current.title}, {profileName}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{current.description}</p>
          </div>

          <section id={activeView} key={activeView} className="animate-view-enter">
            {activeView === "dashboard" && <DashboardView />}
            {activeView === "payments" && <PaymentsView />}
            {activeView === "cards" && <CardsView />}
            {activeView === "wallet" && <WalletView />}
            {activeView === "savings" && <SavingsView />}
            {activeView === "bills" && <BillsView />}
            {activeView === "support" && <SupportView />}
          </section>
        </main>
      </div>
    </div>
  )
}

function MobileTabs({ active, onNavigate }: { active: BankingView; onNavigate: (view: BankingView) => void }) {
  const mobileItems: Array<{ id: BankingView; label: string; icon: LucideIcon }> = [
    ...bankingNavItems,
    { id: "support", label: "Поддержка", icon: LifeBuoy },
  ]

  return (
    <div className="border-b-2 border-foreground bg-background px-3 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border-2 px-3 py-2 text-xs font-black transition-all",
                isActive ? "border-foreground bg-primary text-primary-foreground pixel-shadow-sm" : "border-foreground bg-card text-foreground hover:bg-secondary",
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
  const walletTotal = cryptoAssets.reduce((sum, asset) => sum + asset.amount * asset.priceUsd, 0)
  const upcomingBills = bills.filter((bill) => bill.status !== "paid").reduce((sum, bill) => sum + bill.amount, 0)

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <PixelCard className="payment-hero-card lg:col-span-2 pixel-gradient" eyebrow="Общий баланс" title={<PixelAmount value={total} className="text-3xl font-black" />} action={<PixelStatus tone="success">+6.8%</PixelStatus>}>
        <div className="grid gap-3 md:grid-cols-3">
          {accounts.map((account) => <AccountTile key={account.id} title={account.name} detail={`${account.type} · ${account.number}`} amount={account.balance} />)}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <NewTransferButton className="bg-primary text-primary-foreground" />
          <PixelButton><ArrowDownLeft className="h-4 w-4" />Запросить</PixelButton>
        </div>
      </PixelCard>

      <PixelCard title="Быстрые платежи" eyebrow="Контакты">
        <div className="flex -space-x-2">
          {contacts.map((contact) => <Avatar key={contact.id} className="h-10 w-10 rounded-none border-2 border-foreground"><AvatarFallback className="rounded-none bg-secondary text-xs font-black text-secondary-foreground">{contact.initials}</AvatarFallback></Avatar>)}
        </div>
        <Link href={`/payments/${paymentHistory[0].id}`} className="mt-4 flex cursor-pointer items-center justify-between border-2 border-foreground bg-secondary p-3 hover:bg-card pixel-shadow-sm">
          <span><span className="block text-sm font-black text-foreground">Последняя операция</span><span className="block text-xs text-muted-foreground">{paymentHistory[0].name}</span></span>
          <PixelAmount value={paymentHistory[0].amount} sign className="text-sm font-black" />
        </Link>
      </PixelCard>

      <div className="grid gap-5 lg:col-span-3 md:grid-cols-3">
        <MetricCard icon={CreditCard} label="Карты" value={String(cards.length)} detail="Физические и виртуальные" />
        <MetricCard icon={Wallet} label="BLOK-кошелёк" value={formatUsd(walletTotal)} detail="Активы и стейкинг" />
        <MetricCard icon={Receipt} label="Счета" value={formatUsd(upcomingBills)} detail="Следующие 30 дней" />
      </div>

      <PixelCard className="lg:col-span-3" title="Активность" action={<PixelStatus tone="info">Живая лента</PixelStatus>}>
        <LedgerList items={transactions.slice(0, 5).map((tx) => ({ id: tx.id, title: tx.merchant, subtitle: `${tx.category} · ${tx.date}`, amount: tx.amount }))} />
      </PixelCard>
    </div>
  )
}

function PaymentsView() {
  const outgoing = paymentHistory.filter((operation) => operation.amount < 0).reduce((sum, operation) => sum + Math.abs(operation.amount), 0)
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <PixelCard className="payment-hero-card lg:col-span-2 pixel-gradient" eyebrow="Платежи" title="Перевести деньги">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="space-y-4">
            <p className="max-w-xl text-sm leading-relaxed text-foreground">Каждый перевод открывается как отдельная страница операции: выбор получателя, сумма, проверка, обработка, эффект успеха и чек.</p>
            <div className="payment-stat-strip">{transferStats.map((stat) => <InfoPill key={stat.label} label={stat.label} value={stat.value} />)}</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <TransferMethodCard icon={UserRound} label="Контакты" value={`${contacts.length} сохранено`} />
              <TransferMethodCard icon={CreditCard} label="Карта" value="16 цифр" />
              <TransferMethodCard icon={Phone} label="Телефон" value="Поиск банка" />
            </div>
          </div>
          <div className="flex flex-col justify-between border-2 border-foreground bg-card p-4 pixel-shadow-sm">
            <div><p className="font-pixel text-[9px] uppercase text-muted-foreground">Новая операция</p><p className="mt-2 text-sm text-foreground">Создай черновик перевода с собственным адресом и банковским чеком.</p></div>
            <NewTransferButton className="mt-4 w-full bg-primary text-primary-foreground" />
          </div>
        </div>
      </PixelCard>

      <PixelCard title="Сводка" eyebrow="Сегодня">
        <div className="space-y-3">
          <InfoLine icon={Send} label="Отправлено" value={formatUsd(outgoing)} />
          <InfoLine icon={BadgeCheck} label="Успешность" value="99.8%" />
          <InfoLine icon={ShieldCheck} label="Проверки риска" value="3/3" />
        </div>
      </PixelCard>

      <PixelCard className="lg:col-span-2" title="История операций" action={<SearchBox />}>
        <div className="divide-y-2 divide-border border-2 border-foreground bg-card">{paymentHistory.map((operation) => <Link key={operation.id} href={`/payments/${operation.id}`} className="block cursor-pointer hover:bg-secondary"><HistoryRow operation={operation} /></Link>)}</div>
      </PixelCard>

      <PixelCard title="Скелетоны и загрузка" eyebrow="Превью"><div className="space-y-3"><PixelSkeleton className="h-10" /><PixelSkeleton className="h-24" /><PixelSkeleton className="h-10 w-2/3" /></div></PixelCard>
    </div>
  )
}

function CardsView() {
  const available = cards.reduce((sum, card) => sum + card.balance, 0)
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <MetricCard icon={CreditCard} label="Доступно" value={formatUsd(available)} detail={`${cards.length} карты`} />
      <MetricCard icon={Lock} label="Заморожено" value={String(cards.filter((card) => card.frozen).length)} detail="Мгновенное управление" />
      <MetricCard icon={ShieldCheck} label="3DS" value="Вкл" detail="Каждая карта защищена" />
      <PixelCard className="lg:col-span-3" title="Карты">
        <div className="grid gap-4 lg:grid-cols-3">
          {cards.map((card) => <div key={card.id} className="flex min-h-48 flex-col justify-between border-2 border-foreground bg-secondary p-5 pixel-shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-foreground">{card.label}</p><p className="text-xs text-muted-foreground">{card.network}</p></div><PixelStatus tone={card.frozen ? "warning" : "success"}>{card.frozen ? "Заморожена" : "Активна"}</PixelStatus></div><p className="font-mono text-lg tracking-[0.18em] text-foreground">•••• {card.last4}</p><div className="flex items-end justify-between gap-3"><span><span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Владелец</span><span className="block text-sm font-black text-foreground">{card.holder}</span></span><span className="text-right"><span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Баланс</span><PixelAmount value={card.balance} className="text-sm font-black" /></span></div></div>)}
        </div>
      </PixelCard>
    </div>
  )
}

function WalletView() {
  const totalAssets = cryptoAssets.reduce((sum, asset) => sum + asset.amount * asset.priceUsd, 0)
  const actions = ["Получить", "Отправить", "Обменять", "Стейкинг"]
  return <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><MetricCard icon={Wallet} label="Стоимость" value={formatUsd(totalAssets)} detail="BLOK-активы" /><MetricCard icon={Zap} label="APY стейкинга" value="4.6%" detail="Ежедневные награды" /><MetricCard icon={ArrowUpRight} label="24 ч" value="+7.2%" detail="Портфель" /><PixelCard className="lg:col-span-2" title="Активы" action={<PixelStatus tone="success">On-chain</PixelStatus>}><div className="divide-y-2 divide-border border-2 border-foreground bg-card">{cryptoAssets.map((asset) => <div key={asset.id} className="flex items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary font-pixel text-[9px]">{asset.symbol.slice(0, 3)}</span><div><p className="text-sm font-black text-foreground">{asset.name}</p><p className="text-xs text-muted-foreground">{asset.amount.toLocaleString("ru-RU")} {asset.symbol}</p></div></div><div className="text-right"><PixelAmount value={asset.amount * asset.priceUsd} className="text-sm font-black" /><p className={cn("text-xs font-black", asset.change24h >= 0 ? "text-success" : "text-destructive")}>{asset.change24h >= 0 ? "+" : ""}{asset.change24h}%</p></div></div>)}</div></PixelCard><PixelCard title="Действия"><div className="grid gap-3">{actions.map((label) => <PixelButton key={label} className="w-full justify-between">{label}<ArrowUpRight className="h-4 w-4" /></PixelButton>)}</div></PixelCard></div>
}

function SavingsView() {
  const savedTotal = savingsVaults.reduce((sum, vault) => sum + vault.saved, 0)
  const targetTotal = savingsVaults.reduce((sum, vault) => sum + vault.target, 0)
  return <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><MetricCard icon={PiggyBank} label="Накоплено" value={formatUsd(savedTotal)} detail={`${Math.round((savedTotal / targetTotal) * 100)}% целей`} /><MetricCard icon={Target} label="Цель" value={formatUsd(targetTotal)} detail="3 сейфа" /><MetricCard icon={Landmark} label="Автосбережения" value="$700" detail="Правила активны" /><PixelCard className="lg:col-span-2" title="Сейфы"><div className="space-y-4">{savingsVaults.map((vault) => { const progress = Math.round((vault.saved / vault.target) * 100); return <div key={vault.id} className="border-2 border-foreground bg-secondary p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-black text-foreground">{vault.name}</p><p className="text-xs text-muted-foreground">{vault.rule} · {vault.apy} APY</p></div><p className="text-sm font-black tabular-nums text-foreground">{formatUsd(vault.saved)} / {formatUsd(vault.target)}</p></div><div className="mt-4 h-3 border-2 border-foreground bg-card"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div></div>})}</div></PixelCard><PixelCard title="Умные правила"><div className="space-y-3">{["Округлять каждую покупку", "Переводить 12% зарплаты", "Ускорять каждую пятницу"].map((rule) => <InfoLine key={rule} icon={BadgeCheck} label={rule} value="Вкл" />)}</div></PixelCard></div>
}

function BillsView() {
  const upcomingTotal = bills.filter((bill) => bill.status !== "paid").reduce((sum, bill) => sum + bill.amount, 0)
  return <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><MetricCard icon={Receipt} label="К оплате" value={formatUsd(upcomingTotal)} detail="Следующие 30 дней" /><MetricCard icon={CalendarClock} label="Автоплатёж" value="3" detail="Без пропусков" /><MetricCard icon={FileText} label="Оплачено" value="$19.00" detail="В этом месяце" /><PixelCard className="lg:col-span-3" title="Счета" action={<PixelButton><Plus className="h-4 w-4" />Добавить счёт</PixelButton>}><div className="divide-y-2 divide-border border-2 border-foreground bg-card">{bills.map((bill) => <div key={bill.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary"><Receipt className="h-4 w-4 text-primary" /></span><div><p className="text-sm font-black text-foreground">{bill.name}</p><p className="text-xs text-muted-foreground">{bill.category} · {bill.due}</p></div></div><div className="text-right"><PixelAmount value={bill.amount} className="text-sm font-black" /><PixelStatus tone={bill.status === "paid" ? "success" : bill.autopay ? "info" : "warning"}>{bill.status === "paid" ? "Оплачено" : bill.autopay ? "Авто" : "Вручную"}</PixelStatus></div></div>)}</div></PixelCard></div>
}

function SupportView() {
  const actions = [{ label: "Чат", icon: LifeBuoy }, { label: "Заблокировать счёт", icon: Lock }, { label: "Сообщить о карте", icon: CreditCard }]
  return <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><PixelCard className="lg:col-span-2" eyebrow="Центр помощи" title="Как помочь?" action={<PixelStatus tone="success">4 мин</PixelStatus>}><div className="grid gap-3 sm:grid-cols-3">{actions.map(({ label, icon: Icon }) => <button key={label} className="flex min-h-28 cursor-pointer flex-col items-start justify-between border-2 border-foreground bg-card p-4 text-left hover:bg-secondary"><Icon className="h-5 w-5 text-primary" /><span className="text-sm font-black text-foreground">{label}</span></button>)}</div><div className="mt-6 divide-y-2 divide-border border-2 border-foreground bg-card">{supportTickets.map((ticket) => <div key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-black text-foreground">{ticket.title}</p><p className="text-xs text-muted-foreground">{ticket.id} · {ticket.updated}</p></div><PixelStatus tone={ticket.status === "Решено" ? "success" : "info"}>{ticket.status}</PixelStatus></div>)}</div></PixelCard><PixelCard title="Безопасность"><div className="space-y-3"><InfoLine icon={ShieldCheck} label="Ключ доступа" value="Включён" /><InfoLine icon={Lock} label="2FA" value="Активна" /><InfoLine icon={BadgeCheck} label="Устройство" value="Проверено" /></div></PixelCard></div>
}

function NewTransferButton({ className }: { className?: string }) {
  const router = useRouter()
  return <PixelButton className={className} onClick={() => router.push(`/payments/tr-${Date.now().toString(36)}`)}><ArrowUpRight className="h-4 w-4" />Новый перевод</PixelButton>
}

function TransferMethodCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="border-2 border-foreground bg-card p-3 pixel-shadow-sm"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-sm font-black text-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground">{value}</p></div>
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return <PixelCard><div className="flex items-center justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary"><Icon className="h-4 w-4 text-primary" /></span><ArrowUpRight className="h-4 w-4 text-muted-foreground" /></div><p className="mt-4 text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-black tracking-tight text-foreground tabular-nums">{value}</p><p className="mt-2 text-xs text-muted-foreground">{detail}</p></PixelCard>
}

function AccountTile({ title, detail, amount }: { title: string; detail: string; amount: number }) {
  return <div className="border-2 border-foreground bg-secondary p-4 pixel-shadow-sm"><p className="text-sm font-black text-foreground">{title}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p><p className="mt-4 text-lg font-black tabular-nums text-foreground"><PixelAmount value={amount} /></p></div>
}

function LedgerList({ items }: { items: Array<{ id: string; title: string; subtitle: string; amount: number }> }) {
  return <div className="divide-y-2 divide-border border-2 border-foreground bg-card">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-black text-foreground">{item.title}</p><p className="text-xs text-muted-foreground">{item.subtitle}</p></div><PixelAmount value={item.amount} sign className={cn("text-sm font-black", item.amount > 0 ? "text-success" : "text-foreground")} /></div>)}</div>
}

function HistoryRow({ operation }: { operation: Operation }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><Avatar className="h-10 w-10 rounded-none border-2 border-foreground"><AvatarFallback className="rounded-none bg-secondary text-xs font-black text-secondary-foreground">{operation.initials}</AvatarFallback></Avatar><div><p className="text-sm font-black text-foreground">{operation.name}</p><p className="text-xs text-muted-foreground">{operation.method} · {operation.handle} · {operation.date}</p></div></div><div className="text-right"><PixelAmount value={operation.amount} sign className={cn("text-sm font-black", operation.amount < 0 ? "text-foreground" : "text-success")} /><PixelStatus tone={operation.status === "completed" ? "success" : "warning"}>{operation.status === "completed" ? "Готово" : "В пути"}</PixelStatus></div></div>
}

function InfoLine({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 border-2 border-foreground bg-secondary p-3"><span className="flex items-center gap-2 text-sm font-black text-foreground"><Icon className="h-4 w-4 text-primary" />{label}</span><span className="text-sm font-black text-foreground">{value}</span></div>
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-full border-2 border-foreground bg-card px-3 py-2 text-center pixel-shadow-sm"><p className="font-pixel text-[8px] uppercase text-muted-foreground">{label}</p><p className="mt-1 truncate text-xs font-black text-foreground">{value}</p></div>
}

function SearchBox() {
  return <div className="relative w-full max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><PixelInput placeholder="Поиск операций" className="pl-9" /></div>
}
