import BackgroundRenderer from "./BackgroundRenderer";
import Countdown from "./Countdown";
import EditableElement from "./EditableElement";
import {
  getMediaFrameStyle,
  getOverlayBackground,
  getSize,
  renderInteractiveElement,
} from "./interactiveRenderHelpers";
import type { InteractiveElement, InteractivePageConfig } from "../types/page";

type EditableCanvasProps = {
  page: InteractivePageConfig;
  selectedId?: string;
  onSelect: (id?: string) => void;
  onChange: (page: InteractivePageConfig) => void;
};

// Renders an element in editor mode without enabling its public click behavior.
function renderEditableContent(element: InteractiveElement) {
  if (element.type === "text") {
    return (
      <div
        className="rounded-2xl px-6 py-4"
        style={{
          width: getSize(element.width) || "max-content",
          height: getSize(element.height),
          maxWidth: "none",
          fontSize: element.fontSize ?? 48,
          color: element.color || "#ffffff",
          textAlign: element.align || "center",
          fontFamily: element.fontFamily,
          fontWeight: element.fontWeight ?? 700,
          background: getOverlayBackground(element.bgColor, element.bgOpacity),
          boxSizing: "border-box",
          whiteSpace: element.width ? "pre-wrap" : "pre",
        }}
      >
        {element.text}
      </div>
    );
  }

  if (element.type === "countdown") {
    return (
      <Countdown
        seconds={element.seconds}
        size={element.size}
        color={element.color}
        bgColor={element.bgColor}
        borderColor={element.borderColor}
      />
    );
  }

  if (element.type === "image") {
    return (
      <img
        src={element.src}
        alt={element.alt || ""}
        style={{
          width: getSize(element.width) || "220px",
          height: getSize(element.height),
          ...getMediaFrameStyle(element, "contain"),
        }}
      />
    );
  }

  if (element.type === "video") {
    return (
      <video
        src={element.src}
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: getSize(element.width) || "240px",
          height: getSize(element.height),
          ...getMediaFrameStyle(element, "cover"),
        }}
      />
    );
  }

  if (element.type === "button") {
    return (
      <span
        className="block rounded-2xl px-6 py-4 text-center font-bold shadow-xl"
        style={{
          width: getSize(element.width),
          color: element.color || "#ffffff",
          background: element.bgColor || "#7c3aed",
          fontSize: element.fontSize,
          borderRadius: getSize(element.borderRadius),
        }}
      >
        {element.label}
      </span>
    );
  }

  return renderInteractiveElement(element);
}

// Displays the editable artboard and wires element selection and dragging.
export default function EditableCanvas({
  page,
  selectedId,
  onSelect,
  onChange,
}: EditableCanvasProps) {
  const elements = page.elements || [];

  // Applies a partial update to one element inside the current page config.
  const updateElement = (id: string, patch: Partial<InteractiveElement>) => {
    onChange({
      ...page,
      elements: elements.map((element) =>
        element.id === id ? ({ ...element, ...patch } as InteractiveElement) : element,
      ),
    });
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-zinc-900 text-white"
      onPointerDown={() => onSelect(undefined)}
    >
      <BackgroundRenderer
        background={page.background}
        image={page.backgroundImage || page.image}
        video={page.backgroundVideo || page.video}
      />

      {elements.map((element) => {
        if (!element.id) return renderInteractiveElement(element);

        return (
          <EditableElement
            key={element.id}
            element={element}
            selected={selectedId === element.id}
            onSelect={onSelect}
            onMove={(id, x, y) => updateElement(id, { x, y })}
            onResize={(id, patch) => updateElement(id, patch)}
          >
            <div className="pointer-events-none">
              {renderEditableContent(element)}
            </div>
          </EditableElement>
        );
      })}
    </div>
  );
}
