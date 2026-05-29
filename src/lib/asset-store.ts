import { useSyncExternalStore } from "react";
import { ASSETS, type Asset, type Severity, type AssetType } from "./mock-data";

let assets: Asset[] = [...ASSETS];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const assetStore = {
  getAll: () => assets,
  add: (rows: Array<{ asset: string; type?: string; ip?: string }>) => {
    const existing = new Set(assets.map((a) => a.asset.toLowerCase()));
    let added = 0;
    const ts = Date.now();
    const next = [...assets];
    rows.forEach((r, idx) => {
      const name = (r.asset || "").trim();
      if (!name) return;
      if (existing.has(name.toLowerCase())) return;
      existing.add(name.toLowerCase());
      const t = (r.type || "").toLowerCase();
      const type: AssetType =
        t === "domain" ? "domain" : t === "ip" ? "ip" : "subdomain";
      next.push({
        id: `u${ts}_${idx}`,
        asset: name,
        type,
        ip: (r.ip || "").trim() || "—",
        openIssues: 0,
        worstSeverity: "info" as Severity,
        status: "scanning",
        lastScan: "queued",
      });
      added++;
    });
    assets = next;
    emit();
    return added;
  },
  remove: (ids: string[]) => {
    const set = new Set(ids);
    assets = assets.filter((a) => !set.has(a.id));
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useAssets(): Asset[] {
  return useSyncExternalStore(assetStore.subscribe, assetStore.getAll, assetStore.getAll);
}
