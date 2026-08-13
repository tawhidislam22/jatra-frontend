"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await authService.register({ fullName, email, phone, password });
      if (response?.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        window.dispatchEvent(new Event("storage"));
      }
      // Redirect to OTP verification page instead of dashboard
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || "Failed to register. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-2xl p-8 md:p-12 border-t-4 border-primary">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">Create an Account</h1>
        <p className="text-gray-500 font-medium text-sm">Join Jatra to rent vehicles or book services</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold uppercase tracking-wider rounded-sm border border-red-100">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Full Name</Label>
          <Input 
            id="name" 
            placeholder="JOHN DOE" 
            required 
            autoComplete="off"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="JOHN@EXAMPLE.COM" 
            required 
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Phone Number</Label>
          <Input 
            id="phone" 
            type="tel" 
            placeholder="+1234567890" 
            required 
            autoComplete="off"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Password</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-14 bg-primary hover:bg-[#1a1a1a] text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-all duration-300 flex items-center justify-center gap-2 mt-4" 
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"} <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      
      <div className="text-center text-sm font-medium text-gray-500 mt-8 pt-6 border-t border-gray-100">
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-primary hover:text-[#1a1a1a] uppercase tracking-wider transition-colors ml-1">
          Sign In
        </Link>
      </div>
    </div>
  );
}
