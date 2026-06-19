import type { PageBackground } from "../types/page";

type BackgroundRendererProps = {
  background?: PageBackground;
  image?: string;
  video?: string;
};

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
      <video
        src={resolved.src}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  if (resolved.type === "image" && resolved.src) {
    return (
      <img
        src={resolved.src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <div
      className="absolute inset-0"
      style={{ background: resolved.color || "#09090b" }}
    />
  );
}
