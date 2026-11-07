import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home, Search, Car, Wrench, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-lg w-full text-center space-y-8 bg-card border border-border/80 shadow-2xl rounded-2xl p-8 sm:p-12 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        {/* 404 Road Marker Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Compass className="w-12 h-12 stroke-[1.8] animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <div className="absolute -bottom-1 -right-1 p-2 bg-[#E60000] rounded-full text-white shadow-md">
            <Car className="w-4 h-4" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <span className="inline-block text-xs font-black tracking-widest uppercase bg-muted px-3 py-1 rounded-full text-muted-foreground border">
            Error 404 — Route Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Lost On The Road?
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-sm mx-auto">
            The page or resource you are looking for has been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#E60000] hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs h-11 px-6 rounded-sm shadow-md">
              <Home className="w-4 h-4 mr-2" /> Return Home
            </Button>
          </Link>

          <Link href="/vehicles" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs h-11 px-6 rounded-sm">
              <Search className="w-4 h-4 mr-2" /> Browse Fleet
            </Button>
          </Link>
        </div>

        {/* Links */}
        <div className="pt-6 border-t flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
          <Link href="/centers" className="hover:text-primary transition-colors flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" /> Service Centers
          </Link>
          <span>&bull;</span>
          <Link href="/emergency" className="hover:text-primary transition-colors text-red-600 font-bold">
            Emergency Breakdown
          </Link>
        </div>
      </div>
    </div>
  );
}
