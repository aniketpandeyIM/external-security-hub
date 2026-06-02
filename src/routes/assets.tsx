import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ISSUES, type Asset } from "@/lib/mock-data";
import { useAssets, assetStore } from "@/lib/asset-store";
import { grabBanner } from "@/lib/banner.functions";
import { SeverityBadge, StatusPill } from "@/components/SeverityBadge";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Search, Plus, Upload, RefreshCw, Trash2, X, Radar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Asset Inventory — IndiaMart EASM" },
      { name: "description", content: "Search, filter, and manage every tracked external asset across the IndiaMart attack surface." },
    ],
  }),
  component: AssetInventory,
});

function AssetInventory() {
  const ASSETS = useAssets();
  const grab = useServerFn(grabBanner);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<Asset | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  const grabBanners = async (targets: Asset[]) => {
    if (!targets.length) return;
    setGrabbing(true);
    const t = toast.loading(`Grabbing banners for ${targets.length} asset${targets.length === 1 ? "" : "s"}…`);
    let exposed = 0;
    await Promise.all(
      targets.map(async (a) => {
        try {
          const r = await grab({ data: { asset: a.asset } });
          assetStore.setBanner(a.id, {
            server: r.server,
            poweredBy: r.poweredBy,
            product: r.product,
            version: r.version,
            scheme: r.scheme,
            status: r.status,
            exposed: r.exposed,
            error: r.error,
            fetchedAt: r.fetchedAt,
          });
          if (r.exposed) exposed++;
        } catch (e) {
          assetStore.setBanner(a.id, {
            server: null, poweredBy: null, product: null, version: null,
            scheme: null, status: null, exposed: false,
            error: (e as Error).message, fetchedAt: new Date().toISOString(),
          });
        }
      }),
    );
    setGrabbing(false);
    toast.dismiss(t);
    toast.success(`Banner grab complete — ${exposed} version${exposed === 1 ? "" : "s"} exposed`);
  };

  const filtered = ASSETS.filter((a) => {
    if (q && !a.asset.includes(q) && !a.ip.includes(q)) return false;
    if (type !== "all" && a.type !== type) return false;
    if (status !== "all" && a.status !== status) return false;
    if (severity !== "all" && a.worstSeverity !== severity) return false;
    return true;
  });

  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  return (
    <div className="p-6">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Asset Inventory</h1>
          <p className="text-[13px] text-muted-foreground">{filtered.length} of {ASSETS.length} assets</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search assets, IPs, types..."
            className="w-full h-9 rounded-md border bg-background pl-9 pr-3 text-[13px] outline-none focus:border-[var(--color-primary)]"
            style={{ borderColor: "var(--color-border)" }}
          />
        </div>
        <Select value={type} onChange={setType} options={[
          ["all", "Type: All"], ["domain", "Domain"], ["subdomain", "Subdomain"], ["ip", "IP"]
        ]} />
        <Select value={status} onChange={setStatus} options={[
          ["all", "Status: All"], ["open", "Open"], ["resolved", "Resolved"], ["scanning", "Scanning"]
        ]} />
        <Select value={severity} onChange={setSeverity} options={[
          ["all", "Severity: All"], ["critical", "Critical"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]
        ]} />
        <div className="flex-1" />
        <button
          onClick={() => toast.success("Add asset form coming soon")}
          className="inline-flex items-center gap-1.5 h-9 rounded-md px-3 text-[13px] font-medium text-white"
          style={{ background: "#238636" }}
        >
          <Plus size={14} /> Add Asset
        </button>
        <button
          className="inline-flex items-center gap-1.5 h-9 rounded-md border px-3 text-[13px] font-medium"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          <Upload size={14} /> Import
        </button>
      </div>

      {selected.size > 0 && (
        <div className="panel mb-3 flex items-center justify-between px-3 py-2">
          <span className="text-[13px]">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.info("Scanning selected")} className="h-8 rounded-md border px-3 text-[12px]" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>Scan Selected</button>
            <button onClick={() => setDeleteIds([...selected])} className="h-8 rounded-md border px-3 text-[12px]" style={{ borderColor: "var(--color-sev-critical)", color: "var(--color-sev-critical)" }}>Delete Selected</button>
            <button className="h-8 rounded-md border px-3 text-[12px]">Export Selected</button>
          </div>
        </div>
      )}

      <div className="panel overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}></th>
              <th>Asset</th>
              <th>Type</th>
              <th>IP Address</th>
              <th>Open Issues</th>
              <th>Worst Severity</th>
              <th>Status</th>
              <th>Last Scan</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} /></td>
                <td>
                  <button onClick={() => setDrawer(a)} className="font-mono text-[13px] hover:underline" style={{ color: "var(--color-primary)" }}>
                    {a.asset}
                  </button>
                </td>
                <td className="text-[12px] uppercase tracking-wider text-muted-foreground">{a.type}</td>
                <td className="font-mono text-[12px] text-muted-foreground">{a.ip}</td>
                <td>
                  <span className="font-mono tabular-nums text-[13px]" style={{ color: a.openIssues > 0 ? "var(--color-sev-critical)" : "var(--color-muted-foreground)" }}>
                    {a.openIssues}
                  </span>
                </td>
                <td><SeverityBadge severity={a.worstSeverity} /></td>
                <td><StatusPill status={a.status} /></td>
                <td className="text-[12px] text-muted-foreground">{a.lastScan}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <IconBtn onClick={() => toast.info(`Scanning ${a.asset}`)}><RefreshCw size={13} /></IconBtn>
                    <IconBtn onClick={() => setDeleteIds([a.id])}><Trash2 size={13} /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawer && <AssetDrawer asset={drawer} onClose={() => setDrawer(null)} />}

      <ConfirmDeleteDialog
        open={!!deleteIds}
        itemLabel={
          deleteIds && deleteIds.length === 1
            ? ASSETS.find((a) => a.id === deleteIds[0])?.asset ?? "this asset"
            : `${deleteIds?.length ?? 0} assets`
        }
        onCancel={() => setDeleteIds(null)}
        onConfirm={() => {
          if (deleteIds) {
            assetStore.remove(deleteIds);
            toast.success(`Deleted ${deleteIds.length} asset${deleteIds.length === 1 ? "" : "s"}`);
            setSelected(new Set());
            setDeleteIds(null);
          }
        }}
      />
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border bg-background px-2 text-[13px] outline-none focus:border-[var(--color-primary)]"
      style={{ borderColor: "var(--color-border)" }}
    >
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-[var(--color-hover)] hover:text-foreground">
      {children}
    </button>
  );
}

