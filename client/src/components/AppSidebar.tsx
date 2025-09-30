import { Home, Settings, TrendingUp, Users, UserPlus, Workflow } from "lucide-react";
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

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Teams",
    url: "/teams", 
    icon: Users,
  },
  {
    title: "Team Members",
    url: "/team-members", 
    icon: UserPlus,
  },
  {
    title: "Work Items",
    url: "/work-items",
    icon: Workflow,
  },
  {
    title: "Capacity Planning",
    url: "/priorities",
    icon: TrendingUp,
  },
];

const settingsItems = [
  {
    title: "Time Off",
    url: "/availability",
    icon: Settings,
  },
];

interface AppSidebarProps {}

export default function AppSidebar({}: AppSidebarProps) {
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