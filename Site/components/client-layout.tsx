"use client";
import React, { useEffect, useState } from "react";
import BackgroundCanvas from "@/components/background-canvas";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white dark:bg-[rgb(23,23,23)] text-black dark:text-white">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-pulse drop-shadow-lg" style={{ letterSpacing: '0.05em' }}>
          Jishnu Baruah
        </h1>
        <div className="mt-4 h-2 w-32 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full animate-gradient-x" />
      </div>
    );
  }

  return <>{children}</>;
} 