import type { Metadata } from "next";
import { fontVars } from "./fonts";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND.name} · Compara valor económico real`,
  description: `${BRAND.name} no compara salarios, compara valor económico real: liquidez, costo empresa, impuestos, beneficios y valor por hora efectiva entre modalidades de contratación.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontVars} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
