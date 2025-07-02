"use client"

import { useEffect, useRef, useState } from "react"
import Navigation from "@/components/navigation"
import ChatInterface from "@/components/chat-interface"
import { ThemeToggle } from "@/components/theme-toggle"

const projects = [
  {
    title: "Mintellect",
    year: "2025",
    shortDescription: "AI Academic Platform",
    description: "AI-Powered Academic Integrity & Research Publishing Platform. Combines AI tools with decentralized storage to ensure integrity in academic publishing.",
    tech: ["Next.js", "Node.js", "MongoDB", "AI APIs", "Web3 (IPFS/Filecoin)"],
    role: "Backend & Platform Architect",
    demo: "https://www.mintellect.xyz/",
    source: "Private",
  },
  {
    title: "Satsfi",
    year: "2025",
    shortDescription: "Prompt-to-DeFi Tool",
    description: "Prompt-to-DeFi Automation Tool. Convert plain text prompts into DeFi operations.",
    tech: ["Next.js", "Web3.js", "AI APIs", "Solidity", "Vercel"],
    role: "System Design & Backend",
    demo: "https://satsfi.vercel.app/",
    source: "Private",
  },
  {
    title: "Kuroro Sensei",
    year: "2025",
    shortDescription: "AI Study Guides",
    description: "AI-Powered Study Guide Generator. Crafts personalized, efficient revision notes for exam prep.",
    tech: ["Node.js", "LLM APIs", "LangChain", "Pinecone"],
    role: "Backend & Architecture",
    demo: "https://kuroro-sensei.vercel.app/",
    source: "Private",
  },
  {
    title: "Outdated",
    year: "2025",
    shortDescription: "Private ML Platform",
    description: "Privacy-First Machine Learning Platform. Local, secure ML without data compromise.",
    tech: ["Python", "Flask/FastAPI", "Federated Learning", "WebRTC"],
    role: "Backend & Privacy Systems",
    demo: "https://www.outdatedlabs.com/",
    source: "Private",
  },
  {
    title: "IncomeStream",
    year: "2024",
    shortDescription: "Web3 Payments",
    description: "Web3 Payment Flow Toolkit. Quickly set up Web3-compatible payment flows.",
    tech: ["React", "Web3.js", "Solidity", "Vercel"],
    role: "Fullstack & Smart Contract Integration",
    demo: "https://income-stream-flow-hackathon.vercel.app/",
    source: "Private",
  },
  {
    title: "Haptic Feedback Suit for the Blind",
    year: "2023",
    shortDescription: "IoT Haptic Suit",
    description: "Wearable IoT Solution for Visually Impaired Navigation. Real-time haptic suit using ultrasonic sensors to guide blind users through vibrations.",
    tech: ["Arduino","ESP32", "Ultrasonic Sensors", "Vibration Motors", "Embedded C"],
    role: "Lead Developer (Circuit, Firmware, Prototype)",
    demo: "Offline (hardware demo available on request)",
    source: "Not available",
    award: "Techno Batanagar Hackathon – IoT Prize Winner"
  },
]

export default function Projects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedProject, setSelectedProject] = useState<number | null>(null)

  return (
    <div
      className="p-4 lg:p-8"
      style={{ height: "100dvh" }}
    >
      {/* Theme Toggle - Outside Border */}
      <ThemeToggle />

      {/* Main Container with Border */}
      <div className="h-full border border-neutral-400 dark:border-neutral-600 dark:bg-black relative overflow-hidden" style={{ background: 'transparent' }}>
        {/* Three Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 h-full relative">
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

          {/* Center Column - Particle Stream Only */}
          <div className="lg:col-span-3 relative">
            {/* Three.js Canvas for flowing stream */}
            <div className="absolute inset-0">
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }} />
            </div>
          </div>

          {/* Right Column - Projects List */}
          <div className="lg:col-span-4 relative z-20">
            <div
              className="overflow-y-auto scrollbar-none"
              style={{
                height: "100vh",
                maxHeight: "100dvh",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="space-y-8 px-6 lg:px-10" style={{ paddingTop: "35vh", paddingBottom: "50vh" }}>
                {projects.map((project, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer transition-all duration-300 text-right ${
                      selectedProject === index ? "opacity-100" : "opacity-80 hover:opacity-100"
                    }`}
                    onClick={() => setSelectedProject(selectedProject === index ? null : index)}
                  >
                    <div className="space-y-2">
                      <a href={project.demo} target="_blank" rel="noopener noreferrer" className="font-semibold text-xl lg:text-2xl no-underline hover:opacity-80 transition-opacity">{project.title}</a>
                      <div className="text-xs text-neutral-500 w-full text-right whitespace-normal lg:whitespace-nowrap break-words">{project.year} &middot; {project.role} &middot; {project.shortDescription}</div>
                      <div className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center justify-end space-x-4">
                        {/* No 'design' property, so nothing to render here */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface />
      </div>
    </div>
  )
}