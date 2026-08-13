"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await authService.resetPassword({ email, otp, newPassword });
      if (response?.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        window.dispatchEvent(new Event("storage"));
      }
      setSuccess("Password reset successfully. Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Reset password failed:", err);
      setError(err.response?.data?.message || "Failed to process request. Please try again.");
      setLoading(false);
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
          <Label htmlFor="otp" className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">OTP</Label>
          <Input 
            id="otp" 
            type="text" 
            placeholder="Enter OTP from email" 
            required 
            autoComplete="off"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="newPassword" className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">New Password</Label>
          <Input 
            id="newPassword" 
            type="password" 
            placeholder="Enter new password" 
            required 
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-14 bg-primary hover:bg-[#1a1a1a] text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-all duration-300 flex items-center justify-center gap-2 mt-4" 
          disabled={loading || !!success}
        >
          {loading ? "Processing..." : "Reset Password"} <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-white rounded-sm shadow-2xl p-8 md:p-12 border-t-4 border-primary">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">Reset Password</h1>
        <p className="text-gray-500 font-medium text-sm">Enter the OTP sent to your email and your new password</p>
      </div>
      
      <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
      
      <div className="text-center text-sm font-medium text-gray-500 mt-8 pt-6 border-t border-gray-100">
        Remember your password?{" "}
        <Link href="/login" className="font-extrabold text-primary hover:text-[#1a1a1a] uppercase tracking-wider transition-colors ml-1">
          Sign In
        </Link>
      </div>
    </div>
  );
}
