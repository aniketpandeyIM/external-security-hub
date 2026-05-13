import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SCAN_JOBS, shortId, type ScanJob } from "@/lib/mock-data";
import { StatusPill } from "@/components/SeverityBadge";
import { X } from "lucide-react";

export const Route = createFileRoute("/scans")({
  head: () => ({
    meta: [
      { title: "Scan Jobs — IndiaMart EASM" },
      { name: "description", content: "Live and historical scan jobs with real-time progress and full execution logs." },
    ],
  }),
  component: ScanJobs,
});

function ScanJobs() {
  const [open, setOpen] = useState<ScanJob | null>(null);
  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold tracking-tight">Scan Jobs</h1>
        <p className="text-[13px] text-muted-foreground">{SCAN_JOBS.length} jobs in queue and history</p>
      </div>

      <div className="panel overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Asset</th>
              <th>Triggered By</th>
              <th>Started</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Issues Found</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {SCAN_JOBS.map((j) => (
              <tr key={j.id}>
                <td className="font-mono text-[12px]" style={{ color: "var(--color-primary)" }}>{shortId(j.id)}</td>
                <td className="font-mono text-[13px]">{j.asset}</td>
                <td className="text-[12px] text-muted-foreground capitalize">{j.triggeredBy}</td>
                <td className="text-[12px] text-muted-foreground">{j.started}</td>
                <td className="font-mono text-[12px]">{j.duration}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <StatusPill status={j.status} />
                    {j.status === "running" && j.progress !== undefined && (
                      <div className="w-24 h-1.5 rounded-full" style={{ background: "var(--color-elevated)" }}>
                        <div className="h-full rounded-full" style={{ width: `${j.progress}%`, background: "var(--color-scanning)" }} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="font-mono tabular-nums">{j.issuesFound}</td>
                <td>
                  <button onClick={() => setOpen(j)} className="text-[12px]" style={{ color: "var(--color-primary)" }}>View Logs</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <JobModal job={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

const STEPS = [
  "[INIT]    Spawning scanner worker pool (concurrency=4)",
  "[DNS]     Resolving target hostname...",
  "[DNS]     A record: 13.225.190.11",
  "[DNS]     AAAA record: not found",
  "[PORTS]   Starting nmap scan on top 1000 ports...",
  "[PORTS]   Discovered open: 80/tcp, 443/tcp, 22/tcp",
  "[SSL]     Connecting to 443/tcp for TLS handshake...",
  "[SSL]     Negotiated TLSv1.2, cipher ECDHE-RSA-AES256-GCM-SHA384",
  "[SSL]     Certificate expires: 2025-04-12 (EXPIRED)",
  "[HEADERS] GET / HTTP/2",
  "[HEADERS] Missing: Strict-Transport-Security",
  "[HEADERS] Missing: Content-Security-Policy",
  "[BANNER]  Server: nginx/1.18.0 (Ubuntu)",
  "[BANNER]  X-Powered-By: PHP/7.4.3 (exposed)",
  "[COOKIES] Set-Cookie: session=...; (no HttpOnly flag)",
  "[TECH]    Detected stack: nginx, PHP 7.4, jQuery 1.12",
  "[DONE]    Scan complete in 01:23. 7 issues found.",
];

function JobModal({ job, onClose }: { job: ScanJob; onClose: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    setLines([]);
    let i = 0;
    const t = setInterval(() => {
      setLines((p) => [...p, STEPS[i]]);
      i++;
      if (i >= STEPS.length) clearInterval(t);
    }, 180);
    return () => clearInterval(t);
  }, [job.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-3xl rounded-md border" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <div className="font-mono text-[14px]" style={{ color: "var(--color-primary)" }}>{shortId(job.id)}</div>
            <div className="font-mono text-[12px] text-muted-foreground mt-0.5">{job.asset}</div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-[var(--color-hover)]"><X size={16} /></button>
        </div>
        <div className="p-4">
          <pre
            className="h-[380px] overflow-y-auto rounded-md border p-3 font-mono text-[12px] leading-relaxed"
            style={{ background: "#000", color: "var(--color-success)", borderColor: "var(--color-border)" }}
          >
            {lines.map((l, i) => <div key={i}>{l}</div>)}
            {lines.length < STEPS.length && <span className="animate-pulse">█</span>}
          </pre>
          <div className="mt-3 flex items-center justify-between rounded-md border p-3 text-[12px]" style={{ background: "var(--color-elevated)", borderColor: "var(--color-border)" }}>
            <span className="text-muted-foreground">Summary</span>
            <span className="font-mono">7 issues found · 2 critical · 3 high · 2 medium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
