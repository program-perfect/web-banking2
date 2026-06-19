"use client"

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"

type Locale = "ru" | "en"
type ThemeMode = "light" | "dark" | "system"
type CursorStyle = "pixel" | "native" | "large" | "minimal"
type MotionLevel = "full" | "balanced" | "reduced"
type AccentColor = "green" | "blue" | "violet" | "orange" | "pink"
type SiteScale = "compact" | "normal" | "large"
type PanelDensity = "compact" | "comfortable" | "spacious"

export type AppContact = {
  id: string
  name: string
  handle: string
  initials: string
}

export type AnimationSettings = {
  skeletonMotion: boolean
  loaderMotion: boolean
  celebrationEffects: boolean
  cursorMotion: boolean
  pageTransitions: boolean
  hoverPatternMotion: boolean
}

export type TransferDefaults = {
  defaultAmount: string
  defaultPurpose: string
  dailyLimit: string
  transferFee: string
  preferredRail: string
  speedLabel: string
  requireReceipt: boolean
  requireRiskCheck: boolean
  autoOpenReceipt: boolean
}

type AppPreferences = {
  profileName: string
  locale: Locale
  themeMode: ThemeMode
  motionLevel: MotionLevel
  cursorStyle: CursorStyle
  cursorGlow: boolean
  glowEnabled: boolean
  pixelGradients: boolean
  soundEffects: boolean
  accentColor: AccentColor
  siteScale: SiteScale
  panelDensity: PanelDensity
  animationSettings: AnimationSettings
  transferContacts: AppContact[]
  transferDefaults: TransferDefaults
}

type PreferencesContextValue = AppPreferences & {
  setPreference: <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => void
  resetPreferences: () => void
  t: (ru: string, en: string) => string
}

const defaultContacts: AppContact[] = [
  { id: "p1", name: "Мария Лопес", handle: "@maria", initials: "МЛ" },
  { id: "p2", name: "Джеймс Картер", handle: "карта **** 9021", initials: "ДК" },
  { id: "p3", name: "София Рейес", handle: "+1 555 011 489", initials: "СР" },
  { id: "p4", name: "Лиам Чен", handle: "@liam", initials: "ЛЧ" },
]

const defaultAnimationSettings: AnimationSettings = {
  skeletonMotion: false,
  loaderMotion: false,
  celebrationEffects: true,
  cursorMotion: false,
  pageTransitions: false,
  hoverPatternMotion: false,
}

const defaultTransferDefaults: TransferDefaults = {
  defaultAmount: "250",
  defaultPurpose: "Личный перевод",
  dailyLimit: "10000",
  transferFee: "0.35",
  preferredRail: "VOXEL внутренний канал",
  speedLabel: "Мгновенно",
  requireReceipt: true,
  requireRiskCheck: true,
  autoOpenReceipt: true,
}

const defaultPreferences: AppPreferences = {
  profileName: "Алекс",
  locale: "ru",
  themeMode: "light",
  motionLevel: "reduced",
  cursorStyle: "pixel",
  cursorGlow: true,
  glowEnabled: true,
  pixelGradients: true,
  soundEffects: false,
  accentColor: "green",
  siteScale: "normal",
  panelDensity: "comfortable",
  animationSettings: defaultAnimationSettings,
  transferContacts: defaultContacts,
  transferDefaults: defaultTransferDefaults,
}

const accentPalettes: Record<AccentColor, { primary: string; primaryForeground: string; accent: string; accentForeground: string; ring: string }> = {
  green: {
    primary: "oklch(0.74 0.17 158)",
    primaryForeground: "oklch(0.19 0.03 165)",
    accent: "oklch(0.92 0.07 158)",
    accentForeground: "oklch(0.34 0.1 158)",
    ring: "oklch(0.74 0.17 158)",
  },
  blue: {
    primary: "oklch(0.7 0.16 235)",
    primaryForeground: "oklch(0.16 0.03 240)",
    accent: "oklch(0.92 0.06 235)",
    accentForeground: "oklch(0.33 0.11 235)",
    ring: "oklch(0.7 0.16 235)",
  },
  violet: {
    primary: "oklch(0.72 0.17 305)",
    primaryForeground: "oklch(0.18 0.04 305)",
    accent: "oklch(0.92 0.065 305)",
    accentForeground: "oklch(0.34 0.12 305)",
    ring: "oklch(0.72 0.17 305)",
  },
  orange: {
    primary: "oklch(0.76 0.16 70)",
    primaryForeground: "oklch(0.2 0.04 70)",
    accent: "oklch(0.93 0.07 70)",
    accentForeground: "oklch(0.36 0.11 70)",
    ring: "oklch(0.76 0.16 70)",
  },
  pink: {
    primary: "oklch(0.74 0.17 345)",
    primaryForeground: "oklch(0.18 0.04 345)",
    accent: "oklch(0.93 0.07 345)",
    accentForeground: "oklch(0.36 0.11 345)",
    ring: "oklch(0.74 0.17 345)",
  },
}

