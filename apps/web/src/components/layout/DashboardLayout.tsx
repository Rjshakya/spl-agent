import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

function getBreadcrumbs(pathname: string) {
  const paths = pathname.split("/").filter(Boolean);

  if (paths.length === 1 && paths[0] === "dashboard") {
    return [{ label: "Dashboard", path: "/dashboard" }];
  }

  const breadcrumbs = [{ label: "Dashboard", path: "/dashboard" }];

  if (paths.includes("chat")) {
    breadcrumbs.push({ label: "Chat", path: "/dashboard/chat" });
  }

  if (paths.includes("connections")) {
    breadcrumbs.push({ label: "Connections", path: "/dashboard/connections" });
  }

  return breadcrumbs;
}

export function DashboardLayout() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 fixed w-full top-0 z-99 bg-background">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                  <BreadcrumbItem
                    className={
                      index === breadcrumbs.length - 1 ? "" : "hidden md:block"
                    }
                  >
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.path}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
