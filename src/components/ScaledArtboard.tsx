import { type ReactNode, useEffect, useRef, useState } from "react";

export const ARTBOARD_WIDTH = 1920;
export const ARTBOARD_HEIGHT = 1080;

type ScaledArtboardProps = {
  children: ReactNode;
};

// Scales the fixed 1920x1080 artboard to fit inside its container.
export default function ScaledArtboard({ children }: ScaledArtboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Watches the container size and recalculates the display scale.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Uses the smaller axis scale so the entire artboard stays visible.
    const updateScale = () => {
      const widthScale = container.clientWidth / ARTBOARD_WIDTH;
      const heightScale = container.clientHeight / ARTBOARD_HEIGHT;

      setScale(Math.min(widthScale, heightScale));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: ARTBOARD_WIDTH * scale,
          height: ARTBOARD_HEIGHT * scale,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: ARTBOARD_WIDTH,
            height: ARTBOARD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
