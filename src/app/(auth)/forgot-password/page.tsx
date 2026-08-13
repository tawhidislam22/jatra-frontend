"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await authService.forgetPassword({ email });
      setSuccess("Password reset OTP sent to email successfully. Redirecting...");
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      console.error("Forgot password failed:", err);
      setError(err.response?.data?.message || "Failed to process request. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-2xl p-8 md:p-12 border-t-4 border-primary">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">Forgot Password</h1>
        <p className="text-gray-500 font-medium text-sm">Enter your email address to receive a reset OTP</p>
      </div>
      
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
        
        <Button 
          type="submit" 
          className="w-full h-14 bg-primary hover:bg-[#1a1a1a] text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-all duration-300 flex items-center justify-center gap-2 mt-4" 
          disabled={loading || !!success}
        >
          {loading ? "Processing..." : "Send Reset OTP"} <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      
      <div className="text-center text-sm font-medium text-gray-500 mt-8 pt-6 border-t border-gray-100">
        Remember your password?{" "}
        <Link href="/login" className="font-extrabold text-primary hover:text-[#1a1a1a] uppercase tracking-wider transition-colors ml-1">
          Sign In
        </Link>
      </div>
    </div>
  );
}
