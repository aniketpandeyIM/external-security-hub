import type { Severity } from "@/lib/mock-data";

const MAP: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "var(--color-sev-critical)" },
  high: { label: "High", color: "var(--color-sev-high)" },
  medium: { label: "Medium", color: "var(--color-sev-medium)" },
  low: { label: "Low", color: "var(--color-sev-low)" },
  info: { label: "Info", color: "var(--color-sev-info)" },
};

export function SeverityBadge({ severity, dot = true }: { severity: Severity; dot?: boolean }) {
  const { label, color } = MAP[severity];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[20px] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`,
        color,
      }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {label}
    </span>
  );
}

export function StatusPill({ status }: { status: "open" | "resolved" | "scanning" | "auto-resolved" | "queued" | "running" | "done" | "failed" }) {
  const map: Record<string, { label: string; color: string; spin?: boolean }> = {
    open: { label: "Open", color: "var(--color-sev-critical)" },
    resolved: { label: "Resolved", color: "var(--color-success)" },
    "auto-resolved": { label: "Auto-Resolved", color: "var(--color-success)" },
    scanning: { label: "Scanning", color: "var(--color-scanning)", spin: true },
    queued: { label: "Queued", color: "var(--color-sev-info)" },
    running: { label: "Running", color: "var(--color-scanning)", spin: true },
    done: { label: "Done", color: "var(--color-success)" },
    failed: { label: "Failed", color: "var(--color-sev-critical)" },
  };
  const { label, color, spin } = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[20px] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`,
        color,
      }}
    >
      {spin ? (
        <span
          className="h-2 w-2 rounded-full border border-current border-t-transparent animate-spin"
        />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      )}
      {label}
    </span>
  );
}
