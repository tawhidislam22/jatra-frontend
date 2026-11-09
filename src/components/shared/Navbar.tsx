"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CarFront, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NavbarAvatarSkeleton } from "./NavbarAvatarSkeleton";
import { User } from "@/types/jatra";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  initialUser?: User | null;
}

export function Navbar({ initialUser }: NavbarProps) {
  const pathname = usePathname();
  const { user: authUser, isLoading, logout } = useAuth();
  
  // Use auth user if available, fallback to initial server user
  const user = authUser || initialUser;

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname?.startsWith(path);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Workshops", path: "/centers" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md shadow-xs border-b-2 border-primary transition-colors">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <div className="flex gap-2 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-primary group-hover:scale-110 transition-transform duration-300">
              <CarFront className="h-8 w-8" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tighter text-foreground leading-none uppercase mt-1">
                Jatra
              </span>
              <span className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">
                Car Rental
              </span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-8 lg:gap-10 text-[13px] font-bold uppercase tracking-[2px] text-foreground">
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
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {isLoading && !user ? (
            <NavbarAvatarSkeleton />
          ) : user ? (
            (() => {
              const isAdmin = user.role === 'ADMIN';
              const isMechanic = user.role === 'MECHANIC';
              const isOwner = user.role === 'OWNER' || !!user.managedCenter;
              const dashboardHref = isAdmin ? "/admin/dashboard" : (isMechanic ? "/mechanic/dashboard" : (isOwner ? "/owner/dashboard" : "/dashboard"));
              const dashboardLabel = isAdmin ? "Admin Dashboard" : (isMechanic ? "Mechanic Dashboard" : (isOwner ? "Owner Dashboard" : "Dashboard"));

              return (
                <div className="flex items-center gap-3">
                  <Link href={dashboardHref}>
                    <Button className={`font-bold uppercase tracking-wider text-[11px] h-10 px-5 rounded-sm text-white border-none transition-colors duration-300 ${isAdmin ? 'bg-zinc-900 dark:bg-zinc-800 hover:bg-red-600' : 'bg-primary hover:bg-zinc-900 dark:hover:bg-zinc-800'}`}>
                      {dashboardLabel}
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 outline-none focus:outline-none">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-colors cursor-pointer ${isAdmin ? 'bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-700' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white'}`}>
                          {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-foreground">{user.fullName || user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          {isAdmin ? (
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-0.5">
                              Super Admin
                            </span>
                          ) : isMechanic ? (
                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">
                              Mechanic
                            </span>
                          ) : isOwner ? (
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">
                              Owner
                            </span>
                          ) : null}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={isAdmin ? "/admin/dashboard" : (isMechanic ? "/mechanic/dashboard/profile" : (isOwner ? "/owner/dashboard/settings" : "/dashboard/profile"))} className="flex items-center w-full">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>{isAdmin ? "Admin Overview" : (isOwner ? "Settings & Profile" : "Profile")}</span>
                        </Link>
                      </DropdownMenuItem>
                      {!isOwner && !isMechanic && !isAdmin && (
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/onboarding" className="flex items-center w-full text-primary font-bold">
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            <span>Become a Partner</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 font-medium">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })()
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="font-bold uppercase tracking-wider text-[11px] h-10 px-4 rounded-sm border-2 border-transparent hover:border-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-bold uppercase tracking-wider text-[11px] h-10 px-5 rounded-sm bg-primary hover:bg-zinc-900 dark:hover:bg-zinc-800 text-white border-none transition-colors duration-300">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
