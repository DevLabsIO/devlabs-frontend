"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSessionContext } from "@/lib/session-context";
import { useEffect, useState } from "react";
import {
  Book,
  Building,
  CalendarDays,
  FileText,
  LogOut,
  User,
  Users,
  Users2,
  Zap,
  ChevronsUpDown,
  Home,
  Archive,
  Settings,
  Moon,
  Sun,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  icon: React.ElementType;
  url: string;
  roles: string[];
  color: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        icon: Home,
        url: "/dashboard",
        roles: ["admin", "faculty", "student", "manager"],
        color: "text-blue-500",
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        title: "Reviews",
        icon: FileText,
        url: "/reviews",
        roles: ["faculty", "manager"],
        color: "text-emerald-500",
      },
      {
        title: "Teams",
        icon: Users,
        url: "/teams",
        roles: ["admin", "student", "manager"],
        color: "text-purple-500",
      },
      {
        title: "Courses",
        icon: Book,
        url: "/courses",
        roles: ["faculty", "manager", "student"],
        color: "text-orange-500",
      },
      {
        title: "Archives",
        icon: Archive,
        url: "/archives",
        roles: ["faculty", "student"],
        color: "text-cyan-500",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Users",
        icon: Users,
        url: "/user",
        roles: ["admin"],
        color: "text-indigo-500",
      },
      {
        title: "Semester",
        icon: CalendarDays,
        url: "/semester",
        roles: ["admin"],
        color: "text-rose-500",
      },
      {
        title: "Batch",
        icon: Users2,
        url: "/batch",
        roles: ["admin"],
        color: "text-amber-500",
      },
      {
        title: "Department",
        icon: Building,
        url: "/department",
        roles: ["admin"],
        color: "text-teal-500",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        icon: Settings,
        url: "/settings",
        roles: ["admin", "faculty", "student", "manager"],
        color: "text-slate-500",
      },
    ],
  },
];

function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function ThemeToggle({ mounted }: { mounted: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setTheme(isDark ? "light" : "dark")}
        tooltip={
          mounted
            ? `Switch to ${isDark ? "light" : "dark"} mode`
            : "Toggle theme"
        }
        disabled={!mounted}
        className="group/item transition-all duration-300 hover:bg-sidebar-accent/30"
      >
        {mounted && isDark ? (
          <Sun className="h-4 w-4 text-yellow-500 group-hover/item:brightness-110 transition-colors duration-300" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-500 group-hover/item:brightness-110 transition-colors duration-300" />
        )}
        <span className="font-medium">
          {mounted ? (isDark ? "Light Mode" : "Dark Mode") : "Theme"}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { session } = useSessionContext();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const accessibleNavGroups = React.useMemo(() => {
    if (!session?.user?.groups?.length) return [];

    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.roles.some((role) =>
            (session.user.groups as string[]).includes(role),
          ),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [session?.user?.groups]);

  return (
    <>
      <Sidebar collapsible="icon" className="group">
        <SidebarHeader className="border-b border-sidebar-border bg-gradient-to-br from-sidebar/40 via-sidebar/60 to-sidebar/80 dark:from-sidebar/60 dark:via-sidebar/80 dark:to-sidebar backdrop-blur-sm p-0">
          <Link href="/" className="block">
            <div className="flex items-center p-2 min-h-[64px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg ring-2 ring-primary/20 transition-all duration-200 hover:scale-105 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                <Zap className="h-5 w-5 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
              </div>
              <div className="ml-3 flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
                  Devlabs
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  Project Management
                </span>
              </div>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="bg-gradient-to-b from-sidebar via-sidebar/50 to-sidebar dark:from-sidebar dark:via-sidebar/80 dark:to-sidebar scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border/50 hover:scrollbar-thumb-sidebar-border overflow-x-hidden p-0">
          {accessibleNavGroups.map((group, index) => (
            <React.Fragment key={group.label}>
              <SidebarGroup className="px-2 py-4">
                <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70 px-2 group-data-[collapsible=icon]:sr-only">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                          tooltip={item.title}
                          className="group/item transition-all duration-300 hover:bg-sidebar-accent/30"
                        >
                          <Link href={item.url} className="flex items-center">
                            <item.icon
                              className={`h-4 w-4 transition-colors duration-300 ${
                                pathname === item.url
                                  ? "text-sidebar-accent-foreground"
                                  : `${item.color} group-hover/item:brightness-110`
                              }`}
                            />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    {group.label === "System" && (
                      <ThemeToggle mounted={mounted} />
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              {index < accessibleNavGroups.length - 1 && (
                <SidebarSeparator className="bg-gradient-to-r from-transparent via-sidebar-border to-transparent mx-2" />
              )}
            </React.Fragment>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border bg-gradient-to-r from-sidebar via-sidebar/80 to-sidebar backdrop-blur-sm p-2 overflow-hidden">
          <SidebarMenu className="overflow-hidden">
            {mounted && session?.user ? (
              <SidebarMenuItem>
                <div className="group relative w-full overflow-hidden">
                  <div className="flex items-center p-2 rounded-lg hover:bg-sidebar-accent/20 transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3">
                    <Avatar className="h-8 w-8 flex-shrink-0 rounded-lg ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || ""}
                          width={32}
                          height={32}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold group-data-[collapsible=icon]:text-xs">
                          {session.user.name?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-3 flex items-center justify-between flex-1 min-w-0 group-data-[collapsible=icon]:hidden overflow-hidden">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="font-semibold text-sm truncate">
                          {capitalizeWord(session.user.name || "")}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="flex-shrink-0 p-1.5 rounded-md hover:bg-sidebar-accent/30 transition-all duration-200"
                            title="User menu"
                          >
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-56 rounded-lg shadow-lg border border-sidebar-border/50"
                          side="top"
                          align="end"
                          sideOffset={4}
                        >
                          <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-primary/20">
                                {session.user.image ? (
                                  <Image
                                    src={session.user.image}
                                    alt={session.user.name || ""}
                                    width={32}
                                    height={32}
                                    className="rounded-lg object-cover"
                                  />
                                ) : (
                                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                  {capitalizeWord(session.user.name || "")}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                  {session.user.email}
                                </span>
                              </div>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await signOut({
                                  redirect: true,
                                  callbackUrl: "/login",
                                });
                              } catch {
                                window.location.href = "/login";
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Log out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {}
                  <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground rounded-md shadow-lg border opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 whitespace-nowrap z-50 group-data-[collapsible=expanded]:hidden">
                    <div className="font-semibold text-sm">
                      {capitalizeWord(session.user.name || "")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.user.email}
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <button
                        onClick={async () => {
                          try {
                            await signOut({
                              redirect: true,
                              callbackUrl: "/login",
                            });
                          } catch {
                            window.location.href = "/login";
                          }
                        }}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 text-xs"
                      >
                        <LogOut className="h-3 w-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Loading..."
                  disabled
                  className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3"
                >
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Loading...
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      {children}
    </>
  );
}
