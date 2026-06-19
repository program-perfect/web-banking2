"use client"

import { MousePointer2, Palette, Plus, Sparkles, Trash2, Type, UserRound, Zap, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { type AnimationSettings, type AppContact, type TransferDefaults, useAppPreferences } from "@/components/banking/app-preferences"
import { PixelButton, PixelCard, PixelInput, PixelLoader, PixelSkeleton, PixelStatus } from "@/components/banking/pixel-ui"

const motionItems = [
  { id: "full", labelRu: "Полная анимация", labelEn: "Full motion", detailRu: "Разрешить все включённые эффекты", detailEn: "Allow every enabled effect" },
  { id: "balanced", labelRu: "Сбалансированно", labelEn: "Balanced", detailRu: "Часть эффектов, но без тяжёлых циклов", detailEn: "Some effects without heavy loops" },
  { id: "reduced", labelRu: "Минимально", labelEn: "Reduced", detailRu: "Режим по умолчанию: почти всё статично", detailEn: "Default mode: almost everything is static" },
] as const

const themes = [
  { id: "light", labelRu: "Светлая", labelEn: "Light", detailRu: "Белый фон и текущая палитра", detailEn: "White background and current palette" },
  { id: "dark", labelRu: "Тёмная", labelEn: "Dark", detailRu: "Контрастный тёмный режим", detailEn: "High contrast dark mode" },
  { id: "system", labelRu: "Системная", labelEn: "System", detailRu: "Следовать устройству", detailEn: "Follow device" },
] as const

const cursors = [
  { id: "pixel", labelRu: "Пиксельный macOS", labelEn: "Pixel macOS", detailRu: "Плавный кастомный курсор", detailEn: "Smooth custom pointer" },
  { id: "large", labelRu: "Крупный пиксельный", labelEn: "Large pixel", detailRu: "Лучше для демо и записи экрана", detailEn: "Better for demo screens" },
  { id: "minimal", labelRu: "Быстрый минимальный", labelEn: "Fast minimal", detailRu: "Меньше инерции", detailEn: "Less cursor inertia" },
  { id: "native", labelRu: "Системный", labelEn: "Native", detailRu: "Обычный курсор браузера", detailEn: "Browser default cursor" },
] as const

const locales = [
  { id: "ru", label: "Русский", detail: "Основной язык интерфейса" },
  { id: "en", label: "English", detail: "English UI copy" },
] as const

const accentColors = [
  { id: "green", labelRu: "Зелёный", labelEn: "Green" },
  { id: "blue", labelRu: "Синий", labelEn: "Blue" },
  { id: "violet", labelRu: "Фиолетовый", labelEn: "Violet" },
  { id: "orange", labelRu: "Оранжевый", labelEn: "Orange" },
  { id: "pink", labelRu: "Розовый", labelEn: "Pink" },
] as const

const siteScales = [
  { id: "compact", labelRu: "Компактный", labelEn: "Compact" },
  { id: "normal", labelRu: "Обычный", labelEn: "Normal" },
  { id: "large", labelRu: "Крупный", labelEn: "Large" },
] as const

const panelDensities = [
  { id: "compact", labelRu: "Плотно", labelEn: "Compact" },
  { id: "comfortable", labelRu: "Удобно", labelEn: "Comfortable" },
  { id: "spacious", labelRu: "Свободно", labelEn: "Spacious" },
] as const

const animationToggles: Array<{ key: keyof AnimationSettings; labelRu: string; labelEn: string; detailRu: string; detailEn: string }> = [
  { key: "skeletonMotion", labelRu: "Скелетоны", labelEn: "Skeletons", detailRu: "Включить shimmer/scan-анимацию", detailEn: "Enable shimmer/scan animation" },
  { key: "loaderMotion", labelRu: "Лоадеры", labelEn: "Loaders", detailRu: "Анимировать пиксельные загрузчики", detailEn: "Animate pixel loaders" },
  { key: "celebrationEffects", labelRu: "Эффекты перевода", labelEn: "Transfer celebration", detailRu: "Салют, монеты и конфетти после успеха", detailEn: "Fireworks, coins and confetti after success" },
  { key: "cursorMotion", labelRu: "Курсор", labelEn: "Cursor", detailRu: "Halo, wait/text-анимации курсора", detailEn: "Cursor halo and wait/text motion" },
  { key: "pageTransitions", labelRu: "Переходы экранов", labelEn: "Screen transitions", detailRu: "Плавные входы страниц и шагов", detailEn: "Smooth page and step entrances" },
  { key: "hoverPatternMotion", labelRu: "Фоновый рисунок", labelEn: "Hover pattern", detailRu: "Движение паттерна при hover/focus", detailEn: "Pattern movement on hover/focus" },
]

export function PreferencesPanel() {
  const prefs = useAppPreferences()
  const activeMotion = motionItems.find((item) => item.id === prefs.motionLevel)
  const activeTheme = themes.find((item) => item.id === prefs.themeMode)
  const activeCursor = cursors.find((item) => item.id === prefs.cursorStyle)

  function setAnimation(key: keyof AnimationSettings, value: boolean) {
    prefs.setPreference("animationSettings", { ...prefs.animationSettings, [key]: value })
  }

  function setTransfer(key: keyof TransferDefaults, value: string | boolean) {
    prefs.setPreference("transferDefaults", { ...prefs.transferDefaults, [key]: value } as TransferDefaults)
  }

  function updateContact(id: string, patch: Partial<AppContact>) {
    prefs.setPreference("transferContacts", prefs.transferContacts.map((contact) => (contact.id === id ? { ...contact, ...patch } : contact)))
  }

  function addContact() {
    const nextIndex = prefs.transferContacts.length + 1
    prefs.setPreference("transferContacts", [
      ...prefs.transferContacts,
      { id: `custom-${Date.now()}`, name: `Новый контакт ${nextIndex}`, handle: "@new", initials: "НК" },
    ])
  }

  function removeContact(id: string) {
    if (prefs.transferContacts.length <= 1) return
    prefs.setPreference("transferContacts", prefs.transferContacts.filter((contact) => contact.id !== id))
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <PixelCard className="lg:col-span-2 pixel-gradient" eyebrow={prefs.t("Центр управления", "Control center")} title={prefs.t("Настройки приложения", "App preferences")} action={<PixelStatus tone="success">{prefs.t("Сохраняется локально", "Local save")}</PixelStatus>}>
        <div className="grid gap-4 md:grid-cols-3">
          <PreviewTile icon={UserRound} label={prefs.t("Имя", "Name")} value={prefs.profileName} />
          <PreviewTile icon={Sparkles} label={prefs.t("Анимации", "Motion")} value={prefs.t(activeMotion?.labelRu ?? "Минимально", activeMotion?.labelEn ?? "Reduced")} />
          <PreviewTile icon={MousePointer2} label={prefs.t("Курсор", "Cursor")} value={prefs.t(activeCursor?.labelRu ?? "Пиксельный", activeCursor?.labelEn ?? "Pixel")} />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_240px]">
          <label className="block border-2 border-foreground bg-secondary p-4 pixel-shadow-sm">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-muted-foreground">
              <UserRound className="h-4 w-4 text-primary" />
              {prefs.t("Имя профиля", "Profile name")}
            </span>
            <PixelInput value={prefs.profileName} onChange={(event) => prefs.setPreference("profileName", event.target.value || "Алекс")} className="mt-3 h-12 text-lg font-black" />
            <p className="mt-2 text-xs text-muted-foreground">{prefs.t("Имя сразу появляется в верхней панели и демо-экранах.", "The name appears in the topbar and demo screens immediately.")}</p>
          </label>

          <div className="border-2 border-foreground bg-card p-4 pixel-shadow-sm">
            <p className="font-pixel text-[9px] uppercase tracking-wider text-muted-foreground">{prefs.t("Превью загрузки", "Loader preview")}</p>
            <div className="mt-4 flex justify-center">
              <PixelLoader variant={prefs.animationSettings.loaderMotion ? "orbit" : "dots"} label={prefs.t("Интерфейс", "Interface")} />
            </div>
          </div>
        </div>
      </PixelCard>

      <PixelCard title={prefs.t("Локализация", "Localization")} eyebrow="i18n">
        <div className="space-y-3">
          {locales.map((option) => (
            <SelectRow key={option.id} label={option.label} detail={option.detail} active={prefs.locale === option.id} onSelect={() => prefs.setPreference("locale", option.id)} />
          ))}
        </div>
      </PixelCard>

      <PixelCard className="lg:col-span-3" title={prefs.t("Производительность и анимации", "Performance and animation")} eyebrow={prefs.t("По умолчанию выключено", "Disabled by default")}>
        <div className="grid gap-3 md:grid-cols-3">
          {motionItems.map((option) => (
            <SelectCard
              key={option.id}
              icon={Zap}
              label={prefs.t(option.labelRu, option.labelEn)}
              detail={prefs.t(option.detailRu, option.detailEn)}
              active={prefs.motionLevel === option.id}
              onSelect={() => prefs.setPreference("motionLevel", option.id)}
            />
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {animationToggles.map((item) => (
            <ToggleCard
              key={item.key}
              label={prefs.t(item.labelRu, item.labelEn)}
              detail={prefs.t(item.detailRu, item.detailEn)}
              checked={prefs.animationSettings[item.key]}
              onToggle={() => setAnimation(item.key, !prefs.animationSettings[item.key])}
            />
          ))}
        </div>
      </PixelCard>

      <PixelCard className="lg:col-span-2" title={prefs.t("Тема и размеры", "Theme and sizing")} eyebrow={prefs.t("Без смены общей палитры", "Keeps the design language")}>
        <div className="grid gap-3 md:grid-cols-3">
          {themes.map((option) => (
            <SelectCard
              key={option.id}
              icon={Palette}
              label={prefs.t(option.labelRu, option.labelEn)}
              detail={prefs.t(option.detailRu, option.detailEn)}
              active={prefs.themeMode === option.id}
              onSelect={() => prefs.setPreference("themeMode", option.id)}
            />
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {accentColors.map((option) => <SelectRow key={option.id} label={prefs.t(option.labelRu, option.labelEn)} detail={prefs.t("Акцентный цвет", "Accent color")} active={prefs.accentColor === option.id} onSelect={() => prefs.setPreference("accentColor", option.id)} />)}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <OptionGroup title={prefs.t("Размер сайта", "Site size")} items={siteScales.map((option) => ({ ...option, active: prefs.siteScale === option.id, onSelect: () => prefs.setPreference("siteScale", option.id) }))} />
          <OptionGroup title={prefs.t("Плотность панелей", "Panel density")} items={panelDensities.map((option) => ({ ...option, active: prefs.panelDensity === option.id, onSelect: () => prefs.setPreference("panelDensity", option.id) }))} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <ToggleCard label={prefs.t("Glow-эффекты", "Glow effects")} detail={prefs.t("Подсветка в neo-brutal рамках", "Glow inside the neo-brutal system")} checked={prefs.glowEnabled} onToggle={() => prefs.setPreference("glowEnabled", !prefs.glowEnabled)} />
          <ToggleCard label={prefs.t("Пиксельные градиенты", "Pixel gradients")} detail={prefs.t("Псевдо-шейдер без смены палитры", "Shader-like gradients without palette changes")} checked={prefs.pixelGradients} onToggle={() => prefs.setPreference("pixelGradients", !prefs.pixelGradients)} />
          <ToggleCard label={prefs.t("Звуки UI", "UI sounds")} detail={prefs.t("Заготовка для будущих звуков", "Prepared for future sound effects")} checked={prefs.soundEffects} onToggle={() => prefs.setPreference("soundEffects", !prefs.soundEffects)} />
        </div>
      </PixelCard>

      <PixelCard title={prefs.t("Курсор", "Cursor")} eyebrow={prefs.t("Указатель", "Pointer")}>
        <div className="space-y-3">
          {cursors.map((option) => (
            <SelectRow
              key={option.id}
              label={prefs.t(option.labelRu, option.labelEn)}
              detail={prefs.t(option.detailRu, option.detailEn)}
              active={prefs.cursorStyle === option.id}
              onSelect={() => prefs.setPreference("cursorStyle", option.id)}
            />
          ))}
          <ToggleCard label={prefs.t("Свечение курсора", "Cursor glow")} detail={prefs.t("Включается только вместе с анимацией курсора", "Only works when cursor motion is enabled")} checked={prefs.cursorGlow} onToggle={() => prefs.setPreference("cursorGlow", !prefs.cursorGlow)} />
        </div>
      </PixelCard>

      <PixelCard className="lg:col-span-2" title={prefs.t("Контакты для переводов", "Transfer contacts")} eyebrow={prefs.t("Можно редактировать", "Editable")} action={<PixelButton onClick={addContact}><Plus className="h-4 w-4" />{prefs.t("Добавить", "Add")}</PixelButton>}>
        <div className="grid gap-3">
          {prefs.transferContacts.map((contact) => (
            <div key={contact.id} className="grid gap-3 border-2 border-foreground bg-secondary p-3 pixel-shadow-sm md:grid-cols-[1fr_1fr_90px_44px]">
              <PixelInput aria-label={prefs.t("Имя контакта", "Contact name")} value={contact.name} onChange={(event) => updateContact(contact.id, { name: event.target.value })} />
              <PixelInput aria-label={prefs.t("Карта, телефон или ник", "Card, phone or handle")} value={contact.handle} onChange={(event) => updateContact(contact.id, { handle: event.target.value })} />
              <PixelInput aria-label={prefs.t("Инициалы", "Initials")} value={contact.initials} maxLength={3} onChange={(event) => updateContact(contact.id, { initials: event.target.value.toUpperCase() })} />
              <PixelButton aria-label={prefs.t("Удалить контакт", "Delete contact")} onClick={() => removeContact(contact.id)} disabled={prefs.transferContacts.length <= 1}>
                <Trash2 className="h-4 w-4" />
              </PixelButton>
            </div>
          ))}
        </div>
      </PixelCard>

      <PixelCard title={prefs.t("Детали перевода", "Transfer details")} eyebrow={prefs.t("По умолчанию", "Defaults")}>
        <div className="space-y-3">
          <Field label={prefs.t("Сумма", "Amount")} value={prefs.transferDefaults.defaultAmount} onChange={(value) => setTransfer("defaultAmount", value)} inputMode="decimal" />
          <Field label={prefs.t("Назначение", "Purpose")} value={prefs.transferDefaults.defaultPurpose} onChange={(value) => setTransfer("defaultPurpose", value)} />
          <Field label={prefs.t("Дневной лимит", "Daily limit")} value={prefs.transferDefaults.dailyLimit} onChange={(value) => setTransfer("dailyLimit", value)} inputMode="decimal" />
          <Field label={prefs.t("Комиссия", "Fee")} value={prefs.transferDefaults.transferFee} onChange={(value) => setTransfer("transferFee", value)} inputMode="decimal" />
          <Field label={prefs.t("Канал перевода", "Transfer rail")} value={prefs.transferDefaults.preferredRail} onChange={(value) => setTransfer("preferredRail", value)} />
          <Field label={prefs.t("Скорость", "Speed")} value={prefs.transferDefaults.speedLabel} onChange={(value) => setTransfer("speedLabel", value)} />
          <ToggleCard label={prefs.t("Автооткрытие чека", "Auto-open receipt")} detail={prefs.t("Показывать чек сразу после успеха", "Show receipt after success")} checked={prefs.transferDefaults.autoOpenReceipt} onToggle={() => setTransfer("autoOpenReceipt", !prefs.transferDefaults.autoOpenReceipt)} />
          <ToggleCard label={prefs.t("Проверка риска", "Risk check")} detail={prefs.t("Показывать проверку перед подтверждением", "Show check before confirmation")} checked={prefs.transferDefaults.requireRiskCheck} onToggle={() => setTransfer("requireRiskCheck", !prefs.transferDefaults.requireRiskCheck)} />
        </div>
      </PixelCard>

      <PixelCard className="lg:col-span-3" title={prefs.t("Скелетоны и типографика", "Skeletons and typography")} eyebrow={prefs.t("Превью", "Preview")} action={<PixelButton onClick={prefs.resetPreferences}>{prefs.t("Сбросить", "Reset")}</PixelButton>}>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_220px]">
          <div className="space-y-3 border-2 border-foreground bg-secondary p-4">
            <PixelSkeleton className="h-8" />
            <PixelSkeleton className="h-24" />
            <PixelSkeleton className="h-8 w-2/3" />
          </div>
          <div className="border-2 border-foreground bg-card p-4">
            <p className="text-3xl font-black tracking-tight text-foreground">{prefs.t("Читаемый пиксельный шрифт", "Readable pixel font")}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{prefs.t("Везде используется моноширинный читаемый pixel-like стиль; декоративный font-pixel остаётся только для коротких меток.", "A readable mono pixel-like style is used globally; decorative pixel font stays for short labels.")}</p>
          </div>
          <PixelLoader variant="card" label={prefs.t("Скелетон", "Skeleton")} />
        </div>
      </PixelCard>
    </div>
  )
}

function PreviewTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="border-2 border-foreground bg-card p-4 pixel-shadow-sm"><Icon className="h-5 w-5 text-primary" /><p className="mt-5 text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-black text-foreground">{value}</p></div>
}

function ToggleCard({ label, detail, checked, onToggle }: { label: string; detail: string; checked: boolean; onToggle: () => void }) {
  const prefs = useAppPreferences()
  return (
    <button onClick={onToggle} className="flex min-h-32 cursor-pointer flex-col justify-between border-2 border-foreground bg-card p-4 text-left transition-all hover:-translate-y-1 hover:pixel-shadow-sm" aria-pressed={checked}>
      <span><span className="block text-sm font-black text-foreground">{label}</span><span className="mt-1 block text-xs text-muted-foreground">{detail}</span></span>
      <span className="mt-4 flex items-center justify-between gap-3">
        <PixelStatus tone={checked ? "success" : "warning"}>{checked ? prefs.t("Вкл", "On") : prefs.t("Выкл", "Off")}</PixelStatus>
        <span className={cn("h-7 w-12 rounded-full border-2 border-foreground p-1", checked ? "bg-primary" : "bg-secondary")}><span className={cn("block h-full w-5 rounded-full border-2 border-foreground bg-card transition-transform", checked && "translate-x-4")} /></span>
      </span>
    </button>
  )
}

function SelectRow({ label, detail, active, onSelect }: { label: string; detail: string; active: boolean; onSelect: () => void }) {
  return <button onClick={onSelect} className={cn("w-full cursor-pointer border-2 border-foreground p-3 text-left transition-all hover:-translate-y-0.5", active ? "bg-primary text-primary-foreground pixel-shadow-sm" : "bg-card text-foreground")} aria-pressed={active}><span className="block text-sm font-black">{label}</span><span className={cn("mt-1 block text-xs", active ? "text-primary-foreground/75" : "text-muted-foreground")}>{detail}</span></button>
}

function SelectCard({ icon: Icon, label, detail, active, onSelect }: { icon: LucideIcon; label: string; detail: string; active: boolean; onSelect: () => void }) {
  return <button onClick={onSelect} className={cn("min-h-36 cursor-pointer border-2 border-foreground bg-card p-4 text-left transition-all hover:-translate-y-1 hover:pixel-shadow-sm", active && "bg-primary text-primary-foreground pixel-shadow-sm")} aria-pressed={active}><Icon className="h-5 w-5" /><span className="mt-8 block text-sm font-black">{label}</span><span className={cn("mt-1 block text-xs", active ? "text-primary-foreground/75" : "text-muted-foreground")}>{detail}</span></button>
}

function OptionGroup({ title, items }: { title: string; items: Array<{ id: string; labelRu: string; labelEn: string; active: boolean; onSelect: () => void }> }) {
  const prefs = useAppPreferences()
  return <div className="border-2 border-foreground bg-secondary p-3 pixel-shadow-sm"><p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">{title}</p><div className="grid gap-2">{items.map((item) => <SelectRow key={item.id} label={prefs.t(item.labelRu, item.labelEn)} detail={title} active={item.active} onSelect={item.onSelect} />)}</div></div>
}

function Field({ label, value, onChange, inputMode }: { label: string; value: string; onChange: (value: string) => void; inputMode?: "text" | "decimal" }) {
  return <label className="block"><span className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</span><PixelInput value={value} onChange={(event) => onChange(event.target.value)} inputMode={inputMode} className="mt-2" /></label>
}
