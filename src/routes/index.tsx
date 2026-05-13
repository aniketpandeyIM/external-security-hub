import { createFileRoute } from "@tanstack/react-router";
import { ASSETS, ISSUES, CHECK_TYPES, SCAN_JOBS } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/SeverityBadge";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — IndiaMart EASM" },
      { name: "description", content: "Real-time security overview: assets, open issues, scan activity, and automation status." },
    ],
  }),
  component: Overview,
});

const severityColors: Record<string, string> = {
  Critical: "var(--color-sev-critical)",
  High: "var(--color-sev-high)",
  Medium: "var(--color-sev-medium)",
  Low: "var(--color-sev-low)",
  Info: "var(--color-sev-info)",
};

function MetricCard({ label, value, accent, pulse }: { label: string; value: string | number; accent: string; pulse?: boolean }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2">
        <span className="label-uppercase">{label}</span>
        {pulse && <span className="h-2 w-2 rounded-full pulse-dot" style={{ background: accent, color: accent }} />}
      </div>
      <div className="mt-2 text-[28px] font-semibold tabular-nums" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function Overview() {
  const breakdown = CHECK_TYPES.map((c, i) => {
    const open = [12, 8, 5, 11, 7, 4, 2, 9, 6, 14][i];
    const resolved = [3, 2, 1, 5, 2, 1, 1, 4, 2, 6][i];
    const sev: Array<"critical" | "high" | "medium" | "low" | "info"> =
      ["high", "high", "critical", "medium", "high", "critical", "info", "medium", "low", "medium"];
    return { name: c, open, resolved, severity: sev[i] };
  });
  const maxOpen = Math.max(...breakdown.map((b) => b.open));

  const sevDist = [
    { name: "Critical", value: 14 },
    { name: "High", value: 22 },
    { name: "Medium", value: 31 },
    { name: "Low", value: 18 },
    { name: "Info", value: 9 },
  ];

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Overview</h1>
          <p className="text-[13px] text-muted-foreground">Real-time security posture across {ASSETS.length} tracked assets.</p>
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">Auto-refresh: 30s</div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="Total Assets" value={ASSETS.length} accent="var(--color-primary)" />
        <MetricCard label="Open Issues" value={94} accent="var(--color-sev-critical)" />
        <MetricCard label="Critical Issues" value={14} accent="var(--color-sev-critical)" pulse />
        <MetricCard label="Resolved This Week" value={23} accent="var(--color-success)" />
        <MetricCard label="Assets Scanned Today" value={37} accent="var(--color-scanning)" />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="panel col-span-3 p-4">
          <h2 className="label-uppercase mb-3">Issue Breakdown by Type</h2>
          <div className="space-y-2">
            {breakdown.map((b) => (
              <div key={b.name} className="grid grid-cols-[180px_1fr_60px_60px_90px] items-center gap-3 text-[13px]">
                <div className="truncate" title={b.name}>{b.name}</div>
                <div className="h-2 rounded-sm" style={{ background: "var(--color-elevated)" }}>
                  <div
                    className="h-full rounded-sm"
                    style={{ width: `${(b.open / maxOpen) * 100}%`, background: severityColors[b.severity[0].toUpperCase() + b.severity.slice(1)] }}
                  />
                </div>
                <div className="font-mono tabular-nums" style={{ color: "var(--color-sev-critical)" }}>{b.open}</div>
                <div className="font-mono tabular-nums text-muted-foreground">{b.resolved}</div>
                <SeverityBadge severity={b.severity} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel col-span-2 p-4">
          <h2 className="label-uppercase mb-3">Severity Distribution</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sevDist} dataKey="value" innerRadius={55} outerRadius={85} stroke="var(--color-card)">
                  {sevDist.map((d) => (
                    <Cell key={d.name} fill={severityColors[d.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {sevDist.map((d) => (
              <div key={d.name} className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: severityColors[d.name] }} />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{d.name}</span>
                </div>
                <div className="font-mono text-[15px] tabular-nums">{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="label-uppercase mb-3">Recent Scan Activity</h2>
        <div className="space-y-1.5">
          {SCAN_JOBS.slice(0, 8).map((j) => {
            const sev = j.issuesFound > 5 ? "critical" : j.issuesFound > 2 ? "high" : j.issuesFound > 0 ? "medium" : "info";
            return (
              <div
                key={j.id}
                className="flex items-center justify-between rounded-md border-l-2 px-3 py-2 text-[13px]"
                style={{
                  borderLeftColor: severityColors[sev[0].toUpperCase() + sev.slice(1)],
                  background: "var(--color-elevated)",
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[13px]">{j.asset}</span>
                  <span className="text-muted-foreground text-[12px]">{j.started}</span>
                  <span className="text-muted-foreground text-[12px]">
                    {j.issuesFound} {j.issuesFound === 1 ? "issue" : "issues"} found
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {j.issuesFound > 0 && <SeverityBadge severity={sev} />}
                  <button className="flex items-center gap-1 text-[12px]" style={{ color: "var(--color-primary)" }}>
                    View <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="panel p-4">
          <h2 className="label-uppercase mb-3">Top Vulnerable Assets</h2>
          <div className="space-y-1">
            {[...ASSETS].sort((a, b) => b.openIssues - a.openIssues).slice(0, 6).map((a, i) => (
              <div key={a.id} className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-[var(--color-hover)]">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono text-[12px] w-4">{i + 1}</span>
                  <span className="font-mono text-[13px]">{a.asset}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono tabular-nums text-[13px]" style={{ color: "var(--color-sev-critical)" }}>
                    {a.openIssues}
                  </span>
                  <SeverityBadge severity={a.worstSeverity} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-4">
          <h2 className="label-uppercase mb-3">Automation Status</h2>
          <div className="space-y-3">
            {[
              { name: "n8n", url: "imworkflow.intermesh.net", status: "ok", last: "2h ago", next: "in 22h" },
              { name: "Windmill", url: "windmill.intermesh.net", status: "ok", last: "30m ago", next: "in 30m" },
              { name: "Google Sheets API", url: "sheets.googleapis.com", status: "error", last: "—", next: "—" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-md border p-3" style={{ background: "var(--color-elevated)", borderColor: "var(--color-border)" }}>
                <div>
                  <div className="flex items-center gap-2">
                    {s.status === "ok" ? (
                      <CheckCircle2 size={14} style={{ color: "var(--color-success)" }} />
                    ) : (
                      <XCircle size={14} style={{ color: "var(--color-sev-critical)" }} />
                    )}
                    <span className="text-[13px] font-medium">{s.name}</span>
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground mt-0.5">{s.url}</div>
                </div>
                <div className="text-right text-[11px] text-muted-foreground">
                  <div>Last run: <span className="font-mono text-foreground">{s.last}</span></div>
                  <div>Next: <span className="font-mono text-foreground">{s.next}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
