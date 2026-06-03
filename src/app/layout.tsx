import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { fontVars } from "./fonts";
import { SITE } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/common/Toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  category: "finance",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
};

// The theme color (light/dark) is controlled by the toggle via data-theme; here
// it is approximated from the system preference for the mobile browser bar.
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f8f8" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
};

// Apply the theme on <html> before the first paint to avoid flicker.
const THEME_BOOT =
  "(function(){try{var t=localStorage.getItem('re-theme');if(t!=='light'&&t!=='dark'){t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fontVars} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <JsonLd />
        <div className="flex min-h-screen flex-col overflow-x-clip bg-canvas bg-[image:var(--tex)] bg-fixed [background-size:var(--tex-size,auto)] font-sans text-ink selection:bg-accent/25">
          {children}
        </div>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
