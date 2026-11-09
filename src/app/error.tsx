"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  RotateCcw, 
  Home, 
  ShieldAlert, 
  Wrench, 
  HelpCircle 
} from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-xl w-full text-center space-y-8 bg-card border border-border/80 shadow-2xl rounded-2xl p-8 sm:p-12 relative overflow-hidden">
        {/* Ambient Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 bg-[#E60000]/15 blur-3xl rounded-full pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-[#E60000]/10 border border-[#E60000]/20 flex items-center justify-center text-[#E60000] shadow-inner animate-pulse">
            <AlertTriangle className="w-10 h-10 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 rounded-full text-white shadow-md">
            <Wrench className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Heading & Details */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-red-500/10 text-red-600 border border-red-500/20">
            <ShieldAlert className="w-3 h-3" /> System Diagnostics Error
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Something Went Wrong
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-md mx-auto">
            An unexpected error occurred while loading this section. Our system has logged the issue for inspection.
          </p>

          {error?.digest && (
            <div className="pt-2">
              <span className="inline-block font-mono text-[11px] bg-muted/60 text-muted-foreground px-3 py-1 rounded-md border">
                Error Reference: {error.digest}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[#E60000] hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs h-11 px-6 rounded-sm shadow-md transition-all active:scale-98"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs h-11 px-6 rounded-sm border-border hover:bg-muted"
            >
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Footer Help */}
        <div className="pt-6 border-t text-xs text-muted-foreground flex items-center justify-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          <span>Need help with a booking or service?</span>
          <Link href="/contact" className="text-primary font-bold hover:underline">
            Contact Support &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
