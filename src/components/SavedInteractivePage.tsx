import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import InteractiveRenderer from "./InteractiveRenderer";
import type { PageKey } from "../config/pages";
import { loadInstancePageConfig } from "../services/instanceConfig";
import {
  hydratePageConfigMedia,
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
  const params = useParams();
  const [searchParams] = useSearchParams();
  const instanceId = params.instanceId || searchParams.get("instance") || undefined;
  const [page, setPage] = useState<InteractivePageConfig>(() =>
    loadInstancePageConfig(pageKey, instanceId),
  );

  // Rebuilds object URLs for any media saved in browser storage.
  useEffect(() => {
    let active = true;
    const sourcePage = loadInstancePageConfig(pageKey, instanceId);

    hydratePageConfigMedia(sourcePage).then((hydratedPage) => {
      if (active) setPage(hydratedPage);
    });

    return () => {
      active = false;
    };
  }, [instanceId, pageKey]);

  return <InteractiveRenderer page={page} mode={mode} />;
}
