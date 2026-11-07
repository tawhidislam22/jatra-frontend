"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert, MapPin, PhoneCall, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRequested(true);
    }, 1500);
  };

  return (
    <div className="bg-muted/40 min-h-screen pb-32">
      {/* Zauto Style Header */}
      <div 
        className="py-24 mb-16 relative overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3166&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-[#E60000]/90 z-0 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/40 z-0" />
        {/* Decorative background text */}
        <motion.div 
          className="absolute top-1/2 left-0 -translate-y-1/2 text-[150px] font-black text-black/10 select-none z-0 tracking-tighter uppercase whitespace-nowrap"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          SOS
        </motion.div>
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-between">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-bold uppercase tracking-[3px] text-xs flex items-center gap-2">
              <span className="w-8 h-[2px] bg-card"></span>
              24/7 Support
            </h3>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase tracking-tight flex items-center gap-4">
              <ShieldAlert className="w-16 h-16 text-white animate-pulse" />
              Emergency
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          className="bg-card border-t-4 border-[#E60000] rounded-sm p-8 md:p-12 text-center shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Accent block */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E60000]/5 rounded-bl-[100px] z-0" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground uppercase">
              Immediate Response Required?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
              If you are in a life-threatening situation, please call your local authorities immediately.
              For roadside assistance, breakdowns, or accidents, request our emergency response team below.
            </p>

            {requested ? (
              <motion.div 
                className="bg-muted/40 rounded-sm p-10 border border-border shadow-sm max-w-lg mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-20 h-20 bg-[#E60000]/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#E60000]/30">
                   <PhoneCall className="w-8 h-8 text-[#E60000] animate-bounce" />
                </div>
                <h3 className="text-3xl font-extrabold text-foreground mb-2 uppercase tracking-tight">Team Dispatched!</h3>
                <p className="text-muted-foreground mb-8 font-medium text-[15px]">
                  Our nearest emergency response unit is on the way to your location.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E60000] bg-[#E60000]/10 py-4 rounded-sm border border-[#E60000]/20">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Stay safe. We will call you shortly.</span>
                </div>
                <Button 
                  className="mt-8 bg-transparent border-2 border-gray-300 text-muted-foreground hover:bg-zinc-800 hover:text-white hover:border-[#1a1a1a] rounded-sm font-bold uppercase tracking-widest text-[11px] h-12 px-8 transition-colors"
                  onClick={() => setRequested(false)}
                >
                  Cancel Request
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-muted/40 rounded-sm p-8 border border-border text-left max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#E60000]" /> Your Current Location
                  </label>
                  <input 
                    className="w-full bg-card border border-border text-foreground p-4 font-semibold outline-none text-sm focus:border-[#E60000] transition-colors rounded-sm shadow-sm" 
                    placeholder="e.g. Highway 61, near exit 4" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-[#E60000]" /> Describe the Issue
                  </label>
                  <textarea 
                    className="w-full bg-card border border-border text-foreground p-4 font-semibold outline-none text-sm min-h-[140px] resize-none focus:border-[#E60000] transition-colors rounded-sm shadow-sm" 
                    placeholder="Engine failure, flat tire, accident..." 
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-[#E60000] hover:bg-zinc-800 text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-colors duration-300 shadow-md"
                  disabled={loading}
                >
                  {loading ? "Transmitting..." : "Send SOS Signal"}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
