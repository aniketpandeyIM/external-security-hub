import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, FileSpreadsheet, Plus, Download, Trash2 } from "lucide-react";
import { ASSETS } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/SeverityBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import & Manage Assets — IndiaMart EASM" },
      { name: "description", content: "Bulk-import assets via CSV, Excel, or Google Sheets, or add them manually." },
    ],
  }),
  component: ImportManage,
});

function DropZone({ icon: Icon, label, hint }: { icon: typeof UploadCloud; label: string; hint: string }) {
  return (
    <div className="rounded-md border-2 border-dashed p-8 text-center cursor-pointer hover:bg-[var(--color-hover)]"
      style={{ borderColor: "var(--color-border)" }}>
      <Icon size={28} className="mx-auto text-muted-foreground" />
      <div className="mt-3 text-[13px] font-medium">{label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function ImportManage() {
  const [asset, setAsset] = useState("");
  const [type, setType] = useState("subdomain");
  const [ip, setIp] = useState("");

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Import / Manage</h1>
        <p className="text-[13px] text-muted-foreground">Bulk import via CSV, Excel, or add assets manually.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="panel p-4">
          <h2 className="label-uppercase mb-3">Upload CSV</h2>
          <DropZone icon={UploadCloud} label="Drop CSV here or click to browse" hint=".csv up to 5MB" />
          <div className="mt-3 label-uppercase">Expected format</div>
          <pre className="mt-1 rounded-md border p-2 font-mono text-[11px]" style={{ background: "var(--color-background)", borderColor: "var(--color-border)" }}>
{`asset,type,ip
api.indiamart.com,subdomain,13.225.190.11
pay.indiamart.com,subdomain,13.225.190.14`}
          </pre>
        </div>

        <div className="panel p-4">
          <h2 className="label-uppercase mb-3">Upload Excel / Google Sheet</h2>
          <DropZone icon={FileSpreadsheet} label="Drop .xlsx or .xls here" hint="Sheet column mapping after upload" />
          <div className="mt-3 space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Map column "Domain" →</span>
              <select className="h-7 rounded-md border bg-background px-2 text-[12px]" style={{ borderColor: "var(--color-border)" }}>
                <option>asset</option><option>type</option><option>ip</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Map column "Kind" →</span>
              <select className="h-7 rounded-md border bg-background px-2 text-[12px]" style={{ borderColor: "var(--color-border)" }}>
                <option>type</option><option>asset</option><option>ip</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel p-4">
          <h2 className="label-uppercase mb-3">Add Manually</h2>
          <div className="space-y-3">
            <div>
              <label className="label-uppercase">Asset</label>
              <input value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="subdomain.indiamart.com"
                className="mt-1 w-full h-9 rounded-md border bg-background px-3 font-mono text-[13px] outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: "var(--color-border)" }} />
            </div>
            <div>
              <label className="label-uppercase">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-[13px]"
                style={{ borderColor: "var(--color-border)" }}>
                <option value="domain">Domain</option>
                <option value="subdomain">Subdomain</option>
                <option value="ip">IP</option>
              </select>
            </div>
            <div>
              <label className="label-uppercase">IP Address (optional)</label>
              <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="13.225.190.11"
                className="mt-1 w-full h-9 rounded-md border bg-background px-3 font-mono text-[13px] outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: "var(--color-border)" }} />
            </div>
            <button
              onClick={() => { if (asset) { toast.success(`${asset} queued for scan`); setAsset(""); setIp(""); } else toast.error("Asset is required"); }}
              className="inline-flex items-center gap-2 h-9 rounded-md px-4 text-[13px] font-medium text-white w-full justify-center"
              style={{ background: "#238636" }}
            >
              <Plus size={14} /> Add & Scan
            </button>
          </div>
          <div className="mt-4">
            <div className="label-uppercase mb-2">Recently added</div>
            <div className="space-y-1 text-[12px] font-mono text-muted-foreground">
              <div>vault.indiamart.com</div>
              <div>metrics.indiamart.com</div>
              <div>internal-tools.indiamart.com</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="label-uppercase">Asset Management</h2>
          <button
            onClick={() => toast.success("Exported as CSV")}
            className="inline-flex items-center gap-2 h-8 rounded-md border px-3 text-[12px]"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Download size={13} /> Export as CSV
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}><input type="checkbox" /></th>
              <th>Asset</th>
              <th>Type</th>
              <th>IP</th>
              <th>Worst Severity</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr key={a.id}>
                <td><input type="checkbox" /></td>
                <td className="font-mono text-[13px]">{a.asset}</td>
                <td className="text-[12px] uppercase tracking-wider text-muted-foreground">{a.type}</td>
                <td className="font-mono text-[12px] text-muted-foreground">{a.ip}</td>
                <td><SeverityBadge severity={a.worstSeverity} /></td>
                <td>
                  <button className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-[var(--color-hover)] hover:text-[var(--color-sev-critical)]">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
