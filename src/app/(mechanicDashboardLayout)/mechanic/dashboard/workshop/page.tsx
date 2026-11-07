"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Star, 
  User, 
  Wrench, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { centersService } from "@/services/centers.service";
import { authService } from "@/services/auth.service";

export default function MechanicWorkshopPage() {
  const { user } = useAuth();
  const [center, setCenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkshop = async () => {
      setLoading(true);
      try {
        let centerData = user?.employedAtCenter || null;
        let centerId = user?.employedAtCenterId || user?.employedAtCenter?.id;

        if (!centerData || !centerData.admin) {
          try {
            const meRes = await authService.getMe();
            if (meRes?.data?.employedAtCenter) {
              centerData = meRes.data.employedAtCenter;
            }
            if (meRes?.data?.employedAtCenterId) {
              centerId = meRes.data.employedAtCenterId;
            }
          } catch (e) {}
        }

        if (centerId && (!centerData || !centerData.mechanics)) {
          try {
            const res = await centersService.getCenterById(centerId);
            if (res?.data) {
              centerData = res.data;
            }
          } catch (e) {}
        }

        if (!centerData && user?.id) {
          try {
            const allCentersRes = await centersService.getAllCenters();
            const centersList = allCentersRes?.data || [];
            const found = centersList.find((c: any) => 
              c.mechanics?.some((m: any) => m.id === user.id || m.email === user.email)
            );
            if (found) {
              centerData = found;
            }
          } catch (e) {}
        }

        setCenter(centerData);
      } catch (err) {
        console.error("Failed to load workshop details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkshop();
  }, [user]);

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground font-bold uppercase text-xs tracking-wider animate-pulse">
        Loading workshop information...
      </div>
    );
  }

  const workshop = center || user?.employedAtCenter;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b pb-5">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
          My Assigned Workshop
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm font-medium">
          Details and team members of your employer automotive service center
        </p>
      </div>

      {!workshop ? (
        <div className="bg-card border rounded-xl p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-foreground uppercase">No Workshop Assigned</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            You are not currently linked to an active automotive center. Please contact your center owner to link your account.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Center Banner */}
          <div className="bg-card border-2 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Official Workshop
                  </span>
                  {workshop.isApproved && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Center
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-foreground">
                  {workshop.name}
                </h2>
                <p className="text-muted-foreground text-xs flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  {workshop.address || "Address not provided"}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl shrink-0">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-xl">
                    <Star className="w-5 h-5 fill-amber-500" />
                    <span>{Number(workshop.rating || 4.5).toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Rating</span>
                </div>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-600" /> Contact Phone
                </span>
                <p className="text-sm font-bold text-foreground">
                  {workshop.phone || "Not provided"}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-600" /> Center Manager / Admin
                </span>
                <p className="text-sm font-bold text-foreground">
                  {workshop.admin?.fullName || workshop.admin?.name || "Center Admin"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {workshop.admin?.email || "Manager"}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Operating Schedule
                </span>
                <p className="text-sm font-bold text-foreground">
                  8:00 AM &ndash; 8:00 PM
                </p>
                <p className="text-[10px] text-emerald-600 font-bold">Open Daily</p>
              </div>
            </div>

            {/* Services Offered */}
            {workshop.servicesOffered && workshop.servicesOffered.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" /> Workshop Services Offered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {workshop.servicesOffered.map((service: string, i: number) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-xs font-bold uppercase tracking-wider"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mechanics Team Section */}
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                  Fellow Mechanics Team
                </h3>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {(workshop.mechanics?.length || 1)} Staff Members
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {workshop.mechanics && workshop.mechanics.length > 0 ? (
                workshop.mechanics.map((mech: any) => (
                  <div key={mech.id} className={`p-4 rounded-lg border flex items-center gap-3 ${mech.id === user?.id ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300' : 'bg-muted/20'}`}>
                    <div className="w-10 h-10 rounded-full bg-amber-600/10 text-amber-700 font-bold flex items-center justify-center shrink-0">
                      {(mech.fullName || mech.name || "M").charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate text-foreground">
                        {mech.fullName || mech.name || "Mechanic"}
                        {mech.id === user?.id && <span className="ml-1 text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-extrabold">YOU</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {mech.email}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg border bg-amber-50/50 border-amber-300 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-600/10 text-amber-700 font-bold flex items-center justify-center shrink-0">
                    {(user?.fullName || user?.name || "M").charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-foreground">
                      {user?.fullName || user?.name || "Mechanic"} <span className="text-[9px] bg-amber-600 text-white px-1 rounded font-extrabold">YOU</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
