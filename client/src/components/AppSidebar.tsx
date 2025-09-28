import { Calendar, Clock, Home, Settings, TrendingUp, Users, Workflow, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Team",
    url: "/team", 
    icon: Users,
  },
  {
    title: "Work Items",
    url: "/work-items",
    icon: Workflow,
  },
  {
    title: "Priorities",
    url: "/priorities",
    icon: TrendingUp,
  },
  {
    title: "Time Tracking", 
    url: "/time-tracking",
    icon: Clock,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: Calendar,
  },
];

const settingsItems = [
  {
    title: "My Availability",
    url: "/availability",
    icon: Settings,
  },
];

interface AppSidebarProps {
  onQuickAction?: (action: string) => void;
}

export default function AppSidebar({ onQuickAction }: AppSidebarProps) {
  const [location] = useLocation();

  const isActive = (url: string) => {
    if (url === "/" && location === "/") return true;
    if (url !== "/" && location.startsWith(url)) return true;
    return false;
  };

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>IT Resource Manager</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    data-testid={`nav-link-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <Button 
              size="sm" 
              className="w-full justify-start"
              onClick={() => {
                onQuickAction?.('log-time');
                console.log('Quick action: log time');
              }}
              data-testid="button-quick-log-time"
            >
              <Clock className="h-4 w-4 mr-2" />
              Log Time
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="w-full justify-start" 
              onClick={() => {
                onQuickAction?.('update-availability');
                console.log('Quick action: update availability');
              }}
              data-testid="button-quick-availability"
            >
              <Settings className="h-4 w-4 mr-2" />
              Update Availability
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onQuickAction?.('add-work-item');
                console.log('Quick action: add work item');
              }}
              data-testid="button-quick-add-work"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Work Item
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Personal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                    data-testid={`nav-link-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}