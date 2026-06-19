import { useEffect, useRef, useState } from "react";
import BackgroundRenderer from "./BackgroundRenderer";
import ScaledArtboard from "./ScaledArtboard";
import { renderInteractiveElement } from "./interactiveRenderHelpers";
import type { InteractivePageConfig } from "../types/page";

type InteractiveRendererProps = {
  page: InteractivePageConfig;
  mode?: "public" | "preview";
};

// Provides fullscreen controls for public interactive pages.
function FullscreenButton({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSupported = document.fullscreenEnabled;

  // Tracks whether this renderer shell is the current fullscreen element.
  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === targetRef.current);
    };

    document.addEventListener("fullscreenchange", updateFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
    };
  }, [targetRef]);

  if (!isSupported) return null;

  // Enters or exits fullscreen for the renderer shell.
  const toggleFullscreen = async () => {
    const target = targetRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await target.requestFullscreen();
  };

  return (
    <button
      type="button"
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      onClick={() => void toggleFullscreen()}
      className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white shadow-xl backdrop-blur transition hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      >
        {isFullscreen ? (
          <>
            <path d="M8 3v5H3" />
            <path d="M16 3v5h5" />
            <path d="M8 21v-5H3" />
            <path d="M16 21v-5h5" />
          </>
        ) : (
          <>
            <path d="M3 9V3h6" />
            <path d="M21 9V3h-6" />
            <path d="M3 15v6h6" />
            <path d="M21 15v6h-6" />
          </>
        )}
      </svg>
    </button>
  );
}

// Renders an interactive page using configured elements.
export default function InteractiveRenderer({
  page,
  mode = "public",
}: InteractiveRendererProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const isPublic = mode === "public";
  const image = page.backgroundImage || page.image || undefined;
  const video = page.backgroundVideo || page.video || undefined;
  const configuredElements = page.elements ?? [];

  const shellClass = [
    "relative overflow-hidden bg-zinc-900 text-white",
    isPublic ? "h-screen w-screen" : "h-full w-full",
  ].join(" ");

  return (
    <div ref={shellRef} className={shellClass}>
      <BackgroundRenderer background={page.background} image={image} video={video} />
      <ScaledArtboard>
        {configuredElements.map(renderInteractiveElement)}
      </ScaledArtboard>
      {isPublic && <FullscreenButton targetRef={shellRef} />}
    </div>
  );
}
