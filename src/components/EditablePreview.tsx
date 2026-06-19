import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import EditableCanvas from "./EditableCanvas";
import EditorToolbar, { type AddElementType } from "./EditorToolbar";
import EditorViewport from "./EditorViewport";
import ElementSettingsPanel from "./ElementSettingsPanel";
import InteractiveRenderer from "./InteractiveRenderer";
import type { PageKey } from "../config/pages";
import { saveMediaFile } from "../services/mediaStorage";
import {
  createInstance,
  deleteInstance,
  duplicateInstance,
  listInstances,
  loadInstancePageConfig,
  renameInstance,
  saveInstance,
} from "../services/instanceConfig";
import {
  hydratePageConfigMedia,
  getDefaultPageConfig,
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

function getPreviewPath(pageKey: PageKey, instanceId?: string) {
  const base = {
    challenge: "/preview/challenge",
    trivia: "/preview/trivia",
    orderConfirmation: "/preview/order_confirmation",
    propBet: "/preview/prop_bet",
  }[pageKey];

  return instanceId ? `${base}/${instanceId}` : base;
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
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const routeInstanceId = params.instanceId;
  const activeInstanceId = routeInstanceId || searchParams.get("instance") || undefined;
  const [page, setPage] = useState<InteractivePageConfig>(() =>
    loadInstancePageConfig(pageKey, activeInstanceId),
  );
  const [instancesVersion, setInstancesVersion] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [statusMessage, setStatusMessage] = useState<string>();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const instanceNameRef = useRef<HTMLInputElement>(null);
  const pendingMediaTypeRef = useRef<"image" | "video" | undefined>(undefined);
  const instances = useMemo(() => {
    void instancesVersion;
    return listInstances(pageKey);
  }, [instancesVersion, pageKey]);
  const activeInstance = useMemo(
    () => instances.find((instance) => instance.id === activeInstanceId),
    [activeInstanceId, instances],
  );

  const refreshInstances = useCallback(() => {
    setInstancesVersion((version) => version + 1);
  }, []);

  // Hydrates saved media object URLs after the first client render.
  useEffect(() => {
    let active = true;
    const sourcePage = loadInstancePageConfig(pageKey, activeInstanceId);

    hydratePageConfigMedia(sourcePage).then((hydratedPage) => {
      if (active) setPage(hydratedPage);
    });

    return () => {
      active = false;
    };
  }, [activeInstanceId, pageKey]);

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

  const getDraftInstanceName = (fallback: string) =>
    instanceNameRef.current?.value.trim() || fallback;

  const createNewInstance = () => {
    const name = getDraftInstanceName("New instance");
    const emptyConfig = {
      ...getDefaultPageConfig(pageKey),
      elements: [],
    };

    const instance = createInstance(pageKey, name, emptyConfig);
    refreshInstances();
    if (instance) {
      setStatusMessage(`Created instance "${instance.name}".`);
      navigate(getPreviewPath(pageKey, instance.id));
    }
  };

  const duplicateCurrentInstance = () => {
    const name = getDraftInstanceName(`${activeInstance?.name || "Default"} copy`);

    const instance = duplicateInstance(
      pageKey,
      activeInstanceId,
      name,
      page,
    );
    refreshInstances();
    if (instance) {
      setStatusMessage(`Duplicated instance "${instance.name}".`);
      navigate(getPreviewPath(pageKey, instance.id));
    }
  };

  const renameCurrentInstance = () => {
    if (!activeInstanceId) return;

    const name = getDraftInstanceName(activeInstance?.name || activeInstanceId);

    renameInstance(pageKey, activeInstanceId, name);
    refreshInstances();
    setStatusMessage(`Renamed instance "${name}".`);
  };

  const deleteCurrentInstance = () => {
    if (!activeInstanceId) return;

    const confirmed = window.confirm(
      `Delete "${activeInstance?.name || activeInstanceId}"?`,
    );
    if (!confirmed) return;

    deleteInstance(pageKey, activeInstanceId);
    refreshInstances();
    navigate(getPreviewPath(pageKey));
  };

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
      if (activeInstanceId) {
        saveInstance(
          pageKey,
          activeInstanceId,
          activeInstance?.name || activeInstanceId,
          page,
        );
        refreshInstances();
      } else {
        savePageConfig(page);
      }
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
          <div className="rounded-lg border border-white/15 bg-zinc-950 p-3 text-white shadow-xl">
            <label className="grid gap-2 text-xs font-semibold text-zinc-300">
              Instance
              <select
                value={activeInstanceId || ""}
                onChange={(event) =>
                  navigate(getPreviewPath(pageKey, event.target.value || undefined))
                }
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                <option value="">Default</option>
                {instances.map((instance) => (
                  <option key={instance.id} value={instance.id}>
                    {instance.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 grid gap-2 text-xs font-semibold text-zinc-300">
              Name
              <input
                key={activeInstanceId || "default-instance-name"}
                ref={instanceNameRef}
                defaultValue={activeInstance?.name || ""}
                placeholder={
                  activeInstanceId
                    ? "Instance name"
                    : "Name for new or duplicate instance"
                }
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={createNewInstance}
                className="rounded bg-zinc-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-700"
              >
                New
              </button>
              <button
                type="button"
                onClick={duplicateCurrentInstance}
                className="rounded bg-zinc-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-700"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={renameCurrentInstance}
                disabled={!activeInstanceId}
                className="rounded bg-zinc-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={deleteCurrentInstance}
                disabled={!activeInstanceId}
                className="rounded bg-red-950 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>

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
