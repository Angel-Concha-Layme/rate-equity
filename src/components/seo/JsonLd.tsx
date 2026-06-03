import { SITE } from "@/lib/site";

/**
 * Site-wide structured data (JSON-LD): Organization + WebSite + WebApplication.
 * Rendered once from the root layout. Data is fully controlled (no user input),
 * so JSON.stringify into the script is safe.
 */
export function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
        logo: `${SITE.url}/icon.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "es-PE",
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE.url}/#webapp`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        inLanguage: "es-PE",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "PEN" },
        publisher: { "@id": `${SITE.url}/#organization` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
