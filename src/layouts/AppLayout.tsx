import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

// Wraps preview routes with the sidebar and main preview frame.
export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-900 text-white">
      <Sidebar />

      <main className="flex-1 overflow-hidden p-6">
        <div className="h-full w-full rounded-3xl bg-zinc-800 border border-zinc-700 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
