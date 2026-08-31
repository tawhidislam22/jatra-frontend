"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, Suspense, useEffect } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const redirectParam = searchParams.get("redirect");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes timer
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await authService.verifyEmail({ email, otp });
      setSuccess(`Email verified successfully! Redirecting...`);
      setTimeout(() => {
        router.push(redirectParam ? `/${redirectParam}` : "/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError(err.response?.data?.message || "Failed to verify email. Please check your OTP.");
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Please provide an email address first.");
      return;
    }
    setResending(true);
    setError("");
    setSuccess("");
    
    try {
      await authService.resendOTP({ email });
      setSuccess("A new OTP has been sent to your email.");
      setTimeLeft(120); // Reset timer on success
    } catch (err: any) {
      console.error("Resend OTP failed:", err);
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold uppercase tracking-wider rounded-sm border border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm font-bold uppercase tracking-wider rounded-sm border border-green-100">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="JOHN@EXAMPLE.COM" 
            required 
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="otp" className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Verification OTP</Label>
          <Input 
            id="otp" 
            type="text" 
            placeholder="Enter the 6-digit OTP" 
            required 
            autoComplete="off"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm text-center tracking-widest text-lg"
            maxLength={6}
          />
        </div>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            type="submit" 
            className="w-full h-14 bg-primary hover:bg-[#1a1a1a] text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-all duration-300 flex items-center justify-center gap-2" 
            disabled={loading || !!success.includes("Redirecting")}
          >
            {loading ? "Verifying..." : "Verify Email"} <ArrowRight className="w-4 h-4" />
          </Button>

          <Button 
            type="button" 
            variant="outline"
            onClick={handleResendOTP}
            className="w-full h-14 border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-all duration-300 flex items-center justify-center gap-2" 
            disabled={resending || loading || !!success.includes("Redirecting") || timeLeft > 0}
          >
            {resending 
              ? "Sending..." 
              : timeLeft > 0 
                ? `Resend OTP in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` 
                : "Resend OTP"} 
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </form>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="bg-white rounded-sm shadow-2xl p-8 md:p-12 border-t-4 border-primary">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">Verify Email</h1>
        <p className="text-gray-500 font-medium text-sm">Please enter the OTP sent to your email to continue</p>
      </div>
      
      <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>

      <div className="text-center text-sm font-medium text-gray-500 mt-8 pt-6 border-t border-gray-100">
        Changed your mind?{" "}
        <Link href="/login" className="font-extrabold text-primary hover:text-[#1a1a1a] uppercase tracking-wider transition-colors ml-1">
          Sign In
        </Link>
      </div>
    </div>
  );
}
