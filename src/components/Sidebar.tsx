import { NavLink } from "react-router-dom";
import { previewNavItems } from "../config/pages";

// Renders the preview navigation for every configured page.
export default function Sidebar() {
  return (
    <aside className="h-screen w-72 shrink-0 bg-zinc-950 border-r border-zinc-800 p-5">
      <div className="mb-8 flex items-center gap-3">
        <img
          src="/favicon.svg"
          alt=""
          className="h-10 w-10 shrink-0"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold text-white">Interactives</h1>
      </div>

      <nav className="space-y-2">
        {previewNavItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === "/preview"}
            className={({ isActive }) =>
              [
                "block rounded-xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
