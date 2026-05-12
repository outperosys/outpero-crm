export type Role = "ADMIN" | "MEMBER"

export type Profile = {
  id: string
  userId: string
  name: string | null
  email: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

// Action response wrapper — used by all server actions
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
