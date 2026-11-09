"use client";

import { authService } from "@/services/auth.service";
import { setClientAuthToken } from "@/lib/auth-cookies";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const getSafeRedirectPath = (redirectPath: string | null) => {
  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return "/dashboard";
  }

  return redirectPath;
};

const getDashboardPath = (role?: string) => {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }

  if (role === "OWNER") {
    return "/owner/dashboard";
  }

  if (role === "MECHANIC") {
    return "/mechanic/dashboard";
  }

  return "/dashboard";
};

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const completeGoogleLogin = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("accessToken");
      const redirectPath = getSafeRedirectPath(hashParams.get("redirect"));

      if (!accessToken) {
        setError("Google login failed. Please try again.");
        router.replace("/login?error=oauth_failed");
        return;
      }

      setClientAuthToken(accessToken);
      window.history.replaceState(null, "", "/auth/google/callback");

      try {
        const meRes = await authService.getMe();
        const role = meRes?.data?.role;

        if (role === "ADMIN") {
          const target = redirectPath && redirectPath.startsWith("/admin") ? redirectPath : "/admin/dashboard";
          router.replace(target);
        } else if (role === "OWNER") {
          const target = redirectPath && redirectPath.startsWith("/owner") ? redirectPath : "/owner/dashboard";
          router.replace(target);
        } else if (role === "MECHANIC") {
          const target = redirectPath && redirectPath.startsWith("/mechanic") ? redirectPath : "/mechanic/dashboard";
          router.replace(target);
        } else {
          const target = redirectPath && !redirectPath.startsWith("/owner") && !redirectPath.startsWith("/mechanic") && !redirectPath.startsWith("/admin") ? redirectPath : "/dashboard";
          router.replace(target);
        }
      } catch {
        router.replace("/dashboard");
      }
    };

    completeGoogleLogin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">Signing you in</h1>
        <p className="text-sm font-medium text-muted-foreground">
          {error || "Finishing Google authentication..."}
        </p>
      </div>
    </div>
  );
}
