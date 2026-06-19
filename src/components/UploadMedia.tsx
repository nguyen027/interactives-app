import type { PageBackground } from "../types/page";
import { saveMediaFile } from "../services/mediaStorage";

type UploadMediaProps = {
  onChange: (background: PageBackground) => void;
  onError?: (message: string) => void;
};

// Uploads a background image or video and reports the saved background config.
export default function UploadMedia({ onChange, onError }: UploadMediaProps) {
  return (
    <label
      htmlFor="background-upload"
      className="inline-flex cursor-pointer items-center justify-center rounded bg-zinc-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
    >
      Upload media
      <input
        id="background-upload"
        type="file"
        accept="image/*,video/*"
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;

          try {
            const media = await saveMediaFile(file);
            onChange({
              type: file.type.startsWith("video/") ? "video" : "image",
              src: media.src,
              storageId: media.id,
              name: media.name,
            });
          } catch {
            onError?.("Could not store this media file in the browser.");
          }

          event.target.value = "";
        }}
      />
    </label>
  );
}
