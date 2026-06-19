import type { PageBackground } from "../types/page";

type BackgroundRendererProps = {
  background?: PageBackground;
  image?: string;
  video?: string;
};

const mediaReadabilityOverlay = [
  "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 46%)",
  "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.12) 32%, rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.62) 100%)",
  "linear-gradient(90deg, rgba(0,0,0,0.36) 0%, rgba(0,0,0,0.04) 44%, rgba(0,0,0,0.30) 100%)",
].join(", ");

const vignetteOverlay =
  "radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,0.62) 100%)";

function getColorBackground(color = "#18181b") {
  return [
    `radial-gradient(circle at 18% 14%, color-mix(in srgb, ${color} 58%, white 42%) 0%, transparent 32%)`,
    `radial-gradient(circle at 82% 18%, color-mix(in srgb, ${color} 68%, #38bdf8 32%) 0%, transparent 30%)`,
    `linear-gradient(135deg, color-mix(in srgb, ${color} 92%, #020617 8%) 0%, color-mix(in srgb, ${color} 62%, #020617 38%) 58%, #09090b 100%)`,
  ].join(", ");
}

function BackgroundTreatment({
  hasMedia,
  vignette,
}: {
  hasMedia: boolean;
  vignette: boolean;
}) {
  return (
    <>
      {hasMedia && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: mediaReadabilityOverlay }}
        />
      )}
      {vignette && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: vignetteOverlay }}
        />
      )}
    </>
  );
}

// Renders the configured page background, with legacy image/video fallbacks.
export default function BackgroundRenderer({
  background,
  image,
  video,
}: BackgroundRendererProps) {
  const resolved =
    background ||
    (video
      ? { type: "video" as const, src: video }
      : image
        ? { type: "image" as const, src: image }
        : { type: "color" as const, color: "#09090b" });

  if (resolved.type === "video" && resolved.src) {
    return (
      <>
        <video
          src={resolved.src}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <BackgroundTreatment
          hasMedia
          vignette={resolved.vignette ?? true}
        />
      </>
    );
  }

  if (resolved.type === "image" && resolved.src) {
    return (
      <>
        <img
          src={resolved.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <BackgroundTreatment
          hasMedia
          vignette={resolved.vignette ?? true}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: getColorBackground(resolved.color) }}
      />
      <BackgroundTreatment
        hasMedia={false}
        vignette={resolved.vignette ?? true}
      />
    </>
  );
}
