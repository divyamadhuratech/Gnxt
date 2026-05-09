import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  Car,
  FileBarChart,
  Settings,
  Bell,
  Search,
  ChevronDown,
  MapPin,
  HelpCircle,
  LogOut,
  User,
  ChevronRight,
  Store,
  BoxesIcon,
  Wallet,
  ReceiptText,

} from "lucide-react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";


const navSections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
        href: "/",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Shipments",
        icon: <Package className="w-[18px] h-[18px]" />,
        href: "/shipments",
        badge: "12",
        badgeColor: "bg-blue-100 text-blue-700",
      },
      {
        label: "Trip Tracking",
        icon: <MapPin className="w-[18px] h-[18px]" />,
        href: "/trips",
        badge: "3",
        badgeColor: "bg-amber-100 text-amber-700",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Invoices",
        icon: <ReceiptText className="w-[18px] h-[18px]" />,
        href: "/invoices",
      },
      {
        label: "Expenses",
        icon: <Wallet className="w-[18px] h-[18px]" />,
        href: "/expenses",
      },
    ],
  },
  {
    title: "Fleet Management",
    items: [
      {
        label: "Vehicles",
        icon: <Car className="w-[18px] h-[18px]" />,
        href: "/vehicles",
      },
      {
        label: "Drivers",
        icon: <Users className="w-[18px] h-[18px]" />,
        href: "/drivers",
      },
    ],
  },
  {
    title: "Master Data",
    items: [
      {
        label: "Dealers",
        icon: <Store className="w-[18px] h-[18px]" />,
        href: "/dealers",
      },
      {
        label: "Product Data",
        icon: <BoxesIcon className="w-[18px] h-[18px]" />,
        href: "/products",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        label: "Reports",
        icon: <FileBarChart className="w-[18px] h-[18px]" />,
        href: "/reports",
      },
    ],
  },
];

const bottomNavItems = [
  {
    label: "Settings",
    icon: <Settings className="w-[18px] h-[18px]" />,
    href: "/settings",
  },
  {
    label: "Help & Support",
    icon: <HelpCircle className="w-[18px] h-[18px]" />,
    href: "/help",
  },
];

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine page title from current route
  const getPageTitle = () => {
    const allItems = [
      ...navSections.flatMap((s) => s.items),
      ...bottomNavItems,
    ];
    const current = allItems.find((item) => {
      if (item.href === "/") return location.pathname === "/";
      return location.pathname.startsWith(item.href);
    });
    return current?.label || "Dashboard";
  };

  // Breadcrumb
  const getBreadcrumb = () => {
    const sectionMatch = navSections.find((s) =>
      s.items.some((item) => {
        if (item.href === "/") return location.pathname === "/";
        return location.pathname.startsWith(item.href);
      }),
    );
    return sectionMatch?.title || "Overview";
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex overflow-hidden bg-background">
        {/* ── SIDEBAR ─────────────────────────── */}
        <aside
          className={`${sidebarCollapsed ? "w-16" : "w-64"}
  h-full bg-white border-r border-border flex flex-col shrink-0  transition-all duration-300 ease-in-out`}
        >
          {/* Logo / Brand */}
          <div
            className={`relative h-[60px] flex items-center px-3 border-b border-border shrink-0
  ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
          >
            {/* Logo */}
            <div
              onClick={() => {
                if (sidebarCollapsed) setSidebarCollapsed(false);
              }}
              className={`flex items-center cursor-pointer
    ${sidebarCollapsed ? "justify-center w-full" : "gap-3"}`}
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-white" />
              </div>

              {/* Text (only when expanded) */}
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm text-foreground truncate tracking-tight">
                    GNXT
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Distribution Hub
                  </p>
                </div>
              )}
            </div>

           
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition"
              >
                <ChevronRight className="w-4 h-4 rotate-180 transition-transform duration-300" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scroll-smooth">
            {navSections.map((section) => (
              <div key={section.title}>
                {!sidebarCollapsed && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 mb-2">
                    {section.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <SidebarLink
                      key={item.href}
                      item={item}
                      collapsed={sidebarCollapsed}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Nav */}
          <div className="border-t border-border px-3 py-3 space-y-0.5 shrink-0">
            {bottomNavItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                collapsed={sidebarCollapsed}
              />
            ))}
          </div>

          {/* Collapse Toggle */}
          <div className="border-t border-border px-3 py-2.5 shrink-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? "rotate-180" : ""
                  }`}
              />
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ───────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top Bar */}
          <header className="h-[60px] bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">{getBreadcrumb()}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-foreground">{getPageTitle()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search anything..."
                  className="pl-9 h-8 w-[220px] bg-[#f5f6f8] border-transparent text-sm focus:border-border focus:bg-white"
                />
              </div>

              {/* Notification Bell */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground">
                    <Bell className="w-[18px] h-[18px]" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>

              {/* Divider */}
              <div className="w-px h-6 bg-border" />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 hover:bg-muted/60 rounded-lg px-2 py-1.5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] flex items-center justify-center">
                      <span className="text-xs text-white">RM</span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs text-foreground">Madhura</p>
                      <p className="text-[10px] text-muted-foreground">
                        Operations Manager
                      </p>
                    </div>
                    <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="gap-2">
                    <User className="w-3.5 h-3.5" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600">
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto relative">
            <Outlet />

            {/* Floating Create Now Button */}
            {location.pathname !== "/shipments" && (
              <Tooltip>
                <TooltipTrigger asChild></TooltipTrigger>
                <TooltipContent side="left">Create New Shipment</TooltipContent>
              </Tooltip>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ── Sidebar Link Sub-component ─────────────── */

function SidebarLink({ item, collapsed }) {
  const content = (
    <NavLink
      to={item.href}
      end={item.href === "/"}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm transition-colors ${isActive
          ? "bg-[#eef2ff] text-[#1d4ed8]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        } ${collapsed ? "justify-center px-0" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`shrink-0 ${isActive ? "text-[#1d4ed8]" : ""}`}>
            {item.icon}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor || "bg-muted text-muted-foreground"
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
