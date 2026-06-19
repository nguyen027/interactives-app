type ColorPickerProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

// Shows a synced color swatch and text input for exact color editing.
export default function ColorPicker({
  id,
  label,
  value,
  onChange,
}: ColorPickerProps) {
  return (
    <label htmlFor={id} className="grid gap-2 text-xs font-semibold text-zinc-300">
      {label}
      <span className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-11 cursor-pointer rounded border border-zinc-700 bg-zinc-900"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
      </span>
    </label>
  );
}