function AssetDrawer({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const [tab, setTab] = useState<"issues" | "history" | "evidence">("issues");
  const issues = ISSUES.filter((i) => i.asset === asset.asset);
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div onClick={(e) => e.stopPropagation()} className="relative h-full w-[480px] overflow-y-auto border-l" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        <div className="sticky top-0 z-10 border-b p-4" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[16px]">{asset.asset}</div>
              <div className="mt-2 flex items-center gap-2">
                <StatusPill status={asset.status} />
                <span className="text-[12px] text-muted-foreground font-mono">{asset.ip}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-8 rounded-md border px-3 text-[12px]" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>Re-scan</button>
              <button onClick={onClose} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-[var(--color-hover)]"><X size={16} /></button>
            </div>
          </div>
          <div className="mt-4 flex gap-1 border-b -mb-4" style={{ borderColor: "var(--color-border)" }}>
            {(["issues", "history", "evidence"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-3 py-2 text-[12px] uppercase tracking-wider"
                style={{
                  color: tab === t ? "var(--color-primary)" : "var(--color-muted-foreground)",
                  borderBottom: tab === t ? "2px solid var(--color-primary)" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {t === "evidence" ? "Raw Evidence" : t === "history" ? "Scan History" : "Issues"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {tab === "issues" && (
            <div className="space-y-3">
              {issues.length === 0 && <p className="text-[13px] text-muted-foreground">No issues for this asset.</p>}
              {issues.map((i) => (
                <div key={i.id} className="rounded-md border p-3" style={{ background: "var(--color-elevated)", borderColor: "var(--color-border)" }}>
                  <div className="flex items-center justify-between">
                    <SeverityBadge severity={i.severity} />
                    <button className="text-[12px]" style={{ color: "var(--color-success)" }}>Resolve</button>
                  </div>
                  <div className="mt-2 text-[13px] font-medium">{i.type}</div>
                  <pre className="mt-2 rounded-md p-2 font-mono text-[11px] whitespace-pre-wrap break-all" style={{ background: "var(--color-background)", color: "var(--color-muted-foreground)" }}>
                    {i.evidence}
                  </pre>
                  <div className="mt-2 text-[12px] text-muted-foreground">
                    <span className="label-uppercase">Remediation</span>
                    <ul className="mt-1 list-decimal pl-5 space-y-0.5">
                      {i.remediation.map((r, idx) => <li key={idx}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "history" && (
            <table className="data-table">
              <thead><tr><th>Timestamp</th><th>Issues</th><th>Duration</th></tr></thead>
              <tbody>
                {[1,2,3,4].map((i) => (
                  <tr key={i}>
                    <td className="font-mono text-[12px]">2025-05-{(13-i).toString().padStart(2,"0")} 03:00</td>
                    <td className="font-mono">{Math.floor(Math.random()*8)}</td>
                    <td className="font-mono text-muted-foreground">01:{(20+i).toString().padStart(2,"0")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "evidence" && (
            <pre className="rounded-md p-3 font-mono text-[11px] leading-relaxed overflow-x-auto" style={{ background: "#000", color: "var(--color-success)", border: "1px solid var(--color-border)" }}>
{`$ nmap -sV ${asset.ip}
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${asset.asset} (${asset.ip})
Host is up (0.012s latency).
Not shown: 998 filtered ports
PORT     STATE SERVICE  VERSION
80/tcp   open  http     nginx 1.18.0 (Ubuntu)
443/tcp  open  ssl/http nginx 1.18.0 (Ubuntu)

$ curl -sI https://${asset.asset}
HTTP/2 200
server: nginx/1.18.0 (Ubuntu)
content-type: text/html; charset=UTF-8
x-powered-by: PHP/7.4.3
set-cookie: session=abc123; Path=/

$ openssl s_client -connect ${asset.asset}:443
subject=CN=${asset.asset}
issuer=C=US, O=Let's Encrypt, CN=R3
notBefore=Jan 12 00:00:00 2025 GMT
notAfter=Apr 12 23:59:59 2025 GMT  [EXPIRED]`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
