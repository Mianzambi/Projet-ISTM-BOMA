import "./globals.css";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: {
    default: "Institut Supérieur des Techniques Médicales de Boma (ISTM-BOMA)",
    template: "%s | ISTM Boma",
  },
  description:
    "ISTM-BOMA – Institut Supérieur des Techniques Médicales de Boma. Formations en Sciences Infirmières, Sage-Femme, Gestion des Organisations de Santé, Biologie Médicale et Passerelle. Scientia Splendet et Conscientia.",
  keywords: [
    "ISTM Boma",
    "ISTM-BOMA",
    "Institut Supérieur des Techniques Médicales de Boma",
    "Sciences Infirmières Boma",
    "Sage Femme Boma",
    "Inscriptions ISTM Boma",
    "Portail étudiant ISTM Boma",
  ],
  openGraph: {
    title: "ISTM-BOMA – Portail Académique Officiel",
    description: "Formations supérieures en techniques médicales et sciences de la santé à Boma.",
    siteName: "ISTM Boma Academia",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "Logo officiel ISTM Boma",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#1D4ED8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
