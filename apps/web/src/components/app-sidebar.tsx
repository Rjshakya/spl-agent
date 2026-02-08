import * as React from "react";
import {
 
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { useTamboThreadList, type TamboThread } from "@tambo-ai/react";
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
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useNavigate, useParams } from "react-router-dom";
import { ChatIcon, FolderIcon, HomeIcon } from "@/icons/icon-list-1";

// Navigation items for the main menu
const navItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "Chat",
    url: "/dashboard/chat",
    icon: ChatIcon,
  },
  {
    title: "Connections",
    url: "/dashboard/connections",
    icon: FolderIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = authClient.useSession();
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();
  const { data: threadsData, isPending, isError } = useTamboThreadList();

  // Handle both paginated and array responses
  const threads = React.useMemo(() => {
    if (!threadsData) return null;
    console.log(threadsData);

    // Check if it has a data property (paginated response)
    if ("items" in threadsData && Array.isArray(threadsData.items)) {
      return threadsData.items as TamboThread[];
    }
    return null;
  }, [threadsData]);

  const handleNewChat = () => {
    navigate("/dashboard/chat");
  };

  const handleThreadClick = (id: string) => {
    navigate(`/dashboard/chat/${id}`);
  };

 

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="/dashboard">
              <SidebarMenuButton size="lg">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square h-6 w-4 items-center justify-center rounded-lg"></div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium uppercase font-mono">
                    SQL Agent
                  </span>
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

        {/* Thread List */}
        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel>
              <CollapsibleTrigger className="flex items-center w-full">
                Conversations
                <IconChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarMenuSub>
                {/* New Chat Button */}
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    onClick={handleNewChat}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <IconPlus className="size-3" />
                    <span>New Chat</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                {/* Thread List */}
                {isPending && (
                  <SidebarMenuSubItem>
                    <span className="flex h-7 items-center px-2 text-xs text-muted-foreground">
                      Loading...
                    </span>
                  </SidebarMenuSubItem>
                )}

                {isError && (
                  <SidebarMenuSubItem>
                    <span className="flex h-7 items-center px-2 text-xs text-muted-foreground">
                      Error loading threads
                    </span>
                  </SidebarMenuSubItem>
                )}

                {threads &&
                  threads?.map((thread) => (
                    <SidebarMenuSubItem key={thread.id}>
                      <SidebarMenuSubButton
                        onClick={() => handleThreadClick(thread.id)}
                        isActive={threadId === thread.id}
                      >
                        <ChatIcon />
                        <span>{thread?.name || "chat"}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}

                {!isPending && !isError && threads?.length === 0 && (
                  <SidebarMenuSubItem>
                    <span className="flex h-7 items-center px-2 text-xs text-muted-foreground">
                      No conversations yet
                    </span>
                  </SidebarMenuSubItem>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
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
