"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Définir l'observateur pour l'animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    // 2. Fonction pour cibler tous les éléments non encore visibles
    const observeElements = () => {
      const elements = document.querySelectorAll(
        ".reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible), .stagger > *:not(.visible)"
      );
      elements.forEach((el) => observer.observe(el));
    };

    // Observer immédiatement au chargement
    observeElements();

    // 3. Surveiller les changements dans le DOM (très important pour les applications React/Next.js SPA)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    // Observer le body pour tout élément ajouté dynamiquement (changement de page client-side)
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]); // Se redéclenche aussi si le pathname change

  return null;
}
