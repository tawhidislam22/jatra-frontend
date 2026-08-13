"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CarFront } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  
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
        </div>
      </div>
    </header>
  );
}
