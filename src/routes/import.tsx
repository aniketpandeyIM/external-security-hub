import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, Plus, Download, Trash2, CheckCircle2 } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useAssets, assetStore } from "@/lib/asset-store";
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

type ParsedRow = { asset: string; type?: string; ip?: string };

function normalizeRows(raw: Record<string, unknown>[]): ParsedRow[] {
  return raw
    .map((r) => {
      const keys = Object.keys(r);
      const find = (cands: string[]) => {
        const k = keys.find((k) => cands.includes(k.trim().toLowerCase()));
        return k ? String(r[k] ?? "").trim() : "";
      };
      return {
        asset: find(["asset", "domain", "subdomain", "host", "hostname", "url", "name"]),
        type: find(["type", "kind", "category"]),
        ip: find(["ip", "ip address", "ipaddress", "address"]),
      };
    })
    .filter((r) => r.asset);
}

function DropZone({
  icon: Icon,
  label,
  hint,
  accept,
  onFile,
}: {
  icon: typeof UploadCloud;
  label: string;
  hint: string;
  accept: string;
  onFile: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className="rounded-md border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
        style={{
          borderColor: drag ? "var(--color-primary)" : "var(--color-border)",
          background: drag ? "color-mix(in oklab, var(--color-primary) 8%, transparent)" : undefined,
        }}
      >
        <Icon size={28} className="mx-auto text-muted-foreground" />
        <div className="mt-3 text-[13px] font-medium">{label}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

function ImportManage() {
  const assets = useAssets();
  const [asset, setAsset] = useState("");
  const [type, setType] = useState("subdomain");
  const [ip, setIp] = useState("");
  const [preview, setPreview] = useState<{ source: string; rows: ParsedRow[] } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  const handleCsv = (file: File) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = normalizeRows(res.data);
        if (!rows.length) return toast.error("No valid rows found. Need an 'asset' or 'domain' column.");
        setPreview({ source: file.name, rows });
        toast.success(`Parsed ${rows.length} rows from ${file.name}`);
      },
      error: (err) => toast.error(`CSV parse error: ${err.message}`),
    });
  };

  const handleExcel = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      const rows = normalizeRows(json);
      if (!rows.length) return toast.error("No valid rows found. Need an 'asset' or 'domain' column.");
      setPreview({ source: file.name, rows });
      toast.success(`Parsed ${rows.length} rows from ${file.name}`);
    } catch (e) {
      toast.error(`Excel parse error: ${(e as Error).message}`);
    }
  };

  const commitPreview = () => {
    if (!preview) return;
    const added = assetStore.add(preview.rows);
    toast.success(`${added} new asset${added === 1 ? "" : "s"} imported${added < preview.rows.length ? ` (${preview.rows.length - added} duplicates skipped)` : ""}`);
    setPreview(null);
  };

  const addManual = () => {
    if (!asset.trim()) return toast.error("Asset is required");
    const added = assetStore.add([{ asset, type, ip }]);
    if (added === 0) toast.error(`${asset} already exists`);
    else toast.success(`${asset} queued for scan`);
    setAsset(""); setIp("");
  };

  const exportCsv = () => {
    const csv = Papa.unparse(assets.map((a) => ({ asset: a.asset, type: a.type, ip: a.ip, worst_severity: a.worstSeverity, status: a.status })));
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "assets.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV");
  };

  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Import / Manage</h1>
        <p className="text-[13px] text-muted-foreground">Bulk import via CSV, Excel, or add assets manually.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="panel p-4">
          <h2 className="label-uppercase mb-3">Upload CSV</h2>
          <DropZone icon={UploadCloud} label="Drop CSV here or click to browse" hint=".csv up to 5MB" accept=".csv,text/csv" onFile={handleCsv} />
          <div className="mt-3 label-uppercase">Expected format</div>
          <pre className="mt-1 rounded-md border p-2 font-mono text-[11px]" style={{ background: "var(--color-background)", borderColor: "var(--color-border)" }}>
{`asset,type,ip
api.indiamart.com,subdomain,13.225.190.11
pay.indiamart.com,subdomain,13.225.190.14`}
          </pre>
        </div>

        <div className="panel p-4">
          <h2 className="label-uppercase mb-3">Upload Excel / Google Sheet</h2>
          <DropZone
            icon={FileSpreadsheet}
            label="Drop .xlsx or .xls here"
            hint="First sheet is parsed; column names auto-mapped"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onFile={handleExcel}
          />
          <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
            Recognized headers: <span className="font-mono">asset / domain / host / hostname / url</span>,{" "}
            <span className="font-mono">type</span>, <span className="font-mono">ip</span>.
            Case-insensitive.
          </div>
        </div>

        <div className="panel p-4">
          <h2 className="label-uppercase mb-3">Add Manually</h2>
          <div className="space-y-3">
            <div>
              <label className="label-uppercase">Asset</label>
              <input value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="subdomain.indiamart.com"
                onKeyDown={(e) => e.key === "Enter" && addManual()}
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
              onClick={addManual}
              className="inline-flex items-center gap-2 h-9 rounded-md px-4 text-[13px] font-medium text-white w-full justify-center"
              style={{ background: "#238636" }}
            >
              <Plus size={14} /> Add & Scan
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold">
              Preview — <span className="font-mono text-muted-foreground">{preview.source}</span>{" "}
              <span className="text-muted-foreground font-normal">({preview.rows.length} rows)</span>
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setPreview(null)} className="h-8 rounded-md border px-3 text-[12px]" style={{ borderColor: "var(--color-border)" }}>
                Cancel
              </button>
              <button onClick={commitPreview} className="inline-flex items-center gap-1.5 h-8 rounded-md px-3 text-[12px] font-medium text-white" style={{ background: "#238636" }}>
                <CheckCircle2 size={13} /> Import {preview.rows.length} assets
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            <table className="data-table">
              <thead><tr><th>Asset</th><th>Type</th><th>IP</th></tr></thead>
              <tbody>
                {preview.rows.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td className="font-mono text-[13px]">{r.asset}</td>
                    <td className="text-[12px] uppercase tracking-wider text-muted-foreground">{r.type || "subdomain"}</td>
                    <td className="font-mono text-[12px] text-muted-foreground">{r.ip || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.rows.length > 50 && (
              <div className="p-2 text-[11px] text-muted-foreground text-center">…{preview.rows.length - 50} more rows</div>
            )}
          </div>
        </div>
      )}

      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="label-uppercase">Asset Management ({assets.length})</h2>
          <div className="flex gap-2">
            {selected.size > 0 && (
              <button
                onClick={() => setDeleteIds([...selected])}
                className="inline-flex items-center gap-2 h-8 rounded-md border px-3 text-[12px]"
                style={{ borderColor: "var(--color-sev-critical)", color: "var(--color-sev-critical)" }}
              >
                <Trash2 size={13} /> Delete {selected.size} selected
              </button>
            )}
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 h-8 rounded-md border px-3 text-[12px]"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Download size={13} /> Export as CSV
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  checked={selected.size === assets.length && assets.length > 0}
                  onChange={(e) => setSelected(e.target.checked ? new Set(assets.map((a) => a.id)) : new Set())}
                />
              </th>
              <th>Asset</th>
              <th>Type</th>
              <th>IP</th>
              <th>Worst Severity</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td><input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} /></td>
                <td className="font-mono text-[13px]">{a.asset}</td>
                <td className="text-[12px] uppercase tracking-wider text-muted-foreground">{a.type}</td>
                <td className="font-mono text-[12px] text-muted-foreground">{a.ip}</td>
                <td><SeverityBadge severity={a.worstSeverity} /></td>
                <td>
                  <button
                    onClick={() => setDeleteIds([a.id])}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-[var(--color-hover)] hover:text-[var(--color-sev-critical)]"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteIds}
        itemLabel={
          deleteIds && deleteIds.length === 1
            ? assets.find((a) => a.id === deleteIds[0])?.asset ?? "this asset"
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
