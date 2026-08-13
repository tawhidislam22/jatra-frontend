"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/login";
    }, 1000);
  };

  return (
    <div className="bg-white rounded-sm shadow-2xl p-8 md:p-12 border-t-4 border-primary">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">Create an Account</h1>
        <p className="text-gray-500 font-medium text-sm">Join Jatra to rent vehicles or book services</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Full Name</Label>
          <Input 
            id="name" 
            placeholder="JOHN DOE" 
            required 
            autoComplete="off"
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
