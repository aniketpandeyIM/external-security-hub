import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ISSUES, type Issue } from "@/lib/mock-data";
import { SeverityBadge, StatusPill } from "@/components/SeverityBadge";
import { Search, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/issues")({
  head: () => ({
    meta: [
      { title: "Issue Tracker — IndiaMart EASM" },
      { name: "description", content: "Triage, resolve, and audit every detected security issue across the attack surface." },
    ],
  }),
  component: IssueTracker,
});

function IssueTracker() {
  const [q, setQ] = useState("");
  const [sev, setSev] = useState("all");
  const [stat, setStat] = useState("all");
  const [sort, setSort] = useState("newest");
  const [open, setOpen] = useState<Issue | null>(null);

  const filtered = ISSUES.filter((i) => {
    if (q && !i.type.toLowerCase().includes(q.toLowerCase()) && !i.asset.includes(q)) return false;
    if (sev !== "all" && i.severity !== sev) return false;
    if (stat !== "all" && i.status !== stat) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold tracking-tight">Issue Tracker</h1>
        <p className="text-[13px] text-muted-foreground">{filtered.length} issues across all tracked assets</p>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by issue or asset..."
            className="w-full h-9 rounded-md border bg-background pl-9 pr-3 text-[13px] outline-none focus:border-[var(--color-primary)]"
            style={{ borderColor: "var(--color-border)" }}
          />
        </div>
        <select value={sev} onChange={(e) => setSev(e.target.value)} className="h-9 rounded-md border bg-background px-2 text-[13px]" style={{ borderColor: "var(--color-border)" }}>
          <option value="all">Severity: All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        <select value={stat} onChange={(e) => setStat(e.target.value)} className="h-9 rounded-md border bg-background px-2 text-[13px]" style={{ borderColor: "var(--color-border)" }}>
          <option value="all">Status: All</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="auto-resolved">Auto-Resolved</option>
        </select>
        <div className="flex-1" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 rounded-md border bg-background px-2 text-[13px]" style={{ borderColor: "var(--color-border)" }}>
          <option value="newest">Sort: Newest</option>
          <option value="severity">Sort: Severity</option>
          <option value="asset">Sort: Asset</option>
        </select>
      </div>

      <div className="panel overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Issue Type</th>
              <th>Asset</th>
              <th>Evidence</th>
              <th>Detected</th>
              <th>Status</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} onClick={() => setOpen(i)} className="cursor-pointer">
                <td><SeverityBadge severity={i.severity} /></td>
                <td className="text-[13px]">{i.type}</td>
                <td className="font-mono text-[13px]" style={{ color: "var(--color-primary)" }}>{i.asset}</td>
                <td className="font-mono text-[12px] text-muted-foreground max-w-[280px] truncate">{i.evidence}</td>
                <td className="text-[12px] text-muted-foreground">{i.detected}</td>
                <td><StatusPill status={i.status} /></td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toast.success("Issue resolved")} className="text-[12px]" style={{ color: "var(--color-success)" }}>Resolve</button>
                    <span className="text-muted-foreground">·</span>
                    <button className="text-[12px]" style={{ color: "var(--color-primary)" }}>View Asset</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setOpen(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div onClick={(e) => e.stopPropagation()} className="relative h-full w-[520px] overflow-y-auto border-l p-5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <SeverityBadge severity={open.severity} />
                <h2 className="mt-2 text-[18px] font-semibold">{open.type}</h2>
                <p className="font-mono text-[12px] mt-1" style={{ color: "var(--color-primary)" }}>{open.asset}</p>
              </div>
              <button onClick={() => setOpen(null)} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-[var(--color-hover)]"><X size={16} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="label-uppercase mb-2">Evidence</div>
                <pre className="rounded-md p-3 font-mono text-[12px] leading-relaxed" style={{ background: "#000", color: "var(--color-success)", border: "1px solid var(--color-border)" }}>
{open.evidence}
                </pre>
              </div>

              <div>
                <div className="label-uppercase mb-2">Remediation Steps</div>
                <ol className="list-decimal pl-5 space-y-1.5 text-[13px]">
                  {open.remediation.map((r, i) => <li key={i}>{r}</li>)}
                </ol>
              </div>

              <div>
                <div className="label-uppercase mb-2">History</div>
                <div className="rounded-md border p-3 text-[12px] space-y-1" style={{ background: "var(--color-elevated)", borderColor: "var(--color-border)" }}>
                  <div><span className="text-muted-foreground">Detected:</span> <span className="font-mono">{open.detected}</span> by scan <span className="font-mono" style={{ color: "var(--color-primary)" }}>j2c4a8f1</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <StatusPill status={open.status} /></div>
                </div>
              </div>

              <button
                onClick={() => toast.info("Triggering verification scan...")}
                className="inline-flex items-center gap-2 h-9 rounded-md border px-4 text-[13px] font-medium w-full justify-center"
                style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              >
                <RefreshCw size={14} /> Trigger Verification Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
