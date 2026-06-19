type OverlayTextProps = {
  text: string;
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  fontSize?: number;
  color?: string;
  align?: "left" | "center" | "right";
  fontFamily?: string;
  fontWeight?: number;
  background?: string;
};

// Positions and styles a text overlay on the interactive artboard.
export default function OverlayText({
  text,
  x = 50,
  y = 50,
  width,
  height,
  fontSize = 48,
  color = "#ffffff",
  align = "center",
  fontFamily,
  fontWeight = 700,
  background = "rgba(0,0,0,0.45)",
}: OverlayTextProps) {
  return (
    <div
      className="absolute rounded-2xl px-6 py-4 font-bold"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: width || "max-content",
        height,
        maxWidth: "92%",
        transform: "translate(-50%, -50%)",
        fontSize,
        color,
        textAlign: align,
        fontFamily,
        fontWeight,
        background,
        boxSizing: "border-box",
        overflowWrap: "break-word",
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
    </div>
  );
}
