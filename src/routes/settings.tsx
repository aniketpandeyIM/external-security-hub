import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CHECK_TYPES } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — IndiaMart EASM" },
      { name: "description", content: "Configure scan parameters, integrations, notifications, and cron schedule." },
    ],
  }),
  component: Settings,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel p-5">
      <h2 className="text-[14px] font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-uppercase block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-9 h-5 rounded-full transition-colors relative"
      style={{ background: checked ? "var(--color-primary)" : "var(--color-elevated)" }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

const inputCls = "w-full h-9 rounded-md border bg-background px-3 text-[13px] font-mono outline-none focus:border-[var(--color-primary)]";

function Settings() {
  const [timeout_, setTimeout_] = useState(120);
  const [conc, setConc] = useState(5);
  const [ports, setPorts] = useState("1-65535");
  const [checks, setChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(CHECK_TYPES.map((c) => [c, true]))
  );
  const [alertLevel, setAlertLevel] = useState("high");
  const [digest, setDigest] = useState(true);

  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
        <p className="text-[13px] text-muted-foreground">Scan configuration, integrations, and automation.</p>
      </div>

      <Section title="Scan Configuration">
        <Field label={`Scan timeout: ${timeout_}s`}>
          <input type="range" min={30} max={300} value={timeout_} onChange={(e) => setTimeout_(Number(e.target.value))} className="w-full" />
        </Field>
        <Field label="Ports to scan">
          <input value={ports} onChange={(e) => setPorts(e.target.value)} className={inputCls} style={{ borderColor: "var(--color-border)" }} />
        </Field>
        <Field label={`Scan concurrency: ${conc} parallel assets`}>
          <input type="range" min={1} max={20} value={conc} onChange={(e) => setConc(Number(e.target.value))} className="w-full" />
        </Field>
        <Field label="Enabled checks">
          <div className="grid grid-cols-2 gap-y-2">
            {CHECK_TYPES.map((c) => (
              <div key={c} className="flex items-center justify-between pr-4">
                <span className="text-[13px]">{c}</span>
                <Toggle checked={checks[c]} onChange={(v) => setChecks({ ...checks, [c]: v })} />
              </div>
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Integration Config">
        {[
          ["n8n Webhook Base URL", "https://imworkflow.intermesh.net/webhook"],
          ["Windmill Base URL", "https://windmill.intermesh.net/api"],
          ["Google Sheet ID", ""],
          ["Google Sheets API Key", "••••••••••••••••"],
        ].map(([label, val]) => (
          <Field key={label} label={label}>
            <div className="flex gap-2">
              <input defaultValue={val} className={inputCls} style={{ borderColor: "var(--color-border)" }} />
              <button onClick={() => toast.success("Connection OK")} className="h-9 shrink-0 rounded-md border px-3 text-[12px]" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>Test Connection</button>
            </div>
          </Field>
        ))}
      </Section>

      <Section title="Notifications">
        <Field label="Slack webhook URL">
          <input placeholder="https://hooks.slack.com/services/..." className={inputCls} style={{ borderColor: "var(--color-border)" }} />
        </Field>
        <Field label="Alert on">
          <div className="flex gap-4">
            {[["critical", "Critical only"], ["high", "High and above"], ["all", "All severities"]].map(([v, l]) => (
              <label key={v} className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
                <input type="radio" name="alert" checked={alertLevel === v} onChange={() => setAlertLevel(v)} />
                {l}
              </label>
            ))}
          </div>
        </Field>
        <div className="flex items-center justify-between">
          <span className="text-[13px]">Daily digest</span>
          <Toggle checked={digest} onChange={setDigest} />
        </div>
      </Section>

      <Section title="Cron Schedule">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nightly scan time">
            <input type="time" defaultValue="03:00" className={inputCls} style={{ borderColor: "var(--color-border)" }} />
          </Field>
          <Field label="Timezone">
            <select className="w-full h-9 rounded-md border bg-background px-3 text-[13px]" style={{ borderColor: "var(--color-border)" }}>
              <option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option>
            </select>
          </Field>
        </div>
        <button
          onClick={() => toast.success("Full-scan triggered for all assets")}
          className="mt-2 h-10 rounded-md px-5 text-[13px] font-medium text-white"
          style={{ background: "#238636" }}
        >
          Run Now (Full Scan)
        </button>
      </Section>
    </div>
  );
}
