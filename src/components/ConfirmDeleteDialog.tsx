import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  open: boolean;
  title?: string;
  itemLabel: string; // e.g. asset name or "3 assets"
  description?: string;
  confirmWord?: string; // defaults to "DELETE"
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({
  open,
  title = "Confirm deletion",
  itemLabel,
  description,
  confirmWord = "DELETE",
  onCancel,
  onConfirm,
}: Props) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) setText("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const matches = text === confirmWord;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-md border shadow-2xl"
        style={{ background: "var(--color-card)", borderColor: "var(--color-sev-critical)" }}
      >
        <div className="flex items-start justify-between p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} style={{ color: "var(--color-sev-critical)" }} />
            <h3 className="text-[14px] font-semibold">{title}</h3>
          </div>
          <button onClick={onCancel} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-[var(--color-hover)]">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div
            className="rounded-md border p-3 text-[12px]"
            style={{
              background: "color-mix(in oklab, var(--color-sev-critical) 8%, transparent)",
              borderColor: "color-mix(in oklab, var(--color-sev-critical) 40%, transparent)",
              color: "var(--color-sev-critical)",
            }}
          >
            <strong className="font-semibold">Warning:</strong> This action cannot be undone. This will permanently delete{" "}
            <span className="font-mono">{itemLabel}</span> and all related scan history.
          </div>

          {description && <p className="text-[13px] text-muted-foreground">{description}</p>}

          <div>
            <label className="label-uppercase block mb-1.5">
              Type <span className="font-mono text-foreground">{confirmWord}</span> to confirm
            </label>
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && matches && onConfirm()}
              placeholder={confirmWord}
              className="w-full h-9 rounded-md border bg-background px-3 font-mono text-[13px] outline-none focus:border-[var(--color-sev-critical)]"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={onCancel}
            className="h-9 rounded-md border px-4 text-[13px]"
            style={{ borderColor: "var(--color-border)" }}
          >
            Cancel
          </button>
          <button
            disabled={!matches}
            onClick={onConfirm}
            className="h-9 rounded-md px-4 text-[13px] font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--color-sev-critical)" }}
          >
            I understand, delete
          </button>
        </div>
      </div>
    </div>
  );
}
