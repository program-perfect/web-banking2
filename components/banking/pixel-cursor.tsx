"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const cursorPixels = [
  "100000000",
  "110000000",
  "111000000",
  "111100000",
  "111110000",
  "111111000",
  "111011100",
  "110001100",
  "100000110",
]

const interactiveSelector = [
  "a",
  "button",
  "summary",
  "select",
  "textarea",
  "input",
  "[role='button']",
  "[data-cursor='pointer']",
].join(",")

export function PixelCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const interactiveRef = useRef(false)
  const pressedRef = useRef(false)

  useEffect(() => {
    const canUseCustomCursor = window.matchMedia("(pointer: fine)").matches
    const root = document.documentElement

    if (!canUseCustomCursor) return

    root.classList.add("pixel-cursor-enabled")

    function updateState() {
      const cursor = cursorRef.current
      if (!cursor) return

      cursor.dataset.interactive = interactiveRef.current ? "true" : "false"
      cursor.dataset.pressed = pressedRef.current ? "true" : "false"
    }

    function handlePointerMove(event: PointerEvent) {
      const cursor = cursorRef.current
      if (!cursor) return

      cursor.classList.remove("pixel-cursor--hidden")
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`

      const target = event.target instanceof Element ? event.target : null
      interactiveRef.current = Boolean(target?.closest(interactiveSelector))
      updateState()
    }

    function handlePointerDown() {
      pressedRef.current = true
      updateState()
    }

    function handlePointerUp() {
      pressedRef.current = false
      updateState()
    }

    function handlePointerLeave() {
      cursorRef.current?.classList.add("pixel-cursor--hidden")
    }

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
    }
  }, [])

  return (
    <div ref={cursorRef} className="pixel-cursor pixel-cursor--hidden" aria-hidden="true">
      <div className="pixel-cursor__grid">
        {cursorPixels.flatMap((row, y) =>
          row.split("").map((cell, x) => (
            <span
              key={`${x}-${y}`}
              className={cn(cell === "1" ? "pixel-cursor__cell" : "pixel-cursor__cell--empty")}
            />
          )),
        )}
      </div>
      <span className="pixel-cursor__pulse" />
    </div>
  )
}
