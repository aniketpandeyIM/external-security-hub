import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  Server,
  Bug,
  Radar,
  SearchCode,
  Upload,
  Settings,
  Shield,
} from "lucide-react";

const items = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/assets", label: "Asset Inventory", icon: Server },
  { to: "/issues", label: "Issue Tracker", icon: Bug },
  { to: "/scans", label: "Scan Jobs", icon: Radar },
  { to: "/subdomains", label: "Subdomain Finder", icon: SearchCode },
  { to: "/import", label: "Import / Manage", icon: Upload },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside
      className="flex w-[220px] shrink-0 flex-col border-r"
      style={{ background: "var(--color-sidebar)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-2 px-4 pt-5 pb-6">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ background: "color-mix(in oklab, var(--color-primary) 18%, transparent)" }}
        >
          <Shield size={18} style={{ color: "var(--color-primary)" }} />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">EASM</div>
          <div className="text-[11px] text-muted-foreground">IndiaMart</div>
        </div>
      </div>

      <nav className="flex-1 px-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors"
              style={{
                background: active ? "color-mix(in oklab, var(--color-primary) 14%, transparent)" : "transparent",
                color: active ? "var(--color-primary)" : "var(--color-foreground)",
                borderLeft: active ? "2px solid var(--color-primary)" : "2px solid transparent",
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="pulse-dot" />
          Last scan: 2h ago
        </div>
      </div>
    </aside>
  );
}
