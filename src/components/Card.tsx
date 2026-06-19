import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

// Provides the shared translucent card surface used by legacy layouts.
export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
