"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Lock, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth.service";
import { User } from "@/types/jatra";

export default function OwnerSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");

  // Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        if (response?.data) {
          setUser(response.data);
          setFullName(response.data.fullName || response.data.name || "");
          setPhone(response.data.phone || "");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">
        Loading Settings...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-8 max-w-2xl">
        {/* Profile Section */}
        <div className="bg-card border rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="w-full bg-gray-100 border border-gray-200 text-gray-500 p-4 font-semibold outline-none text-sm rounded-sm cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
              />
            </div>
            {profileSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-sm border border-emerald-100">
                {profileSuccess}
              </div>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-card border rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">Current Password</Label>
              <div className="relative">
                <Input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-4 pr-12 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-4 pr-12 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-sm border border-red-100">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-sm border border-emerald-100">
                {passwordSuccess}
              </div>
            )}

            <Button
              type="submit"
              disabled={passwordLoading}
              className="bg-primary hover:bg-[#1a1a1a] text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[11px] h-12 px-8 transition-colors"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
