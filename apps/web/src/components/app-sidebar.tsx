import * as React from "react";
import {
  IconHome,
  IconMessageCircle,
  IconDatabase,
  IconChevronRight,
} from "@tabler/icons-react";
import { NavUser } from "@/components/nav-user.js";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.js";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar.js";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";

// Navigation items for the main menu
const navItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: IconHome,
  },
  {
    title: "Chat",
    url: "/dashboard/chat",
    icon: IconMessageCircle,
  },
  {
    title: "Connections",
    url: "/dashboard/connections",
    icon: IconDatabase,
  },
];

// Mock conversations/threads - in a real app, these would come from an API
const conversations = [
  {
    id: "1",
    title: "User analytics query",
    url: "/dashboard/chat",
  },
  {
    id: "2",
    title: "Sales report analysis",
    url: "/dashboard/chat",
  },
  {
    id: "3",
    title: "Database schema review",
    url: "/dashboard/chat",
  },
  {
    id: "4",
    title: "Customer insights",
    url: "/dashboard/chat",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = authClient.useSession();
  const navigate = useNavigate();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="/dashboard">
              <SidebarMenuButton size="lg">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <IconDatabase className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">SQL Agent</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </SidebarMenuButton>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <a href={item.url}>
                  <SidebarMenuButton>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </a>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Recent Conversations */}
        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel>
              <CollapsibleTrigger className="flex items-center w-full">
                Recent Conversations
                <IconChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarMenuSub>
                {conversations.map((conversation) => (
                  <SidebarMenuSubItem key={conversation.id}>
                    <SidebarMenuSubButton
                      onClick={() => navigate(`${conversation.url}`)}
                    >
                      <IconMessageCircle className="size-3" />
                      <span>{conversation.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate("/dashboard/connections")}
            >
              <IconDatabase className="size-4" />
              <span>Manage Connections</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser
          user={{
            name: data?.user.name ?? "User",
            email: data?.user?.email ?? "user@gmail.com",
            avatar: data?.user?.image ?? "",
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
