"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { marked } from 'marked'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Prepare chat history for memory (last 3 Q&A pairs)
    const history = [];
    let userTurn = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (!userTurn && msg.isUser) {
        userTurn = { question: msg.text };
      } else if (userTurn && !msg.isUser) {
        history.unshift({ question: userTurn.question, answer: msg.text });
        userTurn = null;
        if (history.length >= 3) break;
      }
    }

    // Call RAG+Gemini backend
    try {
      const res = await fetch("https://mypage-ied6.onrender.com/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.text, history })
      });
      const data = await res.json();
      let aiText = data.gemini_answer || "Sorry, I couldn't find an answer.";
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 2).toString(),
        text: "[Error contacting backend]",
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInitialClick = () => {
    setIsOpen(true)
    const welcomeMessage: Message = {
      id: "welcome",
      text: "Hi! I'm here to answer any questions about my work, experience, or projects. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  // Patch marked renderer to add a custom class to links
  const renderer = new marked.Renderer();
  renderer.link = function(href, title, text) {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="highlight-link">${text}</a>`;
  };

  function linkifyUrls(text: string) {
    // Only linkify URLs that are not already inside []() or <a>
    return text.replace(
      /(?<!\]\()(?<!href=")(https?:\/\/[^\s)]+)/g,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="highlight-link">${url}</a>`
    );
  }

  function fixDemoLinks(text: string) {
    // Replace [Demo](url) and any markdown or HTML link with just the raw URL
    let fixed = text.replace(/\[.*?\]\((https?:\/\/[^)]+)\)/g, '$1'); // markdown links
    fixed = fixed.replace(/<a [^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>.*?<\/a>/g, '$1'); // html links
    // Remove lines with 'Email: undefined'
    fixed = fixed.replace(/^\s*-?\s*\*\*Email:\*\*\s*undefined\s*$/gim, '');
    // Optionally, remove any empty list items
    fixed = fixed.replace(/^\s*-\s*$/gm, '');
    // Remove duplicate links (keep only the first occurrence)
    const seen = new Set();
    fixed = fixed.replace(/(https?:\/\/[^\s)]+)/g, (url) => {
      if (seen.has(url)) return '';
      seen.add(url);
      return url;
    });
    return fixed;
  }

  if (!isOpen) {
    return (
      <div className="fixed top-4 right-4 z-50 lg:bottom-8 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:top-auto lg:right-auto">
        <button
          onClick={handleInitialClick}
          className="text-neutral-900 dark:text-neutral-100 px-4 py-2 hover:text-neutral-600 dark:hover:text-neutral-400 transition-all duration-300 flex items-center space-x-2"
        >
          <span className="text-xs font-light">Ask anything about me</span>
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
        <div
          className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${message.isUser ? "text-right" : "text-left"}`}>
                <div className="text-xs text-neutral-900 dark:text-neutral-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: marked.parse(linkifyUrls(fixDemoLinks(message.text)), { renderer }) }} />
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex space-x-1 items-center">
                  <span>Typing</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-neutral-700 dark:bg-neutral-300 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-neutral-700 dark:bg-neutral-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-neutral-700 dark:bg-neutral-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 lg:p-10 border-t border-neutral-400 dark:border-neutral-600">
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-neutral-400 dark:border-neutral-600 focus:outline-none text-xs bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
            />
            <button
              onClick={handleSendMessage}
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
