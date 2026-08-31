"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";

export default function RegisterOwnerPage() {
  const router = useRouter();

  // If already logged in, skip registration and go straight to onboarding
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authService.getMe();
        if (res?.data) {
          router.push('/onboarding');
        }
      } catch (err) {
        // Not logged in, stay on registration page
      }
    };
    checkAuth();
  }, [router]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (response?.token) {
        localStorage.setItem("token", response.token);
      }

      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&redirect=onboarding`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-2xl p-8 md:p-12 border-t-4 border-primary">
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-tight font-extrabold text-[#1a1a1a] mb-2">Register Your Business</h1>
        <p className="text-gray-500 font-medium">Create an owner account to manage your automotive center</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold uppercase tracking-wider rounded-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400" htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-300 shadow-sm hover:border-gray-400 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400" htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-300 shadow-sm hover:border-gray-400 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400" htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-300 shadow-sm hover:border-gray-400 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>

        <div className="space-y-2 relative">
          <Label className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400" htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-300 shadow-sm hover:border-gray-400 text-[#1a1a1a] p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1a1a]"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-[#1a1a1a] text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] h-14"
        >
          {isLoading ? "Creating account..." : "Register"}
        </Button>
      </form>

      <div className="mt-8 space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-[#1a1a1a] rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] h-14 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col space-y-3">
        <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors text-center uppercase tracking-wider">
          Already have an account? &rarr; Sign In
        </Link>
        <Link href="/register" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors text-center uppercase tracking-wider">
          Looking for car rental? &rarr; Register as Customer
        </Link>
      </div>
    </div>
  );
}
