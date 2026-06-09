import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Topbar } from "@/components/layout/topbar"

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <Topbar />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 flex flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
