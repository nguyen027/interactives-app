const DB_NAME = "interactives-media";
const DB_VERSION = 1;
const STORE_NAME = "media";

type StoredMedia = {
  id: string;
  blob: Blob;
  name: string;
  type: string;
  createdAt: number;
};

// Opens the browser IndexedDB database used for large uploaded media files.
function openMediaDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Creates a unique, readable storage id for an uploaded file.
function createMediaId(file: File) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `media-${random}-${file.name}`;
}

// Persists an uploaded media file and returns the temporary object URL for display.
export async function saveMediaFile(file: File) {
  const db = await openMediaDb();
  const id = createMediaId(file);
  const media: StoredMedia = {
    id,
    blob: file,
    name: file.name,
    type: file.type,
    createdAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put(media);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  db.close();

  return {
    id,
    src: URL.createObjectURL(file),
    name: file.name,
    type: file.type,
  };
}

// Loads a stored media blob by id and converts it back into a browser object URL.
export async function getMediaObjectUrl(id: string) {
  const db = await openMediaDb();

  const media = await new Promise<StoredMedia | undefined>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as StoredMedia | undefined);
    request.onerror = () => reject(request.error);
  });

  db.close();

  if (!media) return undefined;

  return URL.createObjectURL(media.blob);
}
