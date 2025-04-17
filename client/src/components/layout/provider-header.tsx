import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import ProviderSidebar from "./provider-sidebar";

export default function ProviderHeader() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
            <span className="ml-2 text-xl font-semibold text-gray-800">WashConnect Pro</span>
          </div>
          
          <div className="flex items-center ml-auto">
            <div className="relative max-w-xs w-full hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex items-center ml-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-4 w-4 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">3</span>
            </Button>
            
            <div className="ml-4 relative">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  {user?.name.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            <ProviderSidebar mobile={true} />
          </div>
        </div>
      )}
    </>
  );
}
