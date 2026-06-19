import type { CSSProperties } from "react";
import Card from "./Card";
import Countdown from "./Countdown";
import OverlayText from "./OverlayText";
import type { InteractiveElement } from "../types/page";

// Keeps overlay opacity inside the valid CSS alpha range.
function clampOpacity(value: number | undefined) {
  if (value === undefined) return 0.45;

  return Math.min(Math.max(value, 0), 1);
}

// Converts a color plus opacity into a CSS background value.
export function getOverlayBackground(color = "#000000", opacity?: number) {
  const alpha = clampOpacity(opacity);

  if (alpha === 0) return "transparent";

  if (color.startsWith("rgba(") || color.startsWith("rgb(")) {
    return color;
  }

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => `${char}${char}`)
            .join("")
        : hex;

    if (normalized.length === 6) {
      const red = parseInt(normalized.slice(0, 2), 16);
      const green = parseInt(normalized.slice(2, 4), 16);
      const blue = parseInt(normalized.slice(4, 6), 16);

      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
  }

  return `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`;
}

// Normalizes numeric sizes to pixel strings while preserving CSS strings.
export function getSize(value: number | string | undefined) {
  if (typeof value === "number") return `${value}px`;

  return value;
}

// Builds visual frame styles shared by editable and public media rendering.
export function getMediaFrameStyle(
  element: Extract<InteractiveElement, { type: "image" | "video" }>,
  objectFit: CSSProperties["objectFit"],
): CSSProperties {
  const borderWidth = Math.max(element.borderWidth ?? 0, 0);

  return {
    ...(element.type === "image" ? { opacity: element.opacity } : {}),
    objectFit,
    boxSizing: "border-box",
    border:
      borderWidth > 0
        ? `${borderWidth}px ${element.borderStyle || "solid"} ${
            element.borderColor || "#ffffff"
          }`
        : undefined,
    borderRadius: getSize(element.borderRadius),
  };
}

// Builds the shared absolute positioning style for rendered elements.
export function getPositionStyle(element: InteractiveElement): CSSProperties {
  return {
    position: "absolute",
    left: `${element.x ?? 50}%`,
    top: `${element.y ?? 50}%`,
    width: getSize(element.width),
    height: getSize(element.height),
    transform: "translate(-50%, -50%)",
    zIndex: element.zIndex ?? 10,
  };
}

// Renders one configured interactive element into its public display component.
export function renderInteractiveElement(element: InteractiveElement) {
  const key = element.id || `${element.type}-${element.x}-${element.y}`;

  if (element.type === "text") {
    return (
      <OverlayText
        key={key}
        text={element.text}
        x={element.x}
        y={element.y}
        width={getSize(element.width)}
        height={getSize(element.height)}
        align={element.align}
        fontSize={element.fontSize}
        color={element.color}
        fontFamily={element.fontFamily}
        fontWeight={element.fontWeight}
        background={getOverlayBackground(element.bgColor, element.bgOpacity)}
      />
    );
  }

  if (element.type === "countdown") {
    return (
      <div key={key} className={element.className} style={getPositionStyle(element)}>
        <Countdown seconds={element.seconds} size={element.size} />
      </div>
    );
  }

  if (element.type === "image") {
    return (
      <img
        key={key}
        src={element.src}
        alt={element.alt || ""}
        className={element.className}
        style={{
          ...getPositionStyle(element),
          ...getMediaFrameStyle(element, "contain"),
        }}
      />
    );
  }

  if (element.type === "video") {
    return (
      <video
        key={key}
        src={element.src}
        autoPlay
        muted
        loop
        playsInline
        className={element.className}
        style={{
          ...getPositionStyle(element),
          ...getMediaFrameStyle(element, "cover"),
        }}
      />
    );
  }

  if (element.type === "button") {
    return (
      <a
        key={key}
        href={element.href}
        className={[
          "rounded-2xl px-6 py-4 text-center font-bold shadow-xl transition hover:scale-105",
          element.className || "",
        ].join(" ")}
        style={{
          ...getPositionStyle(element),
          color: element.color || "#ffffff",
          background: element.bgColor || "#7c3aed",
          fontSize: element.fontSize,
          borderRadius: getSize(element.borderRadius),
          width: getSize(element.width),
          maxWidth: "92%",
          overflowWrap: "break-word",
        }}
      >
        {element.label}
      </a>
    );
  }

  return (
    <div key={key} style={getPositionStyle(element)}>
      <Card className={element.className || ""}>
        {element.title && <h3 className="text-2xl font-bold">{element.title}</h3>}
        {element.body && <p className="mt-3 text-zinc-300">{element.body}</p>}
      </Card>
    </div>
  );
}
