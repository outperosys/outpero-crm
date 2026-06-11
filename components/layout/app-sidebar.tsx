"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarClock,
  Video,
  Receipt,
  Wrench,
  Building2,
  CheckSquare,
  Activity,
  Settings,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMain = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: Kanban },
  { label: "Follow-ups", href: "/follow-ups", icon: CalendarClock },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Meetings", href: "/meetings", icon: Video },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "Financial", href: "/financial", icon: Receipt },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-3">
          <p className="text-base font-semibold tracking-tight">Outpero</p>
          <p className="text-xs text-muted-foreground">CRM Workspace</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navMain.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              tooltip="Settings"
            >
              <Link href="/settings">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
