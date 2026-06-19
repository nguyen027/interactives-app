import { type ReactNode, useEffect, useRef, useState } from "react";

type EditorViewportProps = {
  children: ReactNode;
};

const ARTBOARD_WIDTH = 1920;
const ARTBOARD_HEIGHT = 1080;
const VIEWPORT_PADDING = 48;

type ZoomMode = "fit" | "100" | "75" | "50";

const zoomOptions: Array<{ label: string; mode: ZoomMode; scale?: number }> = [
  { label: "Fit", mode: "fit" },
  { label: "100%", mode: "100", scale: 1 },
  { label: "75%", mode: "75", scale: 0.75 },
  { label: "50%", mode: "50", scale: 0.5 },
];

// Shows the fixed 1920x1080 artboard inside a zoomable editor viewport.
export default function EditorViewport({ children }: EditorViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.5);
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fit");
  const fixedZoom = zoomOptions.find((option) => option.mode === zoomMode)?.scale;
  const scale = fixedZoom ?? fitScale;

  // Recalculates the fit zoom whenever the available viewport size changes.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Computes the largest scale that keeps the artboard visible with padding.
    const updateScale = () => {
      const widthScale =
        (viewport.clientWidth - VIEWPORT_PADDING * 2) / ARTBOARD_WIDTH;
      const heightScale =
        (viewport.clientHeight - VIEWPORT_PADDING * 2) / ARTBOARD_HEIGHT;

      setFitScale(Math.max(Math.min(widthScale, heightScale, 1), 0.1));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={viewportRef}
      className="relative min-h-0 min-w-0 flex-1 overflow-auto rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
    >
      <div className="sticky left-0 top-0 z-30 flex justify-end p-3">
        <div className="flex rounded-lg border border-white/15 bg-zinc-950/90 p-1 shadow-xl backdrop-blur">
          {zoomOptions.map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => setZoomMode(option.mode)}
              className={[
                "h-8 rounded px-3 text-xs font-bold transition",
                zoomMode === option.mode
                  ? "bg-white text-zinc-950"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative mx-auto"
        style={{
          width: ARTBOARD_WIDTH * scale,
          height: ARTBOARD_HEIGHT * scale,
          marginTop: VIEWPORT_PADDING,
          marginBottom: VIEWPORT_PADDING,
        }}
      >
        <div
          className="absolute left-0 top-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
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
    </section>
  );
}
