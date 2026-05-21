import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { AppSidebar } from "@/components/AppSidebar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "IndiaMart EASM — External Attack Surface Management" },
      { name: "description", content: "Internal security operations dashboard for tracking external attack surface, assets, and vulnerabilities." },
      { property: "og:title", content: "IndiaMart EASM — External Attack Surface Management" },
      { name: "twitter:title", content: "IndiaMart EASM — External Attack Surface Management" },
      { property: "og:description", content: "Internal security operations dashboard for tracking external attack surface, assets, and vulnerabilities." },
      { name: "twitter:description", content: "Internal security operations dashboard for tracking external attack surface, assets, and vulnerabilities." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b45325d4-9eb0-48ae-90c7-3e0d59389dce/id-preview-8d6a6f72--6a2b1e89-aad9-45b2-baf0-c4eb54cf5220.lovable.app-1778659986844.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b45325d4-9eb0-48ae-90c7-3e0d59389dce/id-preview-8d6a6f72--6a2b1e89-aad9-45b2-baf0-c4eb54cf5220.lovable.app-1778659986844.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
