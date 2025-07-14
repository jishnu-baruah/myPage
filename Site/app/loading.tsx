import React from "react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white dark:bg-[rgb(23,23,23)] text-black dark:text-white">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-pulse drop-shadow-lg" style={{ letterSpacing: '0.05em' }}>
        Jishnu Baruah
      </h1>
      <div className="mt-4 h-2 w-32 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full animate-gradient-x" />
    </div>
  )
}

// Add a custom animation for gradient shimmer in globals.css if not present:
// @keyframes gradient-x {
//   0%, 100% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
// }
// .animate-gradient-x {
//   background-size: 200% 200%;
//   animation: gradient-x 2s ease-in-out infinite;
// } 