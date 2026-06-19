"use client"

import NumberFlow from "@number-flow/react"
import { useEffect, useMemo, useState } from "react"

const usdFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
})

type Props = {
  value: number
  className?: string
  /** Render as USD currency (default) or a plain number */
  currency?: boolean
  /** Show explicit +/- sign (for transaction amounts) */
  sign?: boolean
  /** Animate a count-up from 0 on first mount */
  animateOnMount?: boolean
  suffix?: string
}

/**
 * NumberFlow-powered animated figure. The static first render intentionally
 * matches SSR output; NumberFlow mounts only after hydration, preventing the
 * client/server text mismatch that animated number libraries can trigger.
 */
export function AnimatedAmount({ value, className, currency = true, sign = false, animateOnMount = false, suffix }: Props) {
  const [mounted, setMounted] = useState(false)
  const [display, setDisplay] = useState(value)

  const format: Intl.NumberFormatOptions = useMemo(() => {
    const options: Intl.NumberFormatOptions = currency ? { style: "currency", currency: "USD", maximumFractionDigits: 2 } : { maximumFractionDigits: 2 }
    if (sign) options.signDisplay = "always"
    return options
  }, [currency, sign])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (animateOnMount) {
      setDisplay(0)
      const id = requestAnimationFrame(() => setDisplay(value))
      return () => cancelAnimationFrame(id)
    }
    setDisplay(value)
  }, [value, animateOnMount, mounted])

  if (!mounted) {
    const formatted = currency ? usdFormatter.format(value) : numberFormatter.format(value)
    const signed = sign && value > 0 ? `+${formatted}` : formatted
    return <span className={className}>{signed}{suffix}</span>
  }

  return <NumberFlow locales="ru-RU" value={display} format={format} suffix={suffix} className={className} />
}
