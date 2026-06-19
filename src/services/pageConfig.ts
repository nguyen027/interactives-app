import { pages, type PageKey } from "../config/pages";
import type { InteractiveElement, InteractivePageConfig } from "../types/page";
import { getMediaObjectUrl } from "./mediaStorage";

const STORAGE_PREFIX = "interactives.page.";

// Deep-clones page config so editor changes never mutate the static defaults.
function clonePage(page: InteractivePageConfig): InteractivePageConfig {
  return JSON.parse(JSON.stringify(page)) as InteractivePageConfig;
}

// Builds the localStorage key for one editable page.
function getStorageKey(slug: string) {
  return `${STORAGE_PREFIX}${slug}`;
}

// Removes temporary blob URLs before saving because IndexedDB owns the real media.
function preparePageForStorage(page: InteractivePageConfig): InteractivePageConfig {
  const copy = clonePage(page);

  if (copy.background?.storageId && copy.background.src?.startsWith("blob:")) {
    delete copy.background.src;
  }

  copy.elements = copy.elements?.map((element) => {
    if (
      (element.type === "image" || element.type === "video") &&
      element.storageId &&
      element.src?.startsWith("blob:")
    ) {
      const storedElement = { ...element };
      delete storedElement.src;
      return storedElement;
    }

    return element;
  }) as InteractiveElement[] | undefined;

  return copy;
}

// Converts older image/video/color fields into the current background shape.
function normalizePageConfig(page: InteractivePageConfig): InteractivePageConfig {
  if (page.background) return page;

  if (page.backgroundVideo || page.video) {
    return {
      ...page,
      background: {
        type: "video",
        src: page.backgroundVideo || page.video,
        color: page.bgColor,
      },
    };
  }

  if (page.backgroundImage || page.image) {
    return {
      ...page,
      background: {
        type: "image",
        src: page.backgroundImage || page.image,
        color: page.bgColor,
      },
    };
  }

  return {
    ...page,
    background: {
      type: "color",
      color: page.bgColor || "#18181b",
    },
  };
}

// Validates parsed localStorage data before using it as a page config.
function isPageConfig(value: unknown): value is InteractivePageConfig {
  if (!value || typeof value !== "object") return false;

  const candidate = value as InteractivePageConfig;

  return (
    typeof candidate.type === "string" &&
    typeof candidate.title === "string" &&
    (!candidate.elements || Array.isArray(candidate.elements))
  );
}

// Returns a fresh editable default config for a known page key.
export function getDefaultPageConfig(key: PageKey): InteractivePageConfig {
  return normalizePageConfig(clonePage(pages[key]));
}

// Loads saved editor state, falling back to the bundled page config when needed.
export function loadPageConfig(key: PageKey): InteractivePageConfig {
  const fallback = getDefaultPageConfig(key);
  const slug = fallback.slug || key;

  if (typeof window === "undefined") return fallback;

  try {
    const saved = window.localStorage.getItem(getStorageKey(slug));
    if (!saved) return fallback;

    const parsed = JSON.parse(saved) as unknown;
    if (!isPageConfig(parsed)) return fallback;

    return normalizePageConfig({
      ...fallback,
      ...parsed,
      elements: parsed.elements || fallback.elements,
      background: parsed.background || fallback.background,
    });
  } catch {
    return fallback;
  }
}

// Saves the editable page config in localStorage.
export function savePageConfig(page: InteractivePageConfig) {
  if (typeof window === "undefined") return;

  const slug = page.slug || page.type;
  window.localStorage.setItem(
    getStorageKey(slug),
    JSON.stringify(preparePageForStorage(page)),
  );
}

// Replaces stored media ids with live object URLs so saved pages can render.
export async function hydratePageConfigMedia(page: InteractivePageConfig) {
  if (typeof window === "undefined") return page;

  try {
    const backgroundStorageId = page.background?.storageId;
    const backgroundSrc = backgroundStorageId
      ? await getMediaObjectUrl(backgroundStorageId)
      : undefined;
    const elements = await Promise.all(
      (page.elements || []).map(async (element) => {
        if (
          (element.type === "image" || element.type === "video") &&
          element.storageId
        ) {
          const src = await getMediaObjectUrl(element.storageId);
          return src ? { ...element, src } : element;
        }

        return element;
      }),
    );

    return {
      ...page,
      background:
        page.background && backgroundSrc
          ? {
              ...page.background,
              src: backgroundSrc,
            }
          : page.background,
      elements,
    };
  } catch {
    return page;
  }
}

// Clears saved editor state for one page and restores the default on next load.
export function resetPageConfig(key: PageKey) {
  if (typeof window === "undefined") return;

  const page = getDefaultPageConfig(key);
  window.localStorage.removeItem(getStorageKey(page.slug || key));
}
