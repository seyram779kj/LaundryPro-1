import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, User, Package, LogOut, History } from "lucide-react";
import { useState } from "react";

export default function ClientHeader() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-primary font-bold text-xl cursor-pointer">WashConnect</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </span>
            </Link>
            <Link href="/order">
              <span className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Services
              </span>
            </Link>
            <Link href="/orders">
              <span className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                My Orders
              </span>
            </Link>
            <Link href="/profile">
              <span className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Profile
              </span>
            </Link>
          </nav>
          
          {/* Authentication Controls */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <div className="w-full flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <div className="w-full flex items-center">
                        <History className="mr-2 h-4 w-4" />
                        <span>Order History</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/order">
                      <div className="w-full flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Place Order</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/auth">
                  <Button className="ml-4">Sign up</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <span className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
                Home
              </span>
            </Link>
            <Link href="/order">
              <span className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
                Services
              </span>
            </Link>
            <Link href="/orders">
              <span className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
                My Orders
              </span>
            </Link>
            <Link href="/profile">
              <span className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">
                Profile
              </span>
            </Link>
            {user ? (
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Button>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link href="/auth">
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link href="/auth">
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
