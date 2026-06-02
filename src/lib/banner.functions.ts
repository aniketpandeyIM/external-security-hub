import { createServerFn } from "@tanstack/react-start";

export interface BannerResult {
  asset: string;
  server: string | null;
  poweredBy: string | null;
  product: string | null; // "nginx" | "apache" | "iis" | "cloudflare" | ...
  version: string | null;
  scheme: "https" | "http" | null;
  status: number | null;
  exposed: boolean; // true when version is leaked in Server header
  error?: string;
  fetchedAt: string;
}

function parseServer(header: string | null): { product: string | null; version: string | null } {
  if (!header) return { product: null, version: null };
  // Examples: "nginx/1.18.0 (Ubuntu)", "Apache/2.4.41 (Ubuntu)", "Microsoft-IIS/10.0", "cloudflare"
  const m = header.match(/^([A-Za-z][A-Za-z0-9_\-]*)(?:\/([\w.\-]+))?/);
  if (!m) return { product: header.trim(), version: null };
  return { product: m[1], version: m[2] ?? null };
}

async function probe(url: string, signal: AbortSignal): Promise<Response | null> {
  try {
    // Try HEAD first (cheap), fall back to GET if server rejects HEAD
    const head = await fetch(url, { method: "HEAD", redirect: "follow", signal });
    if (head.status < 400 || head.status === 401 || head.status === 403) return head;
    return await fetch(url, { method: "GET", redirect: "follow", signal });
  } catch {
    return null;
  }
}

export const grabBanner = createServerFn({ method: "POST" })
  .inputValidator((input: { asset: string }) => {
    const raw = (input.asset ?? "").trim().toLowerCase();
    if (!raw) throw new Error("asset is required");
    // strip scheme/path
    const host = raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!/^[a-z0-9.\-:]+$/.test(host)) throw new Error("invalid host");
    return { host };
  })
  .handler(async ({ data }): Promise<BannerResult> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      let res = await probe(`https://${data.host}`, ctrl.signal);
      let scheme: "https" | "http" | null = res ? "https" : null;
      if (!res) {
        res = await probe(`http://${data.host}`, ctrl.signal);
        scheme = res ? "http" : null;
      }
      if (!res) {
        return {
          asset: data.host,
          server: null,
          poweredBy: null,
          product: null,
          version: null,
          scheme: null,
          status: null,
          exposed: false,
          error: "unreachable",
          fetchedAt: new Date().toISOString(),
        };
      }
      const server = res.headers.get("server");
      const poweredBy = res.headers.get("x-powered-by");
      const { product, version } = parseServer(server);
      return {
        asset: data.host,
        server,
        poweredBy,
        product,
        version,
        scheme,
        status: res.status,
        exposed: Boolean(version),
        fetchedAt: new Date().toISOString(),
      };
    } finally {
      clearTimeout(timer);
    }
  });
