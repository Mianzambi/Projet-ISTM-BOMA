export default function robots() {
  const baseUrl = "https://projet-isc-academia.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/tableau-de-bord/", "/admin/"], // Empêche Google d'indexer les pages privées
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}