const storageKey = "voxel-preferences-v4"
const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function normalizePreferences(raw: Partial<AppPreferences>): AppPreferences {
  return {
    ...defaultPreferences,
    ...raw,
    animationSettings: { ...defaultAnimationSettings, ...(raw.animationSettings ?? {}) },
    transferDefaults: { ...defaultTransferDefaults, ...(raw.transferDefaults ?? {}) },
    transferContacts: Array.isArray(raw.transferContacts) && raw.transferContacts.length > 0 ? raw.transferContacts : defaultContacts,
  }
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        setPreferences(normalizePreferences(JSON.parse(raw)))
      }
    } catch {
      setPreferences(defaultPreferences)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
    const resolvedDark = preferences.themeMode === "dark" || (preferences.themeMode === "system" && prefersDark)
    const palette = accentPalettes[preferences.accentColor]

    root.lang = preferences.locale
    root.dataset.locale = preferences.locale
    root.dataset.themeMode = preferences.themeMode
    root.dataset.motion = preferences.motionLevel
    root.dataset.cursorStyle = preferences.cursorStyle
    root.dataset.cursorGlow = String(preferences.cursorGlow)
    root.dataset.neoGlow = String(preferences.glowEnabled)
    root.dataset.pixelGradients = String(preferences.pixelGradients)
    root.dataset.accent = preferences.accentColor
    root.dataset.siteScale = preferences.siteScale
    root.dataset.panelDensity = preferences.panelDensity
    root.dataset.skeletonMotion = String(preferences.animationSettings.skeletonMotion)
    root.dataset.loaderMotion = String(preferences.animationSettings.loaderMotion)
    root.dataset.celebrationMotion = String(preferences.animationSettings.celebrationEffects)
    root.dataset.cursorMotion = String(preferences.animationSettings.cursorMotion)
    root.dataset.pageTransitions = String(preferences.animationSettings.pageTransitions)
    root.dataset.hoverPatternMotion = String(preferences.animationSettings.hoverPatternMotion)

    root.style.setProperty("--primary", palette.primary)
    root.style.setProperty("--primary-foreground", palette.primaryForeground)
    root.style.setProperty("--accent", palette.accent)
    root.style.setProperty("--accent-foreground", palette.accentForeground)
    root.style.setProperty("--ring", palette.ring)
    root.style.setProperty("--sidebar-primary", palette.primary)
    root.style.setProperty("--sidebar-primary-foreground", palette.primaryForeground)
    root.style.setProperty("--sidebar-accent", palette.accent)
    root.style.setProperty("--sidebar-accent-foreground", palette.accentForeground)
    root.style.setProperty("--sidebar-ring", palette.ring)

    root.classList.toggle("dark", resolvedDark)
    root.classList.toggle("light", !resolvedDark)

    if (hydrated) {
      window.localStorage.setItem(storageKey, JSON.stringify(preferences))
    }
  }, [preferences, hydrated])

  const value = useMemo<PreferencesContextValue>(() => ({
    ...preferences,
    setPreference(key, nextValue) {
      setPreferences((current) => normalizePreferences({ ...current, [key]: nextValue }))
    },
    resetPreferences() {
      setPreferences(defaultPreferences)
    },
    t(ru, en) {
      return preferences.locale === "ru" ? ru : en
    },
  }), [preferences])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function useAppPreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error("useAppPreferences должен использоваться внутри AppPreferencesProvider")
  }
  return context
}
