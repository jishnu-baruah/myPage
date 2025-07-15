"use client";
import React, { useEffect, useState } from "react";
import BackgroundCanvas from "@/components/background-canvas";
import Loading from "@/app/loading";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Only show splash if not already shown this session
    if (!sessionStorage.getItem("splashShown")) {
      setShowSplash(true);
      sessionStorage.setItem("splashShown", "true");
      const timer = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (showSplash) {
    return <Loading />;
  }

  return <>{children}</>;
} 