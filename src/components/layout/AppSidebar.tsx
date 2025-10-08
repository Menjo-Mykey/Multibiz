import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
  Calculator,
  Scissors,
  Droplets,
  BarChart3,
  Clock,
  Truck,
  CheckSquare,
  DollarSign,
  PackageOpen,
  LogOut,
  Users2,
  AlertCircle,
} from "lucide-react";
import { BusinessSelector } from "./BusinessSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { selectedBusiness } = useBusinessContext();
  const { signOut, user } = useAuth();

  const mainMenuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "POS",
      url: "/pos",
      icon: ShoppingCart,
    },
    {
      title: "Approvals",
      url: "/approvals",
      icon: CheckSquare,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: DollarSign,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
  ];

  const triplekMenuItems = [
    {
      title: "Services",
      url: "/services",
      icon: Scissors,
    },
    {
      title: "Commissions",
      url: "/commissions",
      icon: Calculator,
    },
    {
      title: "Clock In/Out",
      url: "/clock",
      icon: Clock,
    },
  ];

  const swanMenuItems = [
    {
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "Stock Alerts",
      url: "/stock-alerts",
      icon: AlertCircle,
    },
    {
      title: "Deliveries",
      url: "/deliveries",
      icon: Truck,
    },
    {
      title: "Driver Dashboard",
      url: "/driver",
      icon: Truck,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users2,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: PackageOpen,
    },
    {
      title: "Purchase Orders",
      url: "/purchase-orders",
      icon: FileText,
    },
  ];

  const settingsMenuItems = [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Scissors className="h-5 w-5 text-triplek" />
            <Droplets className="h-5 w-5 text-swan" />
          </div>
          <h2 className="font-bold text-lg">Multibiz</h2>
        </div>
        <BusinessSelector />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {selectedBusiness?.type === "triplek" && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Barbershop
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {triplekMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {selectedBusiness?.type === "swan" && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Water Distribution
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {swanMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col gap-3">
          <div className="text-xs text-muted-foreground">{user?.email}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
