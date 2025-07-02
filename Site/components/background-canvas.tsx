"use client"

import { BackgroundBeams } from "./ui/background-beams";

export default function BackgroundCanvas({ style, className }: { style?: React.CSSProperties, className?: string }) {
  return (
    <BackgroundBeams className={className} />
  );
} 