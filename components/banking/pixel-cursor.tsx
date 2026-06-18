"use client"

import { useEffect, useRef, useState } from "react"
import { useAppPreferences } from "@/components/banking/app-preferences"

type CursorMode = "default" | "pointer" | "press" | "text" | "grab" | "grabbing" | "wait" | "disabled"

const interactiveSelector = [
  "a",
  "button",
  "summary",
  "select",
  "input[type='button']",
  "input[type='submit']",
  "input[type='checkbox']",
  "input[type='radio']",
  "[role='button']",
  "[role='tab']",
  "[data-cursor='pointer']",
].join(",")

const textSelector = [
  "textarea",
  "input:not([type])",
  "input[type='text']",
  "input[type='email']",
  "input[type='tel']",
  "input[type='search']",
  "input[type='number']",
  "input[type='password']",
  "[contenteditable='true']",
  "[data-cursor='text']",
].join(",")

const grabSelector = ["[draggable='true']", "[data-cursor='grab']", "[data-cursor='grabbing']"].join(",")
const waitSelector = ["[aria-busy='true']", "[data-loading='true']", "[data-cursor='wait']"].join(",")
const disabledSelector = [":disabled", "[aria-disabled='true']", "[data-disabled='true']", "[data-cursor='disabled']"].join(",")

function isCursorMode(value: string | null): value is CursorMode {
  return ["default", "pointer", "press", "text", "grab", "grabbing", "wait", "disabled"].includes(value ?? "")
}

export function PixelCursor() {
  const { cursorStyle, cursorGlow } = useAppPreferences()
  const cursorRef = useRef<HTMLDivElement>(null)
  const modeRef = useRef<CursorMode>("default")
  const pressedRef = useRef(false)
  const targetRef = useRef({ x: -160, y: -160 })
  const currentRef = useRef({ x: -160, y: -160 })
  const frameRef = useRef<number | null>(null)
  const [mode, setModeState] = useState<CursorMode>("default")

  useEffect(() => {
    const canUseCustomCursor = window.matchMedia("(pointer: fine)").matches && cursorStyle !== "native"
    const root = document.documentElement

    if (!canUseCustomCursor) {
      root.classList.remove("pixel-cursor-enabled")
      return
    }

    root.classList.add("pixel-cursor-enabled")
    root.dataset.cursorSize = cursorStyle === "large" ? "large" : "normal"
    root.dataset.cursorGlow = String(cursorGlow)

    function setMode(nextMode: CursorMode) {
      if (modeRef.current === nextMode) return
      modeRef.current = nextMode
      setModeState(nextMode)
    }

    function resolveMode(target: EventTarget | null): CursorMode {
      const element = target instanceof Element ? target : null
      const declared = element?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? null

      if (isCursorMode(declared)) return pressedRef.current && declared === "pointer" ? "press" : declared
      if (element?.closest(disabledSelector)) return "disabled"
      if (element?.closest(waitSelector)) return "wait"
      if (element?.closest(textSelector)) return "text"
      if (element?.closest(grabSelector)) return pressedRef.current ? "grabbing" : "grab"
      if (element?.closest(interactiveSelector)) return pressedRef.current ? "press" : "pointer"
      return "default"
    }

    function tick() {
      const cursor = cursorRef.current
      if (!cursor) return
      const current = currentRef.current
      const target = targetRef.current
      const lerp = cursorStyle === "minimal" ? 0.38 : 0.22

      current.x += (target.x - current.x) * lerp
      current.y += (target.y - current.y) * lerp

      if (Math.abs(target.x - current.x) < 0.08) current.x = target.x
      if (Math.abs(target.y - current.y) < 0.08) current.y = target.y

      const offset = modeRef.current === "text" ? 18 : 2
      cursor.style.transform = `translate3d(${current.x - offset}px, ${current.y - offset}px, 0)`
      frameRef.current = window.requestAnimationFrame(tick)
    }

    function handlePointerMove(event: PointerEvent) {
      cursorRef.current?.classList.remove("neo-pixel-cursor--hidden")
      targetRef.current = { x: event.clientX, y: event.clientY }
      setMode(resolveMode(event.target))
    }

    function handlePointerDown(event: PointerEvent) {
      pressedRef.current = true
      setMode(resolveMode(event.target))
    }

    function handlePointerUp(event: PointerEvent) {
      pressedRef.current = false
      setMode(resolveMode(event.target))
    }

    function handlePointerLeave() {
      cursorRef.current?.classList.add("neo-pixel-cursor--hidden")
    }

    frameRef.current = window.requestAnimationFrame(tick)
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointerup", handlePointerUp)
    document.documentElement.addEventListener("mouseleave", handlePointerLeave)

    return () => {
      root.classList.remove("pixel-cursor-enabled")
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointerup", handlePointerUp)
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave)
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
    }
  }, [cursorStyle, cursorGlow])

  if (cursorStyle === "native") return null

  return (
    <div ref={cursorRef} className="neo-pixel-cursor neo-pixel-cursor--hidden" data-mode={mode} aria-hidden="true">
      <span className="neo-pixel-cursor__glow" />
      <span className="neo-pixel-cursor__arrow" />
      <span className="neo-pixel-cursor__badge" />
    </div>
  )
}
