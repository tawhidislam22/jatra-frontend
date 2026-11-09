"use client";

import { useState } from "react";
import { 
  Settings, 
  ShieldCheck, 
  Save, 
  Database, 
  CreditCard, 
  Cloud, 
  Mail, 
  CheckCircle2, 
  Sliders, 
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    platformName: "Jatra Automotive Services & Car Rentals",
    serviceRadiusKm: 25,
    baseBookingDeposit: 50,
    platformCommissionPercent: 10,
    autoApproveCenters: false,
    supportEmail: "support@jatra.com",
    supportHotline: "+880 1700-000000"
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Platform Configuration & System Health
          </h1>
          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/30">
            Admin Only
          </span>
        </div>
        <p className="text-zinc-400 text-xs font-medium mt-1">
          Tune global business parameters, workshop dispatch settings, and inspect system service infrastructure.
        </p>
      </div>

      {/* System Infrastructure Health Grid */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black uppercase tracking-[2px] text-zinc-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Platform Infrastructure Diagnostics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* PostgreSQL DB */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs font-bold text-white">PostgreSQL DB</p>
                <p className="text-[10px] text-zinc-500 font-mono">Neon Serverless</p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              Online
            </span>
          </div>

          {/* Stripe Gateway */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs font-bold text-white">Stripe Checkout</p>
                <p className="text-[10px] text-zinc-500 font-mono">Live Sessions</p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              Active
            </span>
          </div>

          {/* Cloudinary CDN */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-white">Cloudinary CDN</p>
                <p className="text-[10px] text-zinc-500 font-mono">Media Uploads</p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              Ready
            </span>
          </div>

          {/* Email Service */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">Resend SMTP</p>
                <p className="text-[10px] text-zinc-500 font-mono">Notification OTP</p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h3 className="text-sm font-black uppercase tracking-[2px] text-zinc-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-red-500" /> Global Business Parameters
          </h3>
          {saved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Parameters saved successfully!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Platform Brand Name</Label>
            <Input
              value={config.platformName}
              onChange={(e) => setConfig({ ...config, platformName: e.target.value })}
              className="bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-11 focus:border-red-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Workshop Search Radius (KM)</Label>
            <Input
              type="number"
              value={config.serviceRadiusKm}
              onChange={(e) => setConfig({ ...config, serviceRadiusKm: parseInt(e.target.value) || 10 })}
              className="bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-11 focus:border-red-500"
            />
            <p className="text-[10px] text-zinc-500">Maximum distance to match nearest workshop center</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Base Workshop Booking Deposit ($)</Label>
            <Input
              type="number"
              value={config.baseBookingDeposit}
              onChange={(e) => setConfig({ ...config, baseBookingDeposit: parseFloat(e.target.value) || 0 })}
              className="bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-11 focus:border-red-500"
            />
            <p className="text-[10px] text-zinc-500">Fixed reservation checkout amount collected for scheduled services</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Platform Commission Take Rate (%)</Label>
            <Input
              type="number"
              value={config.platformCommissionPercent}
              onChange={(e) => setConfig({ ...config, platformCommissionPercent: parseFloat(e.target.value) || 0 })}
              className="bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-11 focus:border-red-500"
            />
            <p className="text-[10px] text-zinc-500">Gross percentage retained from partner center rental & service payouts</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Support Email</Label>
            <Input
              type="email"
              value={config.supportEmail}
              onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
              className="bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-11 focus:border-red-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Customer Support Hotline</Label>
            <Input
              value={config.supportHotline}
              onChange={(e) => setConfig({ ...config, supportHotline: e.target.value })}
              className="bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-11 focus:border-red-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl h-11 px-6 shadow-lg shadow-red-950/50"
          >
            <Save className="w-4 h-4 mr-2" /> Save Global Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
