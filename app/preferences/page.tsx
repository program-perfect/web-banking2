import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { BrandMark } from "@/components/banking/brand-mark"
import { PreferencesPanel } from "@/components/banking/preferences-panel"

export default function PreferencesPage() {
  return (
    <div className="min-h-svh bg-background neo-mobile-shell">
      <header className="sticky top-0 z-20 border-b-2 border-foreground bg-background/90 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
          <Link href="/" className="pixel-btn inline-flex h-10 items-center gap-2 bg-card px-3 font-pixel text-[10px] uppercase text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Link>

          <div className="ml-2 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground pixel-shadow-sm">
              <BrandMark className="h-5 w-5" />
            </span>
            <div>
              <p className="font-pixel text-[10px] uppercase tracking-wider text-muted-foreground">VOXEL control center</p>
              <h1 className="text-lg font-black text-foreground">Настройки</h1>
            </div>
          </div>

          <Link href="/" className="pixel-btn ml-auto hidden h-10 items-center gap-2 bg-primary px-4 font-pixel text-[10px] uppercase text-primary-foreground sm:inline-flex">
            <Home className="h-4 w-4" />
            Главная
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
        <div className="mb-6 animate-view-enter">
          <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">Все параметры</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Профиль, тема, анимации и курсор</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Отдельный neo-brutal центр управления: имя, локализация, cursor modes, glow, пиксельные градиенты и motion.
          </p>
        </div>

        <PreferencesPanel />
      </main>
    </div>
  )
}
