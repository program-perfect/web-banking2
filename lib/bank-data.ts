export type Account = {
  id: string
  name: string
  type: "Checking" | "Savings" | "Crypto"
  number: string
  balance: number
  currency: string
  delta: number // % change this month
}

export type CardItem = {
  id: string
  label: string
  holder: string
  last4: string
  expiry: string
  network: "Visa" | "Mastercard"
  variant: "brand" | "ink" | "ghost"
  balance: number
  frozen: boolean
}

export type Tx = {
  id: string
  merchant: string
  category: string
  date: string
  amount: number // negative = outgoing
  status: "completed" | "pending"
  initials: string
}

export type CryptoAsset = {
  id: string
  name: string
  symbol: string
  amount: number
  priceUsd: number
  change24h: number
}

export type Contact = {
  id: string
  name: string
  handle: string
  initials: string
}

export const accounts: Account[] = [
  { id: "main", name: "Основной счёт", type: "Checking", number: "**** 4921", balance: 18420.55, currency: "USD", delta: 4.2 },
  { id: "save", name: "Накопительный сейф", type: "Savings", number: "**** 7730", balance: 52800.0, currency: "USD", delta: 1.8 },
  { id: "voxel", name: "VOXEL-кошелёк", type: "Crypto", number: "VX...8f2c", balance: 9314.27, currency: "USD", delta: 12.6 },
]

export const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

export const cards: CardItem[] = [
  { id: "c1", label: "VOXEL Metal", holder: "ALEX MORGAN", last4: "4921", expiry: "08/28", network: "Visa", variant: "brand", balance: 18420.55, frozen: false },
  { id: "c2", label: "Ежедневная", holder: "ALEX MORGAN", last4: "1180", expiry: "03/27", network: "Mastercard", variant: "ink", balance: 2140.1, frozen: false },
  { id: "c3", label: "Путешествия", holder: "ALEX MORGAN", last4: "5562", expiry: "11/26", network: "Visa", variant: "ghost", balance: 760.42, frozen: true },
]

export const transactions: Tx[] = [
  { id: "t1", merchant: "Магазин техники", category: "Электроника", date: "Сегодня, 14:32", amount: -1299.0, status: "completed", initials: "ТЕ" },
  { id: "t2", merchant: "Зарплата — Vercel Inc.", category: "Доход", date: "Сегодня, 09:00", amount: 6800.0, status: "completed", initials: "VC" },
  { id: "t3", merchant: "Spotify", category: "Подписка", date: "Вчера", amount: -10.99, status: "completed", initials: "SP" },
  { id: "t4", merchant: "Мария Лопес", category: "Перевод", date: "Вчера", amount: -250.0, status: "pending", initials: "МЛ" },
  { id: "t5", merchant: "Продуктовый маркет", category: "Продукты", date: "16 июн", amount: -86.43, status: "completed", initials: "ПР" },
  { id: "t6", merchant: "Награда VOXEL Staking", category: "Крипто", date: "15 июн", amount: 42.18, status: "completed", initials: "VX" },
  { id: "t7", merchant: "Такси", category: "Транспорт", date: "15 июн", amount: -23.7, status: "completed", initials: "ТК" },
  { id: "t8", merchant: "Бронирование отеля", category: "Путешествия", date: "14 июн", amount: -540.0, status: "completed", initials: "ОТ" },
]

export const cryptoAssets: CryptoAsset[] = [
  { id: "voxl", name: "Voxel", symbol: "VOXL", amount: 1240.5, priceUsd: 5.42, change24h: 6.4 },
  { id: "pixl", name: "Pixel", symbol: "PIXL", amount: 38200, priceUsd: 0.061, change24h: 12.9 },
  { id: "usdt", name: "Tether", symbol: "USDT", amount: 2500, priceUsd: 1.0, change24h: 0.01 },
]

export const contacts: Contact[] = [
  { id: "p1", name: "Мария Лопес", handle: "@maria", initials: "МЛ" },
  { id: "p2", name: "Джеймс Картер", handle: "@jcarter", initials: "ДК" },
  { id: "p3", name: "София Рейес", handle: "@sofia", initials: "СР" },
  { id: "p4", name: "Лиам Чен", handle: "@liam", initials: "ЛЧ" },
]

// 7-month balance trend for the area chart
export const balanceTrend = [
  { month: "Янв", balance: 41200, spending: 3200 },
  { month: "Фев", balance: 44800, spending: 4100 },
  { month: "Мар", balance: 47100, spending: 2900 },
  { month: "Апр", balance: 53600, spending: 5200 },
  { month: "Май", balance: 61400, spending: 3800 },
  { month: "Июн", balance: 68900, spending: 4600 },
  { month: "Июл", balance: 80534, spending: 4200 },
]

export const spendingByCategory = [
  { category: "Покупки", value: 1680, fill: "var(--color-chart-1)" },
  { category: "Путешествия", value: 1080, fill: "var(--color-chart-2)" },
  { category: "Еда", value: 640, fill: "var(--color-chart-3)" },
  { category: "Транспорт", value: 320, fill: "var(--color-chart-4)" },
  { category: "Другое", value: 480, fill: "var(--color-chart-5)" },
]

export function formatUsd(n: number, opts?: { sign?: boolean }) {
  const formatted = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))
  if (opts?.sign) return `${n < 0 ? "−" : "+"}${formatted}`
  return n < 0 ? `−${formatted}` : formatted
}
