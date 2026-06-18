"use client"

import Link from "next/link"
import { ArrowLeftRight, Bell, CreditCard, Home, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Wallet } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppPreferences } from "@/components/banking/app-preferences"

const centerActions = [
  { href: "/", labelRu: "Главная", labelEn: "Home", icon: Home, mobilePrimary: true },
  { href: "/#payments", labelRu: "Платежи", labelEn: "Payments", icon: ArrowLeftRight },
  { href: "/#cards", labelRu: "Карты", labelEn: "Cards", icon: CreditCard },
  { href: "/#wallet", labelRu: "Кошелёк", labelEn: "Wallet", icon: Wallet },
  { href: "/preferences", labelRu: "Настройки", labelEn: "Settings", icon: Settings },
]

export function Topbar() {
  const { profileName, t } = useAppPreferences()

  return (
    <header className="neo-topbar sticky top-0 z-20 w-full border-b-2 border-foreground bg-background px-3 py-3 md:px-6">
      <div className="neo-topbar__rail w-full">
        <div className="neo-topbar__left min-w-0">
          <div className="relative hidden w-full max-w-md xl:block">
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
          {centerActions.map(({ href, labelRu, labelEn, icon: Icon, mobilePrimary }, index) => (
            <Link
              key={href + labelEn}
              href={href}
              className={`neo-topbar__action pixel-btn inline-flex h-10 shrink-0 items-center justify-center gap-2 bg-card px-3 font-pixel text-[9px] uppercase text-foreground ${mobilePrimary ? "neo-topbar__action--primary" : ""} ${index > 3 ? "hide-on-phone" : ""}`}
              data-cursor="pointer"
            >
              <Icon className="h-4 w-4" />
              <span className={mobilePrimary ? "neo-topbar__home-label" : "hidden md:inline"}>{t(labelRu, labelEn)}</span>
            </Link>
          ))}
        </nav>

        <div className="neo-topbar__right">
          <Link
            href="/payments/tr-new"
            className="neo-topbar__transfer pixel-btn inline-flex h-10 items-center justify-center gap-2 bg-primary px-3 font-pixel text-[9px] uppercase text-primary-foreground sm:px-4"
            data-cursor="pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Перевод", "Transfer")}</span>
          </Link>

          <Link
            href="/preferences"
            className="pixel-btn hide-on-phone inline-flex h-10 items-center gap-2 bg-card px-3 font-pixel text-[9px] uppercase text-foreground"
            data-cursor="pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden lg:inline">{t("Тема", "Theme")}</span>
          </Link>

          <button
            aria-label={t("Уведомления", "Notifications")}
            className="hide-on-phone relative inline-flex h-10 w-10 items-center justify-center border-2 border-foreground bg-card text-foreground transition-colors hover:bg-secondary pixel-shadow-sm"
            data-cursor="pointer"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>

          <button className="hide-on-phone flex h-10 items-center gap-2 border-2 border-foreground bg-card p-1 pr-2 transition-colors hover:bg-secondary pixel-shadow-sm sm:pr-3" data-cursor="pointer">
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
