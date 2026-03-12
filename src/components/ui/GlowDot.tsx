"use client";

interface GlowDotProps {
  color: "green" | "amber" | "red" | "blue" | "cyan" | "orange";
  size?: "sm" | "md";
}

const colorMap = {
  green: { bg: "bg-accent-green", shadow: "var(--glow-green)" },
  amber: { bg: "bg-accent-amber", shadow: "var(--glow-amber)" },
  red: { bg: "bg-accent-red", shadow: "var(--glow-red)" },
  blue: { bg: "bg-accent-blue", shadow: "var(--glow-blue)" },
  cyan: { bg: "bg-accent-cyan", shadow: "var(--glow-cyan)" },
  orange: { bg: "bg-accent-orange", shadow: "var(--glow-amber)" },
};

const sizeMap = { sm: "h-2 w-2", md: "h-3 w-3" };

export function GlowDot({ color, size = "sm" }: GlowDotProps) {
  const { bg, shadow } = colorMap[color];
  return (
    <span
      className={`inline-block rounded-full ${bg} ${sizeMap[size]} glow-dot`}
      style={{ boxShadow: shadow }}
    />
  );
}
