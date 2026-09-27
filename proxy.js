import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Le "proxy" tourne avant chaque page : il rafraîchit la session Supabase
// (cookies) et redirige vers /connexion si quelqu'un essaie d'accéder au
// tableau de bord sans être connecté.
export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Ne mets rien entre createServerClient et getUser() : une simple erreur ici
  // peut déconnecter des gens de façon aléatoire, très dur à déboguer.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Seul /tableau-de-bord et /admin sont protégés — le reste du site (vitrine,
  // connexion, inscription) reste accessible à tout le monde.
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/tableau-de-bord") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
