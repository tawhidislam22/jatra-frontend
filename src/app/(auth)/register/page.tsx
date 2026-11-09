"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login/google?redirect=${encodeURIComponent("/dashboard")}`;
  };

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
    <div className="bg-card rounded-sm shadow-2xl p-8 md:p-12 border-t-4 border-primary">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">Create an Account</h1>
        <p className="text-muted-foreground font-medium text-sm">Join Jatra to rent vehicles or book services</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold uppercase tracking-wider rounded-sm border border-red-100">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">Full Name</Label>
          <Input 
            id="name" 
            placeholder="JOHN DOE" 
            required 
            autoComplete="off"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-muted/40 border border-border text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="JOHN@EXAMPLE.COM" 
            required 
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-muted/40 border border-border text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">Phone Number</Label>
          <Input 
            id="phone" 
            type="tel" 
            placeholder="+1234567890" 
            required 
            autoComplete="off"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-muted/40 border border-border text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              required 
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-muted/40 border border-border text-foreground p-6 pr-12 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-14 bg-primary hover:bg-zinc-800 text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-all duration-300 flex items-center justify-center gap-2 mt-4" 
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"} <ArrowRight className="w-4 h-4" />
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          onClick={handleGoogleLogin}
          className="w-full h-14 bg-card border border-border text-gray-700 hover:bg-muted/60 rounded-sm font-extrabold uppercase tracking-[1px] text-[13px] transition-all duration-300 flex items-center justify-center gap-3"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </Button>
      </form>
      
      <div className="text-center text-sm font-medium text-muted-foreground mt-8 pt-6 border-t border-border">
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-primary hover:text-foreground uppercase tracking-wider transition-colors ml-1">
          Sign In
        </Link>
      </div>
      <div className="text-center text-xs font-medium text-muted-foreground mt-3">
        Own an automotive business?{" "}
        <Link href="/register-owner" className="font-bold text-foreground hover:text-primary uppercase tracking-wider transition-colors">
          Register as Owner
        </Link>
      </div>
    </div>
  );
}
