import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { fontVars } from "./fonts";
import { BRAND } from "@/lib/brand";
import { Toaster } from "@/components/common/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND.name} · Compara valor económico real`,
  description: `${BRAND.name} no compara salarios, compara valor económico real: liquidez, costo empresa, impuestos, beneficios y valor por hora efectiva entre modalidades de contratación.`,
};

// Aplica el tema (claro/oscuro) en <html> antes del primer paint para evitar
// parpadeo. Lee la preferencia guardada o cae a claro (Solvente).
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
        <div className="flex min-h-screen flex-col overflow-x-clip bg-canvas bg-[image:var(--tex)] bg-fixed [background-size:var(--tex-size,auto)] font-sans text-ink selection:bg-accent/25">
          {children}
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
