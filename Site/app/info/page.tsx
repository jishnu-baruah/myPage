"use client"

import { useRef } from "react"
import Navigation from "@/components/navigation"
import ChatInterface from "@/components/chat-interface"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Info() {
  return (
    <div
      className="p-4 lg:p-8 overflow-hidden relative"
      style={{ height: "100dvh" }}
    >
      {/* Theme Toggle - Outside Border */}
      <ThemeToggle />

      {/* Main Container with Border */}
      <div className="h-full border border-neutral-400 dark:border-neutral-600 dark:bg-black relative overflow-hidden" style={{ background: 'transparent' }}>
        {/* Three Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen relative overflow-visible">
          {/* Left Column */}
          <div className="lg:col-span-3 p-6 lg:p-10 relative z-20">
            {/* Name and Title */}
            <div className="mb-12">
              <h1 className="text-2xl lg:text-3xl font-light text-neutral-900 dark:text-neutral-100 mb-1 leading-tight">
                Jishnu Baruah
              </h1>
              <p className="text-xs text-neutral-700 dark:text-neutral-300">Builder & Technologist</p>
            </div>

            {/* Navigation */}
            <Navigation />
          </div>

          {/* Center Column - Social Links Only */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            <div className="relative lg:absolute top-0 left-0 lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-y-1/2 lg:-translate-x-1/2 text-xs text-neutral-900 dark:text-neutral-100 z-10 w-full max-w-xs mx-auto mt-2 lg:mt-0">
              <div className="space-y-1">
                <div>
                  <a
                    href="https://twitter.com/jishnu"
                    className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                  >
                    X(Twitter) ↗
                  </a>
                </div>
                <div>
                  <a
                    href="https://instagram.com/jishnu"
                    className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                  >
                    Instagram ↗
                  </a>
                </div>
                <div>
                  <a
                    href="mailto:hello@jishnu.dev"
                    className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                  >
                    Email ↗
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info Content */}
          <div className="lg:col-span-3 relative z-20 flex flex-col items-center lg:items-end mt-8 lg:mt-0 h-full lg:overflow-visible">
            {/* Top Right - Links */}
            <div className="relative lg:absolute top-0 right-0 lg:top-10 lg:right-10 text-xs text-neutral-900 dark:text-neutral-100 w-full max-w-xs mx-auto lg:mx-0 mt-2 lg:mt-0">
              <div className="space-y-1">
                <div>
                  <a
                    href="https://github.com/jishnu-baruah"
                    className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                    target="_blank" rel="noopener noreferrer"
                  >
                    GitHub ↗
                  </a>
                </div>
                <div>
                  <a
                    href="https://in.linkedin.com/in/jishnubaruah2020"
                    className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                    target="_blank" rel="noopener noreferrer"
                  >
                    LinkedIn ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Right - Achievements (absolutely positioned in bordered container) */}
            <div className="text-xs text-neutral-900 dark:text-neutral-100 leading-relaxed z-30 max-w-full lg:max-w-xs text-right mt-4 lg:mt-0 lg:absolute lg:bottom-24 lg:right-8 pb-16">
              <p>
                <span className="font-semibold">Awards & Achievements</span>
                <br />
                <br />
                • BRICS 2024 International Skills Competition — 3rd Prize, Data Analytics (India Representative)
                <br />
                • EduChain Hackathon (Semester 3) — Winner, Mintellect (AI Academic Platform) & Kuroro (AI Study Guide Generator)
                <br />
                • Techno Batanagar Hackathon — Prize Winner, IoT Track (Haptic Feedback Suit for the Blind)
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface />
      </div>
    </div>
  )
}
