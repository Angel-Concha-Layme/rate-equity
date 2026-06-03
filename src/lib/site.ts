import { BRAND } from "@/lib/brand";

/**
 * Single source of truth for site-wide SEO / metadata constants. Reused by the
 * root metadata, sitemap, robots, manifest and JSON-LD. Set NEXT_PUBLIC_SITE_URL
 * when moving to a custom domain (otherwise the Vercel URL is used).
 */
export const SITE = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://rate-equity.vercel.app",
  name: BRAND.name,
  title: "RateEquity · Compara el valor económico real de tu trabajo",
  description:
    "Empleado o independiente: el bruto engaña. Calcula liquidez real, beneficios, costo para la empresa, impuestos y valor por hora. Cuánto vale de verdad tu trabajo.",
  locale: "es_PE",
  ogImageAlt: "RateEquity · Compara el valor económico real de tu trabajo",
} as const;
