"use client"

import Link from "next/link"
import { useState } from "react"
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Receipt,
  LifeBuoy,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BrandMark } from "./brand-mark"

export type BankingView = "dashboard" | "cards" | "payments" | "wallet" | "savings" | "bills" | "support"

export type BankingNavItem = {
  id: BankingView
  label: string
  icon: LucideIcon
}

export const bankingNavItems: BankingNavItem[] = [
  { id: "dashboard", label: "Главная", icon: LayoutDashboard },
  { id: "cards", label: "Карты", icon: CreditCard },
  { id: "payments", label: "Платежи", icon: ArrowLeftRight },
  { id: "wallet", label: "BLOK-кошелёк", icon: Wallet },
  { id: "savings", label: "Накопления", icon: PiggyBank },
  { id: "bills", label: "Счета", icon: Receipt },
]

type SidebarProps = {
  active?: BankingView
  onNavigate?: (view: BankingView) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const [internalActive, setInternalActive] = useState<BankingView>("dashboard")
  const selected = active ?? internalActive

  function navigate(view: BankingView) {
    setInternalActive(view)
    onNavigate?.(view)
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r-2 border-foreground bg-sidebar p-4 lg:flex">
      <div className="flex items-center gap-3 px-1 py-2">
        <span className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground pixel-shadow-sm">
          <BrandMark className="h-5 w-5" />
        </span>
        <span className="font-pixel text-sm tracking-tight text-foreground">VOXEL</span>
      </div>

      <nav className="mt-7 flex flex-col gap-1.5" aria-label="Навигация банка">
        <p className="px-1 pb-2 font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">Меню</p>
        {bankingNavItems.map((item) => {
          const Icon = item.icon
          const isActive = selected === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-full border-2 px-3 py-2.5 text-sm font-black transition-all duration-150",
                isActive
                  ? "border-foreground bg-primary text-primary-foreground pixel-shadow-sm"
                  : "border-transparent text-muted-foreground hover:border-foreground hover:bg-secondary hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5">
        <Link href="/preferences" className="flex cursor-pointer items-center gap-3 rounded-full border-2 border-transparent px-3 py-2.5 text-sm font-black text-muted-foreground transition-all hover:border-foreground hover:bg-secondary hover:text-foreground">
          <SlidersHorizontal className="h-[18px] w-[18px]" />
          Настройки
        </Link>

        <button onClick={() => navigate("support")} className={cn("flex cursor-pointer items-center gap-3 rounded-full border-2 px-3 py-2.5 text-sm font-black transition-all", selected === "support" ? "border-foreground bg-primary text-primary-foreground pixel-shadow-sm" : "border-transparent text-muted-foreground hover:border-foreground hover:bg-secondary hover:text-foreground")} aria-current={selected === "support" ? "page" : undefined}>
          <LifeBuoy className="h-[18px] w-[18px]" />
          Поддержка
        </button>

        <div className="mt-3 rounded-[24px] border-2 border-foreground bg-accent p-4 pixel-shadow">
          <p className="font-pixel text-[10px] uppercase leading-relaxed text-accent-foreground">Центр управления</p>
          <p className="mt-2 text-xs leading-relaxed text-accent-foreground/80">Тема, локализация, анимации, glow, курсор, контакты и параметры переводов живут в настройках.</p>
          <Link href="/preferences" className="pixel-btn mt-3 inline-flex w-full cursor-pointer justify-center bg-primary px-3 py-2 font-pixel text-[9px] uppercase text-primary-foreground">Открыть</Link>
        </div>
      </div>
    </aside>
  )
}
