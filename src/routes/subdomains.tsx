import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SearchCode, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/subdomains")({
  head: () => ({
    meta: [
      { title: "Subdomain Finder — IndiaMart EASM" },
      { name: "description", content: "Discover and onboard newly exposed subdomains via subfinder, crt.sh, amass, and passive DNS." },
    ],
  }),
  component: SubdomainFinder,
});

const FOUND = [
  { sub: "api.indiamart.com", tracked: true, ip: "13.225.190.11" },
  { sub: "pay.indiamart.com", tracked: true, ip: "13.225.190.14" },
  { sub: "seller.indiamart.com", tracked: true, ip: "13.225.190.21" },
  { sub: "staging-api.indiamart.com", tracked: false, ip: "52.84.150.99" },
  { sub: "internal-tools.indiamart.com", tracked: false, ip: "10.0.4.12" },
  { sub: "mail.indiamart.com", tracked: true, ip: "52.84.150.45" },
  { sub: "old-cdn.indiamart.com", tracked: false, ip: "—" },
  { sub: "dev-portal.indiamart.com", tracked: false, ip: "13.225.190.220" },
  { sub: "metrics.indiamart.com", tracked: false, ip: "—" },
  { sub: "vault.indiamart.com", tracked: false, ip: "10.0.4.15" },
];

const TOOL_LINES = [
  "[subfinder] Enumerating subdomains for indiamart.com",
  "[subfinder] Found api.indiamart.com",
  "[subfinder] Found pay.indiamart.com",
  "[crt.sh] Querying certificate transparency logs...",
  "[crt.sh] Returned 142 certificate entries",
  "[crt.sh] Found staging-api.indiamart.com",
  "[crt.sh] Found internal-tools.indiamart.com",
  "[amass] Running passive enumeration...",
  "[amass] Found mail.indiamart.com",
  "[amass] Found dev-portal.indiamart.com",
  "[passive-dns] Querying historical DNS records...",
  "[passive-dns] Found old-cdn.indiamart.com",
  "[passive-dns] Found vault.indiamart.com",
  "[done] Discovery complete: 47 unique subdomains",
];

function SubdomainFinder() {
  const [domain, setDomain] = useState("");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (phase !== "running") return;
    setLines([]);
    let i = 0;
    const t = setInterval(() => {
      setLines((p) => [...p, TOOL_LINES[i]]);
      i++;
      if (i >= TOOL_LINES.length) {
        clearInterval(t);
        setPhase("done");
      }
    }, 250);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold tracking-tight">Subdomain Finder</h1>
        <p className="text-[13px] text-muted-foreground">Discover newly exposed subdomains and bring them into inventory.</p>
      </div>

      <div className="panel p-5 mb-4">
        <label className="label-uppercase mb-2 block">Root Domain</label>
        <div className="flex gap-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="indiamart.com"
            className="flex-1 h-10 rounded-md border bg-background px-3 font-mono text-[14px] outline-none focus:border-[var(--color-primary)]"
            style={{ borderColor: "var(--color-border)" }}
          />
          <button
            onClick={() => { if (domain) setPhase("running"); else toast.error("Enter a domain"); }}
            className="inline-flex items-center gap-2 h-10 rounded-md px-4 text-[13px] font-medium text-white"
            style={{ background: "var(--color-primary)" }}
          >
            <SearchCode size={15} /> Discover Subdomains
          </button>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Sources used: <span className="font-mono">subfinder</span> · <span className="font-mono">crt.sh</span> · <span className="font-mono">amass</span> · <span className="font-mono">passive DNS</span>
        </div>
      </div>

      {phase === "running" && (
        <div className="panel p-4 mb-4">
          <div className="label-uppercase mb-2">Discovery in progress</div>
          <pre className="h-[260px] overflow-y-auto rounded-md border p-3 font-mono text-[12px] leading-relaxed" style={{ background: "#000", color: "var(--color-success)", borderColor: "var(--color-border)" }}>
            {lines.map((l, i) => <div key={i}>{l}</div>)}
            <span className="animate-pulse">█</span>
          </pre>
        </div>
      )}

      {phase === "done" && (
        <>
          <div className="panel mb-3 px-4 py-3 flex items-center justify-between">
            <div className="text-[13px]">
              Found <span className="font-mono font-semibold">{FOUND.length}</span> subdomains —{" "}
              <span style={{ color: "var(--color-primary)" }} className="font-mono font-semibold">
                {FOUND.filter(f => !f.tracked).length} new
              </span>
              , <span className="font-mono">{FOUND.filter(f => f.tracked).length}</span> already tracked
            </div>
            <button
              onClick={() => toast.success(`Added ${FOUND.filter(f => !f.tracked).length} new subdomains to inventory`)}
              className="h-9 rounded-md px-3 text-[13px] font-medium text-white"
              style={{ background: "#238636" }}
            >
              Add All New
            </button>
          </div>
          <div className="panel overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subdomain</th>
                  <th>Already Tracked</th>
                  <th>IP</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {FOUND.map((f) => (
                  <tr key={f.sub}>
                    <td className="font-mono text-[13px]">{f.sub}</td>
                    <td>
                      {f.tracked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-[20px] px-2.5 py-0.5 text-[11px] uppercase tracking-wider" style={{ background: "color-mix(in oklab, var(--color-success) 15%, transparent)", color: "var(--color-success)" }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-success)" }} /> In inventory
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-[20px] px-2.5 py-0.5 text-[11px] uppercase tracking-wider" style={{ background: "color-mix(in oklab, var(--color-primary) 15%, transparent)", color: "var(--color-primary)" }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-primary)" }} /> New
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-[12px] text-muted-foreground">{f.ip}</td>
                    <td>
                      {!f.tracked && (
                        <button
                          onClick={() => toast.success(`Added ${f.sub}`)}
                          className="inline-flex items-center gap-1 h-7 rounded-md border px-2 text-[12px]"
                          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                        >
                          <Plus size={12} /> Add to Inventory
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
