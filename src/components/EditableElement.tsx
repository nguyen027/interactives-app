import { useRef, type PointerEvent, type ReactNode } from "react";
import type { InteractiveElement } from "../types/page";
import { getPositionStyle } from "./interactiveRenderHelpers";

type EditableElementProps = {
  element: InteractiveElement;
  selected: boolean;
  children: ReactNode;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, patch: Partial<InteractiveElement>) => void;
};

type ResizeHandle = {
  key: string;
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
  className: string;
  cursor: string;
};

const ARTBOARD_WIDTH = 1920;
const ARTBOARD_HEIGHT = 1080;
const MIN_SIZE = 40;

const resizeHandles: ResizeHandle[] = [
  {
    key: "nw",
    x: -1,
    y: -1,
    className: "-left-2 -top-2",
    cursor: "nwse-resize",
  },
  {
    key: "n",
    x: 0,
    y: -1,
    className: "left-1/2 -top-2 -translate-x-1/2",
    cursor: "ns-resize",
  },
  {
    key: "ne",
    x: 1,
    y: -1,
    className: "-right-2 -top-2",
    cursor: "nesw-resize",
  },
  {
    key: "e",
    x: 1,
    y: 0,
    className: "-right-2 top-1/2 -translate-y-1/2",
    cursor: "ew-resize",
  },
  {
    key: "se",
    x: 1,
    y: 1,
    className: "-bottom-2 -right-2",
    cursor: "nwse-resize",
  },
  {
    key: "s",
    x: 0,
    y: 1,
    className: "left-1/2 -bottom-2 -translate-x-1/2",
    cursor: "ns-resize",
  },
  {
    key: "sw",
    x: -1,
    y: 1,
    className: "-bottom-2 -left-2",
    cursor: "nesw-resize",
  },
  {
    key: "w",
    x: -1,
    y: 0,
    className: "-left-2 top-1/2 -translate-y-1/2",
    cursor: "ew-resize",
  },
];

// Keeps dragged element coordinates inside the artboard percentage bounds.
function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

// Keeps element dimensions usable while allowing compact controls.
function clampSize(value: number) {
  return Math.max(Math.round(value), MIN_SIZE);
}

// Wraps one artboard element with selection and pointer-drag behavior.
export default function EditableElement({
  element,
  selected,
  children,
  onSelect,
  onMove,
  onResize,
}: EditableElementProps) {
  const id = element.id;
  const elementRef = useRef<HTMLDivElement>(null);
  const positionStyle = getPositionStyle(element);

  if (element.type === "text" && !element.width) {
    positionStyle.width = "max-content";
    positionStyle.maxWidth = "none";
  }

  // Starts dragging the element and converts pointer movement into percentages.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!id) return;

    event.preventDefault();
    event.stopPropagation();
    onSelect(id);

    const canvas = elementRef.current?.parentElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);

    // Updates the selected element position as the pointer moves.
    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      onMove(id, clampPercent(x), clampPercent(y));
    };

    // Removes global drag listeners when the pointer is released.
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Starts resizing from one handle and keeps the opposite edge anchored.
  const handleResizePointerDown =
    (handle: ResizeHandle) => (event: PointerEvent<HTMLButtonElement>) => {
      if (!id) return;

      event.preventDefault();
      event.stopPropagation();
      onSelect(id);

      const target = elementRef.current;
      const canvas = target?.parentElement;
      if (!target || !canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const elementRect = target.getBoundingClientRect();
      const scale = canvasRect.width / ARTBOARD_WIDTH || 1;
      const startWidth = elementRect.width / scale;
      const startHeight = elementRect.height / scale;
      const startCenterX = ((element.x ?? 50) / 100) * ARTBOARD_WIDTH;
      const startCenterY = ((element.y ?? 50) / 100) * ARTBOARD_HEIGHT;
      const startLeft = startCenterX - startWidth / 2;
      const startRight = startCenterX + startWidth / 2;
      const startTop = startCenterY - startHeight / 2;
      const startBottom = startCenterY + startHeight / 2;
      const startPointerX = event.clientX;
      const startPointerY = event.clientY;

      event.currentTarget.setPointerCapture(event.pointerId);

      const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
        const deltaX = (moveEvent.clientX - startPointerX) / scale;
        const deltaY = (moveEvent.clientY - startPointerY) / scale;
        let left = startLeft;
        let right = startRight;
        let top = startTop;
        let bottom = startBottom;

        if (handle.x < 0) left = Math.min(startLeft + deltaX, startRight - MIN_SIZE);
        if (handle.x > 0) right = Math.max(startRight + deltaX, startLeft + MIN_SIZE);
        if (handle.y < 0) top = Math.min(startTop + deltaY, startBottom - MIN_SIZE);
        if (handle.y > 0) bottom = Math.max(startBottom + deltaY, startTop + MIN_SIZE);

        const width = clampSize(right - left);
        const height = clampSize(bottom - top);
        const x = clampPercent(((left + width / 2) / ARTBOARD_WIDTH) * 100);
        const y = clampPercent(((top + height / 2) / ARTBOARD_HEIGHT) * 100);

        if (element.type === "countdown") {
          const size = clampSize(Math.max(width, height));
          onResize(id, { size, x, y });
          return;
        }

        onResize(id, { width, height, x, y } as Partial<InteractiveElement>);
      };

      const handlePointerUp = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    };

  return (
    <div
      ref={elementRef}
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && id) onSelect(id);
      }}
      className={[
        "cursor-move rounded outline-offset-4",
        selected ? "outline outline-2 outline-emerald-400" : "outline-none",
      ].join(" ")}
      style={{
        ...positionStyle,
        zIndex: (element.zIndex ?? 10) + 20,
        touchAction: "none",
      }}
    >
      {children}
      {selected &&
        resizeHandles.map((handle) => (
          <button
            key={handle.key}
            type="button"
            aria-label={`Resize ${handle.key}`}
            onPointerDown={handleResizePointerDown(handle)}
            className={[
              "absolute z-20 h-4 w-4 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_0_1px_rgba(0,0,0,0.45)]",
              handle.className,
            ].join(" ")}
            style={{ cursor: handle.cursor, touchAction: "none" }}
          />
        ))}
    </div>
  );
}
