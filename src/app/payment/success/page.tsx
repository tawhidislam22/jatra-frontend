"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { paymentService } from "@/services/payment.service";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (sessionId) {
      paymentService.verifyPayment(sessionId)
        .catch(err => {
          console.warn("Payment verification status check:", err?.message || err);
        })
        .finally(() => setVerifying(false));
    } else {
      setVerifying(false);
    }
  }, [sessionId]);

  if (verifying) {
    return (
      <div className="bg-muted/40 min-h-screen pt-24 pb-32 flex justify-center items-center px-4">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-muted/40 min-h-screen pt-24 pb-32 flex justify-center items-center px-4">
      <div className="bg-card rounded-sm shadow-xl p-10 md:p-16 max-w-lg w-full text-center border-t-4 border-emerald-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tight">Payment Successful</h1>
        
        <p className="text-muted-foreground mb-8 font-medium leading-loose text-sm">
          Thank you for your payment! Your transaction has been completed successfully and your reservation is now confirmed. We've sent a receipt and invoice to your email.
        </p>

        <div className="bg-muted/40 border border-border p-6 rounded-sm mb-8 text-left">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">What's Next?</p>
          <p className="text-sm text-gray-700">
            You can view the details of your reservation and manage your bookings directly from your dashboard.
          </p>
        </div>

        <Link href="/dashboard/payments">
          <Button className="w-full h-14 bg-primary hover:bg-zinc-800 text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-colors duration-300 shadow-lg flex items-center justify-center gap-2">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
