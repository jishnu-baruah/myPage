"use client";
import React, { useEffect, useState } from "react"

const fonts = [
  "font-sans",
  "font-serif",
  "font-mono"
]

export default function Loading() {
  const [fontIdx, setFontIdx] = useState(0)
  const [fontIdx2, setFontIdx2] = useState(1)
  const [final, setFinal] = useState(false)
  const [falling1, setFalling1] = useState(false)
  const [falling2, setFalling2] = useState(false)

  useEffect(() => {
    let interval1: NodeJS.Timeout;
    let interval2: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;
    if (!final) {
      // Stagger the font changes for a smoother effect
      interval1 = setInterval(() => {
        setFalling1(true)
        setTimeout(() => setFalling1(false), 1000)
        setFontIdx((idx) => (idx + 1) % fonts.length)
      }, 1000)
      interval2 = setInterval(() => {
        setFalling2(true)
        setTimeout(() => setFalling2(false), 1000)
        setFontIdx2((idx) => (idx + 1) % fonts.length)
      }, 1000)
      timeout = setTimeout(() => {
        setFinal(true)
        setFontIdx(0)
        setFontIdx2(0)
      }, 3000)
    }
    return () => {
      clearInterval(interval1)
      clearInterval(interval2)
      clearTimeout(timeout)
    }
  }, [final])

  const finalFont = "font-sans"
  const fallClass1 = falling1 && !final ? "fall-in" : ""
  const fallClass2 = falling2 && !final ? "fall-in" : ""

  return (
    <>
      <style>{`
        .fall-in {
          opacity: 0;
          transform: translateY(-40px) scale(0.98);
          animation: fallIn 1s cubic-bezier(.22,1,.36,1) forwards;
        }
        @keyframes fallIn {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white dark:bg-[rgb(23,23,23)] text-black dark:text-white">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-pulse drop-shadow-lg transition-all duration-500" style={{ letterSpacing: '0.05em' }}>
          <span
            key={final ? 'final-jishnu' : fonts[fontIdx]}
            className={`${final ? finalFont : fonts[fontIdx]} ${fallClass1} inline-block`}
          >
            Jishnu
          </span>{' '}
          <span
            key={final ? 'final-baruah' : fonts[fontIdx2]}
            className={`${final ? finalFont : fonts[fontIdx2]} ${fallClass2} inline-block`}
          >
            Baruah
          </span>
        </h1>
      </div>
    </>
  )
} 