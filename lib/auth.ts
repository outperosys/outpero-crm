import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) throw new Error("Unauthorized")
  return user
}
