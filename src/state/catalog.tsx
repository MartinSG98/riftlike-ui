import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { api } from "../api/client";
import type { Catalog, TeamInfo } from "../api/types";
import { OfflineScreen } from "../components/OfflineScreen";

const CatalogContext = createContext<Catalog | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    api
      .catalog()
      .then(setCatalog)
      .catch(() => setFailed(true));
  }, []);

  useEffect(load, [load]);

  if (failed) return <OfflineScreen onRetry={load} />;
  if (!catalog) return null;
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("useCatalog outside CatalogProvider");
  return catalog;
}

export function useTeam(code: string): TeamInfo {
  const team = useCatalog().teams.find((t) => t.code === code);
  if (!team) throw new Error(`unknown team ${code}`);
  return team;
}
