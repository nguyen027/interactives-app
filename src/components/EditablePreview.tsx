import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditableCanvas from "./EditableCanvas";
import EditorToolbar, { type AddElementType } from "./EditorToolbar";
import EditorViewport from "./EditorViewport";
import ElementSettingsPanel from "./ElementSettingsPanel";
import InteractiveRenderer from "./InteractiveRenderer";
import type { PageKey } from "../config/pages";
import { saveMediaFile } from "../services/mediaStorage";
import {
  hydratePageConfigMedia,
  loadPageConfig,
  savePageConfig,
} from "../services/pageConfig";
import type {
  ImageElement,
  InteractiveElement,
  InteractivePageConfig,
  VideoElement,
} from "../types/page";

type EditablePreviewProps = {
  pageKey: PageKey;
};

// Detects fields where Delete/Backspace should edit text instead of deleting elements.
function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest("input, textarea, select") || target.isContentEditable,
  );
}

// Creates a default text element when the editor adds text.
function createTextElement(): InteractiveElement {
  return {
    id: `text-${Date.now()}`,
    type: "text",
    text: "New text",
    x: 50,
    y: 50,
    align: "center",
    fontSize: 48,
    color: "#ffffff",
    fontFamily: "system-ui, sans-serif",
    fontWeight: 700,
    bgOpacity: 0,
  };
}

// Creates a default countdown element when the editor adds a timer.
function createCountdownElement(): InteractiveElement {
  return {
    id: `countdown-${Date.now()}`,
    type: "countdown",
    seconds: 225,
    size: 112,
    x: 50,
    y: 50,
  };
}

// Creates a default link-style button element.
function createButtonElement(): InteractiveElement {
  return {
    id: `button-${Date.now()}`,
    type: "button",
    label: "Button",
    href: "#",
    x: 50,
    y: 50,
    width: 240,
    fontSize: 28,
    color: "#ffffff",
    bgColor: "#7c3aed",
  };
}

// Creates an image element backed by browser media storage.
function createImageElement(file: File, media: Awaited<ReturnType<typeof saveMediaFile>>): ImageElement {
  return {
    id: `image-${Date.now()}`,
    type: "image",
    src: media.src,
    storageId: media.id,
    name: media.name,
    alt: file.name,
    x: 50,
    y: 50,
    width: 360,
    opacity: 1,
  };
}

// Creates a video element backed by browser media storage.
function createVideoElement(
  media: Awaited<ReturnType<typeof saveMediaFile>>,
): VideoElement {
  return {
    id: `video-${Date.now()}`,
    type: "video",
    src: media.src,
    storageId: media.id,
    name: media.name,
    x: 50,
    y: 50,
    width: 420,
    height: 240,
  };
}

// Provides the preview page plus the in-browser editor for configurable pages.
export default function EditablePreview({ pageKey }: EditablePreviewProps) {
  const [page, setPage] = useState<InteractivePageConfig>(() =>
    loadPageConfig(pageKey),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [statusMessage, setStatusMessage] = useState<string>();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const pendingMediaTypeRef = useRef<"image" | "video" | undefined>(undefined);

  // Hydrates saved media object URLs after the first client render.
  useEffect(() => {
    let active = true;

    hydratePageConfigMedia(loadPageConfig(pageKey)).then((hydratedPage) => {
      if (active) setPage(hydratedPage);
    });

    return () => {
      active = false;
    };
  }, [pageKey]);

  const selectedElement = useMemo(
    () => page.elements?.find((element) => element.id === selectedId),
    [page.elements, selectedId],
  );

  // Replaces one existing element with an updated version.
  const updateElement = (updatedElement: InteractiveElement) => {
    setPage((current) => ({
      ...current,
      elements: (current.elements || []).map((element) =>
        element.id === updatedElement.id ? updatedElement : element,
      ),
    }));
  };

  // Adds a new element to the page and selects it for immediate editing.
  const addElement = (element: InteractiveElement) => {
    setPage((current) => ({
      ...current,
      elements: [...(current.elements || []), element],
    }));
    setSelectedId(element.id);
  };

  // Dispatches toolbar add actions to either element factories or file upload.
  const addElementByType = (type: AddElementType) => {
    setStatusMessage(undefined);

    if (type === "text") {
      addElement(createTextElement());
      return;
    }

    if (type === "countdown") {
      addElement(createCountdownElement());
      return;
    }

    if (type === "button") {
      addElement(createButtonElement());
      return;
    }

    pendingMediaTypeRef.current = type;
    mediaInputRef.current?.click();
  };

  // Stores uploaded media and inserts it as an image or video element.
  const addMediaElement = async (file: File) => {
    const mediaType = pendingMediaTypeRef.current;
    if (!mediaType) return;

    try {
      const media = await saveMediaFile(file);
      const element =
        mediaType === "image"
          ? createImageElement(file, media)
          : createVideoElement(media);

      addElement(element);
      setStatusMessage(undefined);
    } catch {
      setStatusMessage("Could not store this media file in the browser.");
    } finally {
      pendingMediaTypeRef.current = undefined;
    }
  };

  // Removes the currently selected element from the page.
  const removeSelected = useCallback(() => {
    if (!selectedId) return;

    setPage((current) => ({
      ...current,
      elements: (current.elements || []).filter(
        (element) => element.id !== selectedId,
      ),
    }));
    setSelectedId(undefined);
  }, [selectedId]);

  // Removes the selected element with Delete/Backspace while editing.
  useEffect(() => {
    if (!isEditing || !selectedId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (isTypingTarget(event.target)) return;

      event.preventDefault();
      removeSelected();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, removeSelected, selectedId]);

  // Saves the current page config and exits edit mode.
  const save = () => {
    try {
      savePageConfig(page);
      setStatusMessage(undefined);
      setIsEditing(false);
    } catch {
      setStatusMessage(
        "Save failed. The browser could not store this page config.",
      );
    }
  };

  if (isEditing) {
    return (
      <div className="flex h-full w-full gap-4 bg-zinc-900 p-4">
        <EditorViewport>
          <EditableCanvas
            page={page}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={setPage}
          />
        </EditorViewport>

        <section className="flex w-[360px] shrink-0 flex-col gap-4">
          <EditorToolbar
            isEditing={isEditing}
            placement="rail"
            hasSelection={Boolean(selectedElement)}
            onToggleEdit={() => setIsEditing(false)}
            onAddElement={addElementByType}
            onRemoveSelected={removeSelected}
            onSave={save}
          />
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void addMediaElement(file);
              event.target.value = "";
            }}
          />

          <ElementSettingsPanel
            selectedElement={selectedElement}
            background={page.background}
            onElementChange={updateElement}
            onBackgroundChange={(background) =>
              setPage((current) => {
                setStatusMessage(undefined);
                return { ...current, background };
              })
            }
            onMediaError={setStatusMessage}
          />

          {statusMessage && (
            <div className="rounded-lg border border-red-400/30 bg-red-950/50 px-3 py-2 text-sm font-semibold text-red-100">
              {statusMessage}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <InteractiveRenderer page={page} mode="preview" />

      <EditorToolbar
        isEditing={false}
        hasSelection={Boolean(selectedElement)}
        onToggleEdit={() => setIsEditing(true)}
        onAddElement={addElementByType}
        onRemoveSelected={removeSelected}
        onSave={save}
      />
    </div>
  );
}
