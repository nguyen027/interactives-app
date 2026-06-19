import type { PageKey } from "../config/pages";
import type { InteractivePageConfig } from "../types/page";
import {
  clonePage,
  getDefaultPageConfig,
  loadPageConfig,
  normalizePageConfig,
  preparePageForStorage,
} from "./pageConfig";

const INSTANCE_INDEX_KEY = "interactives.instances.index";
const INSTANCE_PREFIX = "interactives.instance.";

export type InstanceSummary = {
  id: string;
  pageKey: PageKey;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type InteractiveInstance = InstanceSummary & {
  config: InteractivePageConfig;
};

function createInstanceId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(16).slice(2, 10);

  return `${slug || "instance"}-${random}`;
}

function getInstanceKey(pageKey: PageKey, id: string) {
  return `${INSTANCE_PREFIX}${pageKey}.${id}`;
}

function isInstanceSummary(value: unknown): value is InstanceSummary {
  if (!value || typeof value !== "object") return false;

  const candidate = value as InstanceSummary;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.pageKey === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number"
  );
}

function readIndex() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(INSTANCE_INDEX_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isInstanceSummary);
  } catch {
    return [];
  }
}

function writeIndex(index: InstanceSummary[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(INSTANCE_INDEX_KEY, JSON.stringify(index));
}

function upsertSummary(summary: InstanceSummary) {
  const index = readIndex();
  const next = [
    summary,
    ...index.filter(
      (item) => item.pageKey !== summary.pageKey || item.id !== summary.id,
    ),
  ];

  writeIndex(next);
}

function isInteractiveInstance(value: unknown): value is InteractiveInstance {
  if (!isInstanceSummary(value)) return false;

  const candidate = value as InteractiveInstance;

  return Boolean(candidate.config && typeof candidate.config === "object");
}

export function listInstances(pageKey: PageKey) {
  return readIndex()
    .filter((instance) => instance.pageKey === pageKey)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function loadInstance(pageKey: PageKey, id: string) {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(getInstanceKey(pageKey, id));
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as unknown;
    if (!isInteractiveInstance(parsed)) return undefined;

    const fallback = getDefaultPageConfig(pageKey);

    return {
      ...parsed,
      config: normalizePageConfig({
        ...fallback,
        ...parsed.config,
        elements:
          parsed.config.elements !== undefined
            ? parsed.config.elements
            : fallback.elements,
        background: parsed.config.background || fallback.background,
      }),
    };
  } catch {
    return undefined;
  }
}

export function loadInstancePageConfig(pageKey: PageKey, id?: string) {
  if (!id) return loadPageConfig(pageKey);

  return loadInstance(pageKey, id)?.config || loadPageConfig(pageKey);
}

export function saveInstance(
  pageKey: PageKey,
  id: string,
  name: string,
  config: InteractivePageConfig,
) {
  if (typeof window === "undefined") return;

  const existing = loadInstance(pageKey, id);
  const now = Date.now();
  const summary: InstanceSummary = {
    id,
    pageKey,
    name,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const instance: InteractiveInstance = {
    ...summary,
    config: preparePageForStorage(config),
  };

  window.localStorage.setItem(
    getInstanceKey(pageKey, id),
    JSON.stringify(instance),
  );
  upsertSummary(summary);
}

export function createInstance(
  pageKey: PageKey,
  name: string,
  baseConfig: InteractivePageConfig = loadPageConfig(pageKey),
) {
  const id = createInstanceId(name);
  const config = clonePage(baseConfig);

  saveInstance(pageKey, id, name, config);

  return loadInstance(pageKey, id);
}

export function duplicateInstance(
  pageKey: PageKey,
  sourceId: string | undefined,
  name: string,
  sourceConfig: InteractivePageConfig = loadPageConfig(pageKey),
) {
  const source = sourceId ? loadInstance(pageKey, sourceId) : undefined;
  const config = clonePage(source?.config || sourceConfig);

  return createInstance(pageKey, name, config);
}

export function renameInstance(pageKey: PageKey, id: string, name: string) {
  const instance = loadInstance(pageKey, id);
  if (!instance) return;

  saveInstance(pageKey, id, name, instance.config);
}

export function deleteInstance(pageKey: PageKey, id: string) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(getInstanceKey(pageKey, id));
  writeIndex(
    readIndex().filter(
      (instance) => instance.pageKey !== pageKey || instance.id !== id,
    ),
  );
}
