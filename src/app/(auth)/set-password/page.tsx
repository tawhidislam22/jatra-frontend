"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { ArrowRight, Eye, EyeOff, CheckCircle2, Wrench } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const tempParam = searchParams.get("temp") || "";

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
    if (tempParam) {
      setTemporaryPassword(tempParam);
    }
  }, [emailParam, tempParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.setupPassword({
        email,
        temporaryPassword: temporaryPassword || undefined,
        newPassword,
      });

      setSuccess("Account activated and password updated successfully! Redirecting to your dashboard...");
      
      setTimeout(() => {
        router.push("/mechanic/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Password setup failed:", err);
      setError(err?.response?.data?.message || "Failed to set password. Please check your credentials or contact support.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="bg-primary/10 p-2.5 rounded-full text-primary">
          <Wrench className="w-6 h-6" />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold uppercase tracking-wider rounded-sm border border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-bold uppercase tracking-wider rounded-sm border border-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="MECHANIC@EXAMPLE.COM"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-muted/40 border border-border text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tempPassword" className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">
            Temporary / Current Password
          </Label>
          <div className="relative">
            <Input
              id="tempPassword"
              type={showTempPassword ? "text" : "password"}
              placeholder="Enter password from invitation email"
              required
              autoComplete="current-password"
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              className="w-full bg-muted/40 border border-border text-foreground p-6 pr-12 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
            />
            <button
              type="button"
              onClick={() => setShowTempPassword(!showTempPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground focus:outline-none"
            >
              {showTempPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">
            New Permanent Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Choose a strong new password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">
            Confirm New Password
          </Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter new password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-muted/40 border border-border text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-14 bg-primary hover:bg-zinc-800 text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-all duration-300 flex items-center justify-center gap-2 mt-4"
          disabled={loading || !!success}
        >
          {loading ? "Activating..." : "Set Password & Enter Dashboard"} <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </>
  );
}

export default function SetPasswordPage() {
  return (
    <div className="bg-card rounded-sm shadow-2xl p-8 md:p-12 border-t-4 border-primary max-w-md mx-auto my-8">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">Mechanic Activation</h1>
        <p className="text-muted-foreground font-medium text-sm">
          Set your permanent password to activate your mechanic account
        </p>
      </div>

      <Suspense fallback={<div className="text-center p-6 text-muted-foreground font-bold">Loading form...</div>}>
        <SetPasswordForm />
      </Suspense>

      <div className="text-center text-sm font-medium text-muted-foreground mt-8 pt-6 border-t border-border">
        Already set your password?{" "}
        <Link href="/login" className="font-extrabold text-primary hover:text-foreground uppercase tracking-wider transition-colors ml-1">
          Sign In
        </Link>
      </div>
    </div>
  );
}
