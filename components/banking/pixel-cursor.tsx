"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type CursorMode = "default" | "pointer" | "press" | "text" | "grab" | "grabbing" | "wait" | "disabled"

type CursorSprite = {
  hotspot: { x: number; y: number }
  pixels: string[]
}

const cursorModeList: CursorMode[] = ["default", "pointer", "press", "text", "grab", "grabbing", "wait", "disabled"]

const cursorSprites: Record<CursorMode, CursorSprite> = {
  default: {
    hotspot: { x: 1, y: 1 },
    pixels: [
      "1............",
      "11...........",
      "121..........",
      "1221.........",
      "12221........",
      "122221.......",
      "1222221......",
      "12222221.....",
      "122211111....",
      "12121........",
      "11.121.......",
      "1..121.......",
      "...121.......",
      "...111.......",
      ".............",
    ],
  },
  pointer: {
    hotspot: { x: 26, y: 6 },
    pixels: [
      "....11.......",
      "...1221......",
      "...1221......",
      "...1221......",
      ".11122111....",
      "1222222221...",
      "12222222221..",
      "12222222221..",
      "1222222221...",
      "122222221....",
      ".1222221.....",
      "..12221......",
      "...111.......",
      ".............",
      ".............",
    ],
  },
  press: {
    hotspot: { x: 26, y: 10 },
    pixels: [
      ".............",
      "....11.......",
      "...1221......",
      "...1221......",
      ".11122111....",
      "1222222221...",
      "12223322221..",
      "12223322221..",
      "1222222221...",
      "122222221....",
      ".1222221.....",
      "..12221......",
      "...111.......",
      ".............",
      ".............",
    ],
  },
  text: {
    hotspot: { x: 32, y: 32 },
    pixels: [
      "...1111111...",
      ".....121.....",
      ".....121.....",
      ".....121.....",
      ".....121.....",
      ".....121.....",
      ".....121.....",
      ".....121.....",
      ".....121.....",
      ".....121.....",
      ".....121.....",
      ".....121.....",
      "...1111111...",
      ".............",
      ".............",
    ],
  },
  grab: {
    hotspot: { x: 30, y: 28 },
    pixels: [
      "..11..11.....",
      ".12211221....",
      ".12211221....",
      ".12222221....",
      "1122222211...",
      "1222222221...",
      "1222222221...",
      "122222221....",
      ".1222221.....",
      "..11111......",
      ".............",
      ".............",
      ".............",
      ".............",
      ".............",
    ],
  },
  grabbing: {
    hotspot: { x: 30, y: 28 },
    pixels: [
      ".............",
      "..11..11.....",
      ".12211221....",
      "1122222211...",
      "1222332221...",
      "1223333221...",
      "1222332221...",
      ".12222221....",
      "..122221.....",
      "...1111......",
      ".............",
      ".............",
      ".............",
      ".............",
      ".............",
    ],
  },
  wait: {
    hotspot: { x: 32, y: 32 },
    pixels: [
      "..1111111....",
      "..1222221....",
      "...12221.....",
      "....121......",
      "....131......",
      "....131......",
      "....121......",
      "...12221.....",
      "..1222221....",
      "..1111111....",
      ".............",
      ".............",
      ".............",
      ".............",
      ".............",
    ],
  },
  disabled: {
    hotspot: { x: 24, y: 24 },
    pixels: [
      "...11111.....",
      "..1222221....",
      ".122111221...",
      ".121...121...",
      ".121..1121...",
      ".121.11221...",
      ".121112221...",
      ".122222221...",
      "..1222221....",
      "...11111.....",
      ".............",
      ".............",
      ".............",
      ".............",
      ".............",
    ],
  },
}

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
  return cursorModeList.includes(value as CursorMode)
}

function normalizeRows(rows: string[]) {
  const columns = Math.max(...rows.map((row) => row.length))
  return {
    columns,
    rows: rows.map((row) => row.padEnd(columns, ".")),
  }
}

export function PixelCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const modeRef = useRef<CursorMode>("default")
  const pressedRef = useRef(false)
  const targetRef = useRef({ x: -140, y: -140 })
  const currentRef = useRef({ x: -140, y: -140 })
  const frameRef = useRef<number | null>(null)
  const [cursorMode, setCursorMode] = useState<CursorMode>("default")

  const sprite = cursorSprites[cursorMode]
  const normalized = normalizeRows(sprite.pixels)

  useEffect(() => {
    const canUseCustomCursor = window.matchMedia("(pointer: fine)").matches
    const root = document.documentElement

    if (!canUseCustomCursor) return

    root.classList.add("pixel-cursor-enabled")

    function setMode(nextMode: CursorMode) {
      if (modeRef.current === nextMode) return
      modeRef.current = nextMode
      setCursorMode(nextMode)
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
      const lerp = 0.24

      current.x += (target.x - current.x) * lerp
      current.y += (target.y - current.y) * lerp

      if (Math.abs(target.x - current.x) < 0.08) current.x = target.x
      if (Math.abs(target.y - current.y) < 0.08) current.y = target.y

      const { hotspot } = cursorSprites[modeRef.current]
      cursor.style.transform = `translate3d(${current.x - hotspot.x}px, ${current.y - hotspot.y}px, 0)`

      frameRef.current = window.requestAnimationFrame(tick)
    }

    function handlePointerMove(event: PointerEvent) {
      const cursor = cursorRef.current
      if (!cursor) return

      cursor.classList.remove("pixel-cursor--hidden")
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
      cursorRef.current?.classList.add("pixel-cursor--hidden")
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
  }, [])

  return (
    <div ref={cursorRef} className="pixel-cursor pixel-cursor--hidden" data-mode={cursorMode} aria-hidden="true">
      <span className="pixel-cursor__halo" />
      <div
        className="pixel-cursor__sprite"
        style={{
          gridTemplateColumns: `repeat(${normalized.columns}, var(--pixel-cursor-size))`,
        }}
      >
        {normalized.rows.flatMap((row, y) =>
          row.split("").map((cell, x) => (
            <span
              key={`${cursorMode}-${x}-${y}`}
              className={cn(
                "pixel-cursor__cell",
                cell === "." && "pixel-cursor__cell--empty",
                cell === "1" && "pixel-cursor__cell--ink",
                cell === "2" && "pixel-cursor__cell--paper",
                cell === "3" && "pixel-cursor__cell--accent",
              )}
            />
          )),
        )}
      </div>
    </div>
  )
}
