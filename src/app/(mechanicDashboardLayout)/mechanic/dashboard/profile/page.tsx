"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Wrench, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MechanicProfilePage() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "New password and confirmation do not match." });
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword({ oldPassword, newPassword });
      setMessage({ type: 'success', text: "Password changed successfully!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Failed to change password:", err);
      setMessage({ type: 'error', text: err?.response?.data?.message || "Failed to update password. Please check your old password." });
    } finally {
      setLoading(false);
    }
  };

  const mechanicSkills = [
    "Engine Diagnostics & Repair",
    "Brake System Maintenance",
    "Oil & Filter Servicing",
    "Transmission & Clutch",
    "Electrical System & Battery",
    "Preventative Maintenance & Inspection",
    "Suspension & Steering",
    "Tire Mounting & Alignment"
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b pb-5">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
          Mechanic Profile & Credentials
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm font-medium">
          Personal technician profile, workshop assignment, and account security
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-card border-2 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b pb-6">
          <div className="w-20 h-20 rounded-full bg-amber-600 text-white font-black text-3xl flex items-center justify-center shadow-md">
            {(user?.fullName || user?.name || "M").charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                Certified Mechanic
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Active Account
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase text-foreground">
              {user?.fullName || user?.name || "Mechanic"}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              Employed at: <strong className="text-foreground">{user?.employedAtCenter?.name || "Jatra Workshop"}</strong>
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600" /> Email Address
            </span>
            <p className="text-sm font-bold text-foreground">{user?.email || "No email"}</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" /> Phone Number
            </span>
            <p className="text-sm font-bold text-foreground">{user?.phone || "Not provided"}</p>
          </div>
        </div>

        {/* Skills & Specializations */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-amber-600" /> Certified Skills & Services
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {mechanicSkills.map((skill, i) => (
              <div 
                key={i} 
                className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] font-bold text-amber-950 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Password Change Card */}
      <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b pb-4">
          <Key className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
            Change Password & Security
          </h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Current Password
            </Label>
            <Input 
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              New Password
            </Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="rounded-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Confirm New Password
            </Label>
            <Input 
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="rounded-sm"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-xs tracking-wider rounded-sm h-10 px-6 mt-2"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
