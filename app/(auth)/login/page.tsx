import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Sign In — Outpero CRM",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Outpero CRM</h1>
          <p className="text-sm text-muted-foreground">Sign in to your workspace</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
