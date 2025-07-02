"use client"

import { useEffect, useRef } from "react"
import Navigation from "@/components/navigation"
import ChatInterface from "@/components/chat-interface"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Portfolio() {
  return (
    <div
      className="p-4 lg:p-8 overflow-hidden"
      style={{ height: "100vh", height: "100dvh" }}
    >
      {/* Theme Toggle - Outside Border */}
      <ThemeToggle />

      {/* Main Container with Border */}
      <div className="h-full border border-neutral-400 dark:border-neutral-600 dark:bg-black relative overflow-hidden" style={{ background: 'transparent' }}>
        {/* Three Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen relative">
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

          {/* Center Column - Particle Stream */}
          <div className="lg:col-span-6 relative">
            {/* (Optional: Add content here) */}
          </div>

          {/* Right Column - Biography */}
          <div className="lg:col-span-3 p-6 lg:p-10 relative z-20 flex flex-col justify-end">
            <div className="relative lg:absolute bottom-0 right-0 lg:bottom-20 lg:right-10 text-xs text-neutral-900 dark:text-neutral-100 leading-relaxed max-w-full lg:max-w-[180px] mt-8 lg:mt-0 mb-32 lg:mb-0">
              <p>
                Building Web3 + AI Tools | Leading with Tech | Empowering Creators. I believe in building technology that empowers communities. With a background in full-stack development, IoT, and AI, I focus on solving real-world problems through smart, scalable solutions. I also lead and mentor student teams to foster a hands-on learning ecosystem. Kolkata, India.
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
