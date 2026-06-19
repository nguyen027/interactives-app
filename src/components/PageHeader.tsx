type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

// Renders the title and optional subtitle for legacy page layouts.
export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h2 className="text-4xl font-bold text-white">{title}</h2>
      {subtitle && <p className="mt-2 text-zinc-300">{subtitle}</p>}
    </header>
  );
}
