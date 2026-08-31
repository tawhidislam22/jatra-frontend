"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { User } from "@/types/jatra";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Mail, Phone, MapPin, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        if (response && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and account settings.</p>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="h-32 bg-primary/10 relative">
          <Button variant="outline" size="sm" className="absolute top-4 right-4 bg-white/80 hover:bg-white border-none gap-2">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Button>
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 bg-primary text-white text-4xl font-bold flex items-center justify-center rounded-full border-4 border-card absolute -top-12 shadow-sm">
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-[#1a1a1a]">{user?.fullName || "User Name"}</h3>
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2">
              {user?.role || "CUSTOMER"}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                <Mail className="w-3 h-3 text-primary" /> Email Address
              </label>
              <p className="font-semibold">{user?.email || "No email provided"}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                <Phone className="w-3 h-3 text-primary" /> Phone Number
              </label>
              <p className="font-semibold">{user?.phone || "No phone provided"}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" /> Location
              </label>
              <p className="font-semibold text-muted-foreground italic">Add your address</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
