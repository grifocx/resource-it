import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '../AppSidebar';

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar onQuickAction={(action) => console.log('Quick action:', action)} />
        <div className="flex-1 p-6 bg-background">
          <p className="text-muted-foreground">Sidebar content example</p>
        </div>
      </div>
    </SidebarProvider>
  );
}