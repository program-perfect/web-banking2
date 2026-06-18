"use client"

import Link from "next/link"
import { ArrowLeftRight, Bell, CreditCard, Home, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Wallet } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BrandMark } from "./brand-mark"
import { useAppPreferences } from "@/components/banking/app-preferences"

const centerActions = [
  { href: "/", labelRu: "Главная", labelEn: "Home", icon: Home },
  { href: "/#payments", labelRu: "Платежи", labelEn: "Payments", icon: ArrowLeftRight },
  { href: "/#cards", labelRu: "Карты", labelEn: "Cards", icon: CreditCard },
  { href: "/#wallet", labelRu: "Кошелёк", labelEn: "Wallet", icon: Wallet },
  { href: "/preferences", labelRu: "Настройки", labelEn: "Settings", icon: Settings },
]

export function Topbar() {
  const { profileName, t } = useAppPreferences()

  return (
    <header className="neo-topbar sticky top-0 z-20 border-b-2 border-foreground bg-background/90 px-3 py-3 backdrop-blur-md md:px-6">
      <div className="neo-topbar__rail mx-auto max-w-7xl">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2" data-cursor="pointer" aria-label="VOXEL">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground pixel-shadow-sm">
              <BrandMark className="h-5 w-5" />
            </span>
            <span className="hidden font-pixel text-xs tracking-tight text-foreground sm:inline">VOXEL</span>
          </Link>

          <div className="relative hidden w-full max-w-xs xl:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder={t("Поиск операций, карт, людей…", "Search transactions, cards, people…")}
              aria-label={t("Поиск", "Search")}
              className="h-11 w-full rounded-full border-2 border-foreground bg-secondary pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-card"
            />
          </div>
        </div>

        <nav className="neo-topbar__center" aria-label={t("Быстрые действия", "Quick actions")}> 
          {centerActions.map(({ href, labelRu, labelEn, icon: Icon }, index) => (
            <Link
              key={href + labelEn}
              href={href}
              className={`pixel-btn inline-flex h-10 shrink-0 items-center gap-2 bg-card px-3 font-pixel text-[9px] uppercase text-foreground ${index > 2 ? "hide-on-phone" : ""}`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{t(labelRu, labelEn)}</span>
            </Link>
          ))}
        </nav>

        <div className="neo-topbar__right">
          <Link
            href="/payments/tr-new"
            className="pixel-btn inline-flex h-10 items-center gap-2 bg-primary px-3 font-pixel text-[9px] uppercase text-primary-foreground sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Перевод", "Transfer")}</span>
          </Link>

          <Link
            href="/preferences"
            className="pixel-btn hide-on-phone inline-flex h-10 items-center gap-2 bg-card px-3 font-pixel text-[9px] uppercase text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden lg:inline">{t("Тема", "Theme")}</span>
          </Link>

          <button
            aria-label={t("Уведомления", "Notifications")}
            className="relative inline-flex h-10 w-10 items-center justify-center border-2 border-foreground bg-card text-foreground transition-colors hover:bg-secondary pixel-shadow-sm"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>

          <button className="flex h-10 items-center gap-2 border-2 border-foreground bg-card p-1 pr-2 transition-colors hover:bg-secondary pixel-shadow-sm sm:pr-3" data-cursor="pointer">
            <Avatar className="h-8 w-8 rounded-none">
              <AvatarFallback className="rounded-none bg-primary font-pixel text-[9px] text-primary-foreground">
                {profileName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-24 truncate text-sm font-black text-foreground sm:inline">{profileName}</span>
            <ShieldCheck className="hidden h-4 w-4 text-primary md:block" />
          </button>
        </div>
      </div>
    </header>
  )
}
