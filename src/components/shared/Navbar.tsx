"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CarFront, LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { User } from "@/types/jatra";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        if (response && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        // User not logged in, silently ignore
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };
  
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname?.startsWith(path);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Workshops", path: "/centers" },
    { name: "Emergency", path: "/emergency" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b-2 border-primary">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <div className="flex gap-2 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-primary group-hover:scale-110 transition-transform duration-300">
              <CarFront className="h-8 w-8" strokeWidth={2} />
            </div>
              <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tighter text-[#1a1a1a] leading-none uppercase mt-1">
                Jatra
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">
                Car Rental
              </span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-10 text-[13px] font-bold uppercase tracking-[2px] text-[#1a1a1a]">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link 
                key={link.path}
                href={link.path} 
                className={`transition-colors relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 ${active ? 'text-primary after:w-full' : 'hover:text-primary after:w-0 hover:after:w-full'}`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-4">
          {!loading && (
            user ? (
              <div className="flex items-center gap-4">
                <Link href={user?.role === 'OWNER' ? "/owner/dashboard" : "/dashboard"}>
                  <Button className="font-bold uppercase tracking-wider text-[11px] h-10 px-6 rounded-sm bg-primary hover:bg-[#1a1a1a] text-white border-none transition-colors duration-300">
                    {user?.role === 'OWNER' ? "Owner Dashboard" : "Dashboard"}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 outline-none focus:outline-none">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer">
                        {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard/profile" className="flex items-center w-full">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {user?.role !== 'OWNER' && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/onboarding" className="flex items-center w-full text-primary font-bold">
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                          <span>Become a Partner</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 font-medium">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-bold uppercase tracking-wider text-[11px] h-10 px-4 rounded-sm border-2 border-transparent hover:border-[#1a1a1a]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="font-bold uppercase tracking-wider text-[11px] h-10 px-6 rounded-sm bg-primary hover:bg-[#1a1a1a] text-white border-none transition-colors duration-300">
                    Register
                  </Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
