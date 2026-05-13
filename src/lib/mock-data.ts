export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type AssetStatus = "open" | "resolved" | "scanning";
export type AssetType = "domain" | "subdomain" | "ip";

export interface Asset {
  id: string;
  asset: string;
  type: AssetType;
  ip: string;
  openIssues: number;
  worstSeverity: Severity;
  status: AssetStatus;
  lastScan: string;
}

export interface Issue {
  id: string;
  severity: Severity;
  type: string;
  asset: string;
  evidence: string;
  detected: string;
  status: "open" | "resolved" | "auto-resolved";
  remediation: string[];
}

export interface ScanJob {
  id: string;
  asset: string;
  triggeredBy: string;
  started: string;
  duration: string;
  status: "queued" | "running" | "done" | "failed";
  issuesFound: number;
  progress?: number;
}

export const CHECK_TYPES = [
  "Open Ports",
  "Weak SSL/Ciphers",
  "Certificate Expired",
  "Server Banner Exposed",
  "Sensitive Tech Stack",
  "No HTTPS Enforcement",
  "Running on HTTP",
  "Missing HttpOnly Flag",
  "Missing Secure Flag",
  "Missing Security Headers",
];

export const ASSETS: Asset[] = [
  { id: "a1", asset: "api.indiamart.com", type: "subdomain", ip: "13.225.190.11", openIssues: 7, worstSeverity: "critical", status: "open", lastScan: "2h ago" },
  { id: "a2", asset: "pay.indiamart.com", type: "subdomain", ip: "13.225.190.14", openIssues: 3, worstSeverity: "high", status: "open", lastScan: "2h ago" },
  { id: "a3", asset: "seller.indiamart.com", type: "subdomain", ip: "13.225.190.21", openIssues: 5, worstSeverity: "high", status: "open", lastScan: "3h ago" },
  { id: "a4", asset: "dir.indiamart.com", type: "subdomain", ip: "52.84.150.32", openIssues: 1, worstSeverity: "medium", status: "open", lastScan: "5h ago" },
  { id: "a5", asset: "m.indiamart.com", type: "subdomain", ip: "52.84.150.45", openIssues: 0, worstSeverity: "info", status: "resolved", lastScan: "1h ago" },
  { id: "a6", asset: "tools.indiamart.com", type: "subdomain", ip: "13.225.190.55", openIssues: 2, worstSeverity: "medium", status: "scanning", lastScan: "now" },
  { id: "a7", asset: "indiamart.com", type: "domain", ip: "13.225.190.10", openIssues: 4, worstSeverity: "high", status: "open", lastScan: "2h ago" },
  { id: "a8", asset: "static.indiamart.com", type: "subdomain", ip: "52.84.150.78", openIssues: 1, worstSeverity: "low", status: "open", lastScan: "6h ago" },
  { id: "a9", asset: "13.225.190.99", type: "ip", ip: "13.225.190.99", openIssues: 6, worstSeverity: "critical", status: "open", lastScan: "4h ago" },
  { id: "a10", asset: "blog.indiamart.com", type: "subdomain", ip: "52.84.150.91", openIssues: 0, worstSeverity: "info", status: "resolved", lastScan: "12h ago" },
];

