import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/connexion')
  }

  // Vérifie si l'utilisateur est dans la table admins
  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Si on est dans la table OU si l'email est l'email admin par défaut
  const isAdmin = adminRow || user.email === "admin@istmboma.cd";

  if (!isAdmin) {
    redirect('/tableau-de-bord')
  }

  // Si tout est bon, on affiche le tableau de bord admin:
  return <>{children}</>
}