import ColorPicker from "./ColorPicker";
import UploadMedia from "./UploadMedia";
import { saveMediaFile } from "../services/mediaStorage";
import type { InteractiveElement, PageBackground } from "../types/page";

type ElementSettingsPanelProps = {
  selectedElement?: InteractiveElement;
  background?: PageBackground;
  onElementChange: (element: InteractiveElement) => void;
  onBackgroundChange: (background: PageBackground) => void;
  onMediaError?: (message: string) => void;
};

const fontFamilies = [
  { label: "System", value: "system-ui, sans-serif" },
  { label: "Inter / UI Sans", value: "Inter, system-ui, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica Neue, Helvetica, Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet", value: "Trebuchet MS, Arial, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Gill Sans", value: "Gill Sans, Gill Sans MT, Calibri, sans-serif" },
  { label: "Avenir", value: "Avenir, Avenir Next, system-ui, sans-serif" },
  { label: "Futura", value: "Futura, Trebuchet MS, Arial, sans-serif" },
  { label: "Century Gothic", value: "Century Gothic, AppleGothic, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Georgia", value: "Georgia, Times, serif" },
  { label: "Times", value: "Times New Roman, Times, serif" },
  { label: "Garamond", value: "Garamond, Baskerville, serif" },
  { label: "Baskerville", value: "Baskerville, Baskerville Old Face, serif" },
  { label: "Didot", value: "Didot, Bodoni 72, serif" },
  { label: "Palatino", value: "Palatino, Palatino Linotype, serif" },
  { label: "Rockwell", value: "Rockwell, Courier Bold, serif" },
  { label: "Impact", value: "Impact, Haettenschweiler, sans-serif" },
  { label: "Condensed", value: "Arial Narrow, Impact, sans-serif" },
  { label: "Copperplate", value: "Copperplate, Copperplate Gothic Light, fantasy" },
  { label: "Marker", value: "Marker Felt, Chalkboard SE, fantasy" },
  { label: "Chalkboard", value: "Chalkboard SE, Comic Sans MS, cursive" },
  { label: "Brush Script", value: "Brush Script MT, cursive" },
  { label: "Comic", value: "Comic Sans MS, Comic Sans, cursive" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, monospace" },
  { label: "Courier", value: "Courier New, Courier, monospace" },
  { label: "Menlo", value: "Menlo, Monaco, Consolas, monospace" },
  { label: "Monaco", value: "Monaco, Consolas, monospace" },
];

const borderStyles = ["solid", "dashed", "dotted", "double"] as const;

type BorderableMediaElement = Extract<
  InteractiveElement,
  { type: "image" | "video" }
>;

// Reuses the standard input styling across all settings controls.
function fieldClass() {
  return "rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white";
}

// Renders background controls and property editors for the selected element.
export default function ElementSettingsPanel({
  selectedElement,
  background,
  onElementChange,
  onBackgroundChange,
  onMediaError,
}: ElementSettingsPanelProps) {
  // Applies a partial settings update to the currently selected element.
  const updateSelected = (patch: Partial<InteractiveElement>) => {
    if (!selectedElement) return;
    onElementChange({ ...selectedElement, ...patch } as InteractiveElement);
  };

  // Stores replacement media and updates the selected image or video element.
  const replaceSelectedMedia = async (file: File) => {
    if (
      !selectedElement ||
      (selectedElement.type !== "image" && selectedElement.type !== "video")
    ) {
      return;
    }

    try {
      const media = await saveMediaFile(file);
      onElementChange({
        ...selectedElement,
        src: media.src,
        storageId: media.id,
        name: media.name,
        ...(selectedElement.type === "image" ? { alt: file.name } : {}),
      } as InteractiveElement);
    } catch {
      onMediaError?.("Could not store this media file in the browser.");
    }
  };

  // Renders shared border controls for image and video elements.
  const renderMediaBorderControls = (element: BorderableMediaElement) => (
    <>
      <label className="flex items-center justify-between gap-3 rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300">
        Border
        <input
          type="checkbox"
          checked={(element.borderWidth ?? 0) > 0}
          onChange={(event) =>
            updateSelected({
              borderWidth: event.target.checked ? element.borderWidth || 4 : 0,
              borderColor: element.borderColor || "#ffffff",
              borderStyle: element.borderStyle || "solid",
            })
          }
          className="h-4 w-4 accent-emerald-500"
        />
      </label>

      {(element.borderWidth ?? 0) > 0 && (
        <>
          <label className="grid gap-2 text-xs font-semibold text-zinc-300">
            Border width
            <input
              type="number"
              min={0}
              max={80}
              value={element.borderWidth ?? 4}
              onChange={(event) =>
                updateSelected({
                  borderWidth: Number(event.target.value),
                })
              }
              className={fieldClass()}
            />
          </label>

          <ColorPicker
            id={`${element.type}-border-color`}
            label="Border color"
            value={element.borderColor || "#ffffff"}
            onChange={(borderColor) => updateSelected({ borderColor })}
          />

          <label className="grid gap-2 text-xs font-semibold text-zinc-300">
            Border style
            <span className="relative">
              <select
                value={element.borderStyle || "solid"}
                onChange={(event) =>
                  updateSelected({
                    borderStyle: event.target
                      .value as (typeof borderStyles)[number],
                  })
                }
                className={`${fieldClass()} w-full appearance-none pr-9`}
              >
                {borderStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </label>
        </>
      )}

      <label className="grid gap-2 text-xs font-semibold text-zinc-300">
        Corner radius
        <input
          type="number"
          min={0}
          max={240}
          value={element.borderRadius ?? 0}
          onChange={(event) =>
            updateSelected({
              borderRadius: Number(event.target.value),
            })
          }
          className={fieldClass()}
        />
      </label>
    </>
  );

  return (
    <aside className="min-h-0 w-full flex-1 overflow-y-auto rounded-lg border border-white/15 bg-zinc-950 p-4 text-white shadow-xl">
      <div className="mb-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">
          Background
        </h2>
        <div className="mt-3 grid gap-3">
          <UploadMedia onChange={onBackgroundChange} onError={onMediaError} />
          <ColorPicker
            id="background-color"
            label="Background color"
            value={background?.color || "#250000"}
            onChange={(color) =>
              onBackgroundChange({
                type: "color",
                color,
              })
            }
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">
          Element
        </h2>

        {!selectedElement && (
          <p className="mt-3 text-sm text-zinc-400">Select an element to edit.</p>
        )}

        {selectedElement && (
          <div className="mt-3 grid gap-3">
            <div className="rounded bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300">
              {selectedElement.type}
            </div>

            {selectedElement.type === "text" && (
              <>
                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Text
                  <textarea
                    value={selectedElement.text}
                    onChange={(event) =>
                      updateSelected({ text: event.target.value })
                    }
                    rows={3}
                    className={`${fieldClass()} resize-none`}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Font size
                  <input
                    type="number"
                    min={8}
                    max={220}
                    value={selectedElement.fontSize ?? 48}
                    onChange={(event) =>
                      updateSelected({ fontSize: Number(event.target.value) })
                    }
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Font family
                  <span className="relative">
                    <select
                      value={selectedElement.fontFamily || fontFamilies[0].value}
                      onChange={(event) =>
                        updateSelected({ fontFamily: event.target.value })
                      }
                      className={`${fieldClass()} w-full appearance-none pr-9`}
                    >
                      {fontFamilies.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Font weight
                  <input
                    type="number"
                    min={100}
                    max={900}
                    step={100}
                    value={selectedElement.fontWeight ?? 700}
                    onChange={(event) =>
                      updateSelected({ fontWeight: Number(event.target.value) })
                    }
                    className={fieldClass()}
                  />
                </label>

                <ColorPicker
                  id="text-color"
                  label="Font color"
                  value={selectedElement.color || "#ffffff"}
                  onChange={(color) => updateSelected({ color })}
                />

                <ColorPicker
                  id="text-bg-color"
                  label="Background color"
                  value={selectedElement.bgColor || "#000000"}
                  onChange={(bgColor) => updateSelected({ bgColor })}
                />

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Background opacity
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={selectedElement.bgOpacity ?? 0}
                    onChange={(event) =>
                      updateSelected({ bgOpacity: Number(event.target.value) })
                    }
                  />
                </label>
              </>
            )}

            {selectedElement.type === "countdown" && (
              <>
                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Countdown seconds
                  <input
                    type="number"
                    min={0}
                    value={selectedElement.seconds}
                    onChange={(event) =>
                      updateSelected({ seconds: Number(event.target.value) })
                    }
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Size
                  <input
                    type="number"
                    min={40}
                    max={360}
                    value={selectedElement.size ?? 112}
                    onChange={(event) =>
                      updateSelected({ size: Number(event.target.value) })
                    }
                    className={fieldClass()}
                  />
                </label>

                <ColorPicker
                  id="countdown-text-color"
                  label="Text color"
                  value={selectedElement.color || "#ffffff"}
                  onChange={(color) => updateSelected({ color })}
                />

                <ColorPicker
                  id="countdown-bg-color"
                  label="Background color"
                  value={selectedElement.bgColor || "#000000"}
                  onChange={(bgColor) => updateSelected({ bgColor })}
                />

                <ColorPicker
                  id="countdown-border-color"
                  label="Border color"
                  value={selectedElement.borderColor || "#ffffff"}
                  onChange={(borderColor) => updateSelected({ borderColor })}
                />
              </>
            )}

            {selectedElement.type === "image" && (
              <>
                <label
                  htmlFor="replace-image"
                  className="inline-flex cursor-pointer items-center justify-center rounded bg-zinc-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
                >
                  Replace image
                  <input
                    id="replace-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void replaceSelectedMedia(file);
                      event.target.value = "";
                    }}
                  />
                </label>

                {renderMediaBorderControls(selectedElement)}

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Alt text
                  <input
                    value={selectedElement.alt || ""}
                    onChange={(event) => updateSelected({ alt: event.target.value })}
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Width
                  <input
                    type="number"
                    min={20}
                    value={Number(selectedElement.width ?? 360)}
                    onChange={(event) =>
                      updateSelected({ width: Number(event.target.value) })
                    }
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Height
                  <input
                    type="number"
                    min={20}
                    value={Number(selectedElement.height ?? "")}
                    onChange={(event) =>
                      updateSelected({
                        height: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      })
                    }
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Opacity
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={selectedElement.opacity ?? 1}
                    onChange={(event) =>
                      updateSelected({ opacity: Number(event.target.value) })
                    }
                  />
                </label>
              </>
            )}

            {selectedElement.type === "video" && (
              <>
                <label
                  htmlFor="replace-video"
                  className="inline-flex cursor-pointer items-center justify-center rounded bg-zinc-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
                >
                  Replace video
                  <input
                    id="replace-video"
                    type="file"
                    accept="video/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void replaceSelectedMedia(file);
                      event.target.value = "";
                    }}
                  />
                </label>

                {renderMediaBorderControls(selectedElement)}

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Width
                  <input
                    type="number"
                    min={20}
                    value={Number(selectedElement.width ?? 420)}
                    onChange={(event) =>
                      updateSelected({ width: Number(event.target.value) })
                    }
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Height
                  <input
                    type="number"
                    min={20}
                    value={Number(selectedElement.height ?? 240)}
                    onChange={(event) =>
                      updateSelected({ height: Number(event.target.value) })
                    }
                    className={fieldClass()}
                  />
                </label>
              </>
            )}

            {selectedElement.type === "button" && (
              <>
                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Label
                  <input
                    value={selectedElement.label}
                    onChange={(event) =>
                      updateSelected({ label: event.target.value })
                    }
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Link
                  <input
                    value={selectedElement.href || ""}
                    onChange={(event) => updateSelected({ href: event.target.value })}
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Font size
                  <input
                    type="number"
                    min={8}
                    max={120}
                    value={selectedElement.fontSize ?? 28}
                    onChange={(event) =>
                      updateSelected({ fontSize: Number(event.target.value) })
                    }
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Width
                  <input
                    type="number"
                    min={40}
                    value={Number(selectedElement.width ?? 240)}
                    onChange={(event) =>
                      updateSelected({ width: Number(event.target.value) })
                    }
                    className={fieldClass()}
                  />
                </label>

                <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                  Corner radius
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={selectedElement.borderRadius ?? 16}
                    onChange={(event) =>
                      updateSelected({
                        borderRadius: Number(event.target.value),
                      })
                    }
                    className={fieldClass()}
                  />
                </label>

                <ColorPicker
                  id="button-text-color"
                  label="Text color"
                  value={selectedElement.color || "#ffffff"}
                  onChange={(color) => updateSelected({ color })}
                />

                <ColorPicker
                  id="button-bg-color"
                  label="Background color"
                  value={selectedElement.bgColor || "#7c3aed"}
                  onChange={(bgColor) => updateSelected({ bgColor })}
                />
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                X
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(selectedElement.x ?? 50)}
                  onChange={(event) =>
                    updateSelected({ x: Number(event.target.value) })
                  }
                  className={fieldClass()}
                />
              </label>
              <label className="grid gap-2 text-xs font-semibold text-zinc-300">
                Y
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(selectedElement.y ?? 50)}
                  onChange={(event) =>
                    updateSelected({ y: Number(event.target.value) })
                  }
                  className={fieldClass()}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
