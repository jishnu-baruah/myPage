"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { X, MessageCircle } from "lucide-react"
import { marked } from "marked"
import DOMPurify from "dompurify"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  // Memoize the marked renderer to avoid re-instantiating on every render
  const markedInstance = useMemo(() => {
    const renderer = new marked.Renderer()
    renderer.link = function ({ href, title, text }: { href: string, title?: string | null, text: string }) {
      const safeHref = typeof href === 'string' ? href : ''
      let safeText = typeof text === 'string' ? text : ''
      if (!safeText) safeText = safeHref || 'link'
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="underline text-blue-500 hover:text-blue-700">${safeText}</a>`
    }
    marked.setOptions({ renderer })
    return renderer
  }, [])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue("")
    setIsTyping(true)

    const history = []
    let question = null
    for (let i = messages.length - 1; i >= 0 && history.length < 3; i--) {
      const m = messages[i]
      if (!question && m.isUser) question = { question: m.text }
      else if (question && !m.isUser) {
        history.unshift({ question: question.question, answer: m.text })
        question = null
      }
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text, history }),
      })
      const data = await res.json()

      let responseText = typeof data.response === "object" && "result" in data.response
        ? String(data.response.result)
        : String(data.response)

      // Auto-link URLs in the response text to Markdown links
      const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?![\]\)])(?!\()(?<!\]\()/g
      responseText = responseText.replace(urlRegex, (url) => `[${url}](${url})`)

      const cleaned = responseText.replace(/undefined/g, "").trim()

      const aiMsg: Message = {
        id: Date.now().toString() + "ai",
        text: cleaned,
        isUser: false,
        timestamp: new Date(),
      }

      console.log("AI:", cleaned)
      setMessages((prev) => [...prev, aiMsg])
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + "err",
        text: "[Error contacting backend]",
        isUser: false,
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed top-4 right-4 z-50 lg:bottom-8 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:top-auto lg:right-auto">
        <button
          onClick={() => {
            setIsOpen(true)
            setMessages([{
              id: "welcome",
              text: "Hi! I'm here to answer any questions about my work, experience, or projects.",
              isUser: false,
              timestamp: new Date("2024-01-01T00:00:00Z"), // Fixed timestamp to avoid hydration mismatch
            }])
          }}
          className="text-neutral-900 dark:text-neutral-100 px-4 py-2 hover:text-neutral-600 dark:hover:text-neutral-400 transition-all duration-300 flex items-center space-x-2 group"
        >
          <span className="text-xs font-light">Ask anything about me</span>
          <MessageCircle size={16} className="text-neutral-900 dark:text-neutral-100 scale-110 group-hover:scale-100 transition-transform" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-neutral-200 dark:bg-neutral-800 bg-opacity-90 dark:bg-opacity-90">
      <div className="w-full max-w-2xl h-[80vh] bg-neutral-100 dark:bg-neutral-900 border border-neutral-400 dark:border-neutral-600 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 lg:p-10 border-b border-neutral-400 dark:border-neutral-600">
          <h3 className="text-xs font-light text-neutral-900 dark:text-neutral-100">Chat</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {messages.map((msg) => {
            // Debug log for each message
            if (typeof window !== 'undefined') {
              console.log('Rendering message:', { id: msg.id, timestamp: msg.timestamp, text: msg.text });
            }
            // Use marked.parse with the global renderer to ensure links open in a new tab
            const html = marked.parse(msg.text) as string;
            if (typeof window !== 'undefined') {
              console.log('Sanitized HTML:', DOMPurify.sanitize(html));
            }
            return (
              <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${msg.isUser ? "text-right" : "text-left"}`}>
                  <div
                    className="text-xs text-neutral-900 dark:text-neutral-100 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(html),
                    }}
                  />
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div className="text-xs text-neutral-700 dark:text-neutral-300 flex items-center space-x-1">
              <span>Typing</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-neutral-700 dark:bg-neutral-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-neutral-700 dark:bg-neutral-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-1 h-1 bg-neutral-700 dark:bg-neutral-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-6 lg:p-10 border-t border-neutral-400 dark:border-neutral-600">
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleEnter}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-neutral-400 dark:border-neutral-600 focus:outline-none text-xs bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
