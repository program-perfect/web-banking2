"use client"

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"

type Locale = "ru" | "en"
type ThemeMode = "light" | "dark" | "system"
type CursorStyle = "pixel" | "native" | "large" | "minimal"
type MotionLevel = "full" | "balanced" | "reduced"

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
}

type PreferencesContextValue = AppPreferences & {
  setPreference: <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => void
  resetPreferences: () => void
  t: (ru: string, en: string) => string
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
}

const storageKey = "voxel-preferences-v3"
const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(raw) })
      }
    } catch {
      setPreferences(defaultPreferences)
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.lang = preferences.locale
    root.dataset.locale = preferences.locale
    root.dataset.themeMode = preferences.themeMode
    root.dataset.motion = preferences.motionLevel
    root.dataset.cursorStyle = preferences.cursorStyle
    root.dataset.cursorGlow = String(preferences.cursorGlow)
    root.dataset.neoGlow = String(preferences.glowEnabled)
    root.dataset.pixelGradients = String(preferences.pixelGradients)

    root.classList.toggle("dark", preferences.themeMode === "dark")
    root.classList.toggle("light", preferences.themeMode !== "dark")

    if (hydrated) {
      window.localStorage.setItem(storageKey, JSON.stringify(preferences))
    }
  }, [preferences, hydrated])

  const value = useMemo<PreferencesContextValue>(() => ({
    ...preferences,
    setPreference(key, nextValue) {
      setPreferences((current) => ({ ...current, [key]: nextValue }))
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
    throw new Error("useAppPreferences must be used inside AppPreferencesProvider")
  }
  return context
}
