import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Team from "@/pages/Team";
import Priorities from "@/pages/Priorities";
import Availability from "@/pages/Availability";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/team" component={Team} />
      <Route path="/priorities" component={Priorities} />
      <Route path="/availability" component={Availability} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  // Custom sidebar width for IT resource management application
  const style = {
    "--sidebar-width": "18rem",       // Slightly wider for navigation
    "--sidebar-width-icon": "3rem",   // Default icon width
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar onQuickAction={(action: string) => console.log('Quick action:', action)} />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}