"use client"

import { useRef } from "react"
import Navigation from "@/components/navigation"
import ChatInterface from "@/components/chat-interface"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Contact() {
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

          {/* Center Column - Empty (no animation) */}
          <div className="lg:col-span-6 relative">
          </div>

          {/* Right Column - Contact Content */}
          <div className="lg:col-span-3 relative z-20 flex flex-col items-center lg:items-end mt-2 lg:mt-0 h-full lg:overflow-visible">
            {/* Contact Information */}
            <div className="relative lg:absolute top-0 right-0 lg:top-10 lg:right-10 text-xs text-neutral-900 dark:text-neutral-100 w-full max-w-xs mx-auto lg:mx-0 mt-2 lg:mt-0">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 font-medium">Email</div>
                  <div>
                    <a
                      href="mailto:jsbaruah1@gmail.com"
                      className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                    >
                      jsbaruah1@gmail.com ↗
                    </a>
                  </div>
                </div>

                <div>
                  <div className="mb-2 font-medium">Social</div>
                  <div className="space-y-1">
                    <div>
                      <a
                        href="https://x.com/JishnuBaruah00"
                        className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                      >
                        X(Twitter) ↗
                      </a>
                    </div>
                    <div>
                      <a
                        href="https://linkedin.com/in/jishnubaruah2020/"
                        className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                      >
                        LinkedIn ↗
                      </a>
                    </div>
                    <div>
                      <a
                        href="https://github.com/jishnu-baruah"
                        className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                      >
                        GitHub ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="relative lg:absolute bottom-0 right-0 lg:bottom-20 lg:right-10 text-xs text-neutral-900 dark:text-neutral-100 w-full max-w-xs mx-auto lg:mx-0 mt-4 lg:mt-8 pb-16 lg:pb-0">
              <div className="space-y-4">
                <div className="mb-4 font-medium">Get in touch</div>

                <form className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full px-3 py-2 border border-neutral-400 dark:border-neutral-600 focus:outline-none text-xs bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-neutral-400 dark:border-neutral-600 focus:outline-none text-xs bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder="Message"
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-400 dark:border-neutral-600 focus:outline-none text-xs bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-xs"
                  >
                    Send Message
                  </button>
                </form>
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
