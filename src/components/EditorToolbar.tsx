export type AddElementType = "text" | "countdown" | "image" | "video" | "button";

type EditorToolbarProps = {
  isEditing: boolean;
  hasSelection: boolean;
  placement?: "overlay" | "rail";
  onToggleEdit: () => void;
  onAddElement: (type: AddElementType) => void;
  onRemoveSelected: () => void;
  onSave: () => void;
};

const addElementOptions: Array<{ label: string; type: AddElementType }> = [
  { label: "Text", type: "text" },
  { label: "Countdown", type: "countdown" },
  { label: "Image", type: "image" },
  { label: "Video", type: "video" },
  { label: "Button", type: "button" },
];

// Renders edit controls for entering edit mode, adding elements, deleting, and saving.
export default function EditorToolbar({
  isEditing,
  hasSelection,
  placement = "overlay",
  onToggleEdit,
  onAddElement,
  onRemoveSelected,
  onSave,
}: EditorToolbarProps) {
  const isFloatingEditButton = placement === "overlay" && !isEditing;
  const wrapperClass =
    isFloatingEditButton
      ? "absolute right-5 top-5 z-40"
      : placement === "overlay"
      ? "absolute right-4 top-4 z-40 flex items-center gap-2 rounded-lg border border-white/15 bg-zinc-950/85 p-2 shadow-xl backdrop-blur"
      : "flex w-full items-center gap-2 rounded-lg border border-white/15 bg-zinc-950 p-2 shadow-xl";
  const editButtonClass = isFloatingEditButton
    ? "group relative inline-flex h-9 min-w-28 items-center rounded-[1rem] border-2 border-white bg-black px-3.5 pr-12 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-black/35 transition hover:-translate-y-0.5 hover:bg-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    : "flex h-9 min-w-9 items-center justify-center rounded bg-white px-3 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200";

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        onClick={onToggleEdit}
        title={isEditing ? "Exit edit mode" : "Edit page"}
        className={editButtonClass}
        aria-label={isEditing ? "Exit edit mode" : "Edit page"}
      >
        {isEditing ? (
          "Done"
        ) : (
          <>
            {isFloatingEditButton && (
              <span
                aria-hidden="true"
                className="absolute inset-0.5 rounded-[0.75rem] border-2 border-white/90"
              />
            )}
            {isFloatingEditButton && <span className="relative z-10">Edit</span>}
            <span
              aria-hidden="true"
              className={
                isFloatingEditButton
                  ? "absolute -right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-black transition group-hover:bg-zinc-950"
                  : ""
              }
            >
              <svg
                viewBox="0 0 24 24"
                className={isFloatingEditButton ? "h-5 w-5" : "h-4 w-4"}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isFloatingEditButton ? "2.4" : "2.25"}
              >
                <path d="m15.2 4.8 4 4" />
                <path d="M5.6 18.4 4 20l1.6-5.6L15.4 4.6a2.1 2.1 0 0 1 3 0l1 1a2.1 2.1 0 0 1 0 3l-9.8 9.8Z" />
                <path d="m13.4 6.6 4 4" />
              </svg>
            </span>
          </>
        )}
      </button>

      {isEditing && (
        <>
          <label
            htmlFor="add-element"
            className="sr-only"
          >
            Add element
          </label>
          <div className="relative">
            <select
              id="add-element"
              value=""
              onChange={(event) => {
                const value = event.target.value as AddElementType;
                if (value) onAddElement(value);
                event.target.value = "";
              }}
              className="h-9 w-24 appearance-none rounded bg-zinc-800 py-0 pl-3 pr-8 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              <option value="" disabled>
                Add
              </option>
              {addElementOptions.map((option) => (
                <option key={option.type} value={option.type}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <button
            type="button"
            onClick={onRemoveSelected}
            disabled={!hasSelection}
            className="h-9 rounded bg-zinc-800 px-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={onSave}
            className="h-9 rounded bg-emerald-500 px-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}
