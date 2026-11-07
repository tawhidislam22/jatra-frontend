"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="bg-muted/40 min-h-screen pt-24 pb-32 flex justify-center items-center px-4">
      <div className="bg-card rounded-sm shadow-xl p-10 md:p-16 max-w-lg w-full text-center border-t-4 border-red-500">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tight">Payment Cancelled</h1>
        
        <p className="text-muted-foreground mb-8 font-medium leading-loose text-sm">
          Your payment process was interrupted or cancelled. No charges have been made to your account. You can return to our site and try again when you're ready.
        </p>

        <Link href="/vehicles">
          <Button className="w-full h-14 bg-card border-2 border-[#1a1a1a] text-foreground hover:bg-zinc-800 hover:text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-colors duration-300 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to Vehicles
          </Button>
        </Link>
      </div>
    </div>
  );
}
