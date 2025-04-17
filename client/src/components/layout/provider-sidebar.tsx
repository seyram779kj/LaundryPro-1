import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";

type SidebarItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

export default function ProviderSidebar({ mobile = false }: { mobile?: boolean }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarItems: { section: string; items: SidebarItem[] }[] = [
    {
      section: "Dashboard",
      items: [
        {
          title: "Overview",
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/provider/dashboard",
        },
        {
          title: "Orders",
          icon: <ClipboardList className="h-5 w-5" />,
          href: "/provider/orders",
        },
        {
          title: "Performance",
          icon: <BarChart className="h-5 w-5" />,
          href: "/provider/performance",
        },
        {
          title: "Communication",
          icon: <MessageSquare className="h-5 w-5" />,
          href: "/provider/communication",
        },
      ],
    },
    {
      section: "Settings",
      items: [
        {
          title: "Profile",
          icon: <User className="h-5 w-5" />,
          href: "/provider/profile",
        },
        {
          title: "Settings",
          icon: <Settings className="h-5 w-5" />,
          href: "/provider/settings",
        },
      ],
    },
  ];

  const sidebarClassName = cn(
    "bg-gray-900 text-white flex-shrink-0 flex flex-col h-full",
    mobile ? "w-full" : "w-64 hidden md:flex"
  );

  return (
    <div className={sidebarClassName}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center">
          <div className="text-xl font-bold">
            WashConnect<span className="text-sm font-normal ml-1">Pro</span>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="mt-6 px-2">
          {sidebarItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">
                {section.section}
              </div>
              {section.items.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "group flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors",
                        isActive && "bg-primary text-white"
                      )}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="px-6 py-4 border-t border-gray-800">
        {user && (
          <div className="flex flex-col">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-foreground flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
