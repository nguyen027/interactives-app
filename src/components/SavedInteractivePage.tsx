import { useEffect, useState } from "react";
import InteractiveRenderer from "./InteractiveRenderer";
import type { PageKey } from "../config/pages";
import {
  hydratePageConfigMedia,
  loadPageConfig,
} from "../services/pageConfig";
import type { InteractivePageConfig } from "../types/page";

type SavedInteractivePageProps = {
  pageKey: PageKey;
  mode?: "public" | "preview";
};

// Loads saved page edits and renders the hydrated public interactive page.
export default function SavedInteractivePage({
  pageKey,
  mode = "public",
}: SavedInteractivePageProps) {
  const [page, setPage] = useState<InteractivePageConfig>(() =>
    loadPageConfig(pageKey),
  );

  // Rebuilds object URLs for any media saved in browser storage.
  useEffect(() => {
    let active = true;

    hydratePageConfigMedia(loadPageConfig(pageKey)).then((hydratedPage) => {
      if (active) setPage(hydratedPage);
    });

    return () => {
      active = false;
    };
  }, [pageKey]);

  return <InteractiveRenderer page={page} mode={mode} />;
}