export const ISSUES: Issue[] = [
  { id: "i1", severity: "critical", type: "Certificate Expired", asset: "api.indiamart.com", evidence: "SSL cert expired 2025-04-12, CN=api.indiamart.com, issuer=Let's Encrypt", detected: "2h ago", status: "open", remediation: ["Renew certificate via ACME client", "Deploy renewed cert to load balancer", "Verify with openssl s_client"] },
  { id: "i2", severity: "critical", type: "Open Ports", asset: "13.225.190.99", evidence: "Port 22/tcp open ssh OpenSSH 7.4 (protocol 2.0)\nPort 3306/tcp open mysql MySQL 5.7.32", detected: "4h ago", status: "open", remediation: ["Restrict 3306 to internal subnets", "Move SSH behind bastion", "Apply security group rules"] },
  { id: "i3", severity: "high", type: "Weak SSL/Ciphers", asset: "pay.indiamart.com", evidence: "TLS 1.0 enabled, cipher TLS_RSA_WITH_3DES_EDE_CBC_SHA negotiated", detected: "6h ago", status: "open", remediation: ["Disable TLS 1.0 and 1.1", "Remove 3DES and RC4 ciphers", "Force TLS 1.2+ on edge"] },
  { id: "i4", severity: "high", type: "Server Banner Exposed", asset: "seller.indiamart.com", evidence: "Server: nginx/1.18.0 (Ubuntu)\nX-Powered-By: PHP/7.4.3", detected: "1d ago", status: "open", remediation: ["Set server_tokens off in nginx", "Remove X-Powered-By via expose_php=Off"] },
  { id: "i5", severity: "medium", type: "Missing Security Headers", asset: "dir.indiamart.com", evidence: "Missing: Strict-Transport-Security, Content-Security-Policy, X-Frame-Options", detected: "3h ago", status: "open", remediation: ["Add HSTS header with max-age=31536000", "Define CSP policy", "Add X-Frame-Options: DENY"] },
  { id: "i6", severity: "medium", type: "Missing HttpOnly Flag", asset: "api.indiamart.com", evidence: "Set-Cookie: session=abc123; Path=/; (no HttpOnly)", detected: "5h ago", status: "open", remediation: ["Set HttpOnly flag on session cookies", "Audit all Set-Cookie headers"] },
  { id: "i7", severity: "low", type: "Missing Secure Flag", asset: "static.indiamart.com", evidence: "Set-Cookie: tracking=xyz; Path=/", detected: "8h ago", status: "open", remediation: ["Add Secure flag on all cookies served via HTTPS"] },
  { id: "i8", severity: "high", type: "Sensitive Tech Stack", asset: "api.indiamart.com", evidence: "Detected: Apache Struts 2.3.20 (CVE-2017-5638 vulnerable)", detected: "10h ago", status: "open", remediation: ["Upgrade Struts to 2.5.33+", "Apply WAF rule for OGNL injection"] },
  { id: "i9", severity: "critical", type: "No HTTPS Enforcement", asset: "indiamart.com", evidence: "HTTP request to / returns 200 OK without redirect to HTTPS", detected: "1d ago", status: "open", remediation: ["Configure 301 redirect from HTTP to HTTPS", "Enable HSTS"] },
  { id: "i10", severity: "info", type: "Running on HTTP", asset: "blog.indiamart.com", evidence: "Service responds on port 80, no TLS available", detected: "2d ago", status: "resolved", remediation: ["Provision TLS certificate", "Migrate to HTTPS"] },
];

export const SCAN_JOBS: ScanJob[] = [
  { id: "j1", asset: "tools.indiamart.com", triggeredBy: "scheduled", started: "now", duration: "00:42", status: "running", issuesFound: 0, progress: 62 },
  { id: "j2", asset: "api.indiamart.com", triggeredBy: "manual", started: "2h ago", duration: "01:23", status: "done", issuesFound: 7 },
  { id: "j3", asset: "pay.indiamart.com", triggeredBy: "scheduled", started: "2h ago", duration: "01:11", status: "done", issuesFound: 3 },
  { id: "j4", asset: "seller.indiamart.com", triggeredBy: "scheduled", started: "3h ago", duration: "00:58", status: "done", issuesFound: 5 },
  { id: "j5", asset: "old-staging.indiamart.com", triggeredBy: "manual", started: "4h ago", duration: "00:12", status: "failed", issuesFound: 0 },
  { id: "j6", asset: "dir.indiamart.com", triggeredBy: "scheduled", started: "5h ago", duration: "01:34", status: "done", issuesFound: 1 },
  { id: "j7", asset: "static.indiamart.com", triggeredBy: "scheduled", started: "6h ago", duration: "00:47", status: "done", issuesFound: 1 },
  { id: "j8", asset: "m.indiamart.com", triggeredBy: "manual", started: "1h ago", duration: "01:02", status: "done", issuesFound: 0 },
];

export function shortId(id: string) {
  return id.padEnd(8, "0").slice(0, 8);
}
