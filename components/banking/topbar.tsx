"use client"

import Link from "next/link"
import { Search, Bell, Plus, SlidersHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BrandMark } from "./brand-mark"

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b-2 border-foreground bg-background/90 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-7 w-7 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
          <BrandMark className="h-4 w-4" />
        </span>
        <span className="font-pixel text-xs tracking-tight">VOXEL</span>
      </div>

      <div className="relative ml-auto hidden w-full max-w-sm md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search transactions, cards, people…"
          aria-label="Search"
          className="h-10 w-full border-2 border-foreground bg-secondary pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-card"
        />
      </div>

      <Link
        href="/preferences"
        className="pixel-btn inline-flex h-10 items-center gap-2 bg-card px-3 font-pixel text-[10px] uppercase text-foreground"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">Settings</span>
      </Link>

      <button className="pixel-btn ml-auto inline-flex h-10 items-center gap-2 bg-primary px-4 font-pixel text-[10px] uppercase text-primary-foreground md:ml-0">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add money</span>
      </button>

      <button
        aria-label="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center border-2 border-foreground bg-card text-foreground transition-colors hover:bg-secondary"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 bg-destructive" />
      </button>

      <button className="flex items-center gap-2 border-2 border-foreground bg-card p-1 pr-3 transition-colors hover:bg-secondary">
        <Avatar className="h-8 w-8 rounded-none">
          <AvatarFallback className="rounded-none bg-primary font-pixel text-[9px] text-primary-foreground">
            AM
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-semibold text-foreground sm:inline">Alex</span>
      </button>
    </header>
  )
}
