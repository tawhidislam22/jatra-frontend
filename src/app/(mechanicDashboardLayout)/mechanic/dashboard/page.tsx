"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  Calendar, 
  Car, 
  User, 
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { serviceRequestsService } from "@/services/services.service";
import { authService } from "@/services/auth.service";
import { centersService } from "@/services/centers.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MechanicOverviewPage() {
  const { user } = useAuth();

  const { data: servicesRes, isLoading: loadingServices } = useQuery({
    queryKey: ["mechanicRequests"],
    queryFn: () => serviceRequestsService.getRequests(),
    staleTime: 60 * 1000,
  });

  const { data: meRes, isLoading: loadingMe } = useQuery({
    queryKey: ["meProfile"],
    queryFn: () => authService.getMe().catch(() => null),
    staleTime: 5 * 60 * 1000,
  });

  const meUser = meRes?.data || user;
  const centerId = meUser?.employedAtCenterId || user?.employedAtCenterId || meUser?.employedAtCenter?.id;

  const { data: centerRes } = useQuery({
    queryKey: ["mechanicWorkshop", centerId],
    queryFn: () => centerId ? centersService.getCenterById(centerId) : null,
    enabled: !!centerId,
    staleTime: 5 * 60 * 1000,
  });

  const serviceRequests: any[] = servicesRes?.data || (Array.isArray(servicesRes) ? servicesRes : []);
  const workshop = centerRes?.data || meUser?.employedAtCenter || user?.employedAtCenter || null;
  const loading = loadingServices || loadingMe;

  const activeServices = serviceRequests.filter(
    (s) => s.status === "ACCEPTED" || s.status === "IN_PROGRESS" || s.status === "PENDING"
  );
  const inProgressServices = serviceRequests.filter((s) => s.status === "IN_PROGRESS");
  const completedJobs = serviceRequests.filter((s) => s.status === "COMPLETED");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Loading mechanic workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Workshop Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-xl p-6 md:p-8 shadow-lg border-l-8 border-amber-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded">
                Mechanic Workspace
              </span>
              <span className="text-stone-400 text-xs font-medium">Ready for service tasks</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              Welcome back, {user?.fullName || user?.name || "Mechanic"}
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl">
              You are assigned to{" "}
              <strong className="text-amber-400">
                {workshop?.name || "Your Assigned Workshop"}
              </strong>
              {workshop?.address ? ` (${workshop.address})` : ""}. Check your queue below for active repairs and scheduled maintenance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/mechanic/dashboard/assigned-services">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-xs tracking-wider h-11 px-5 rounded-sm">
                <Wrench className="w-4 h-4 mr-2" /> View Queue
              </Button>
            </Link>
            <Link href="/mechanic/dashboard/history">
              <Button variant="outline" className="bg-card/10 hover:bg-card/20 text-white border-white/20 font-bold uppercase text-xs tracking-wider h-11 px-5 rounded-sm">
                <Clock className="w-4 h-4 mr-2 text-amber-400" /> Repair History
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Queue</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-foreground">{activeServices.length}</span>
            <span className="text-[11px] font-bold text-amber-600">Pending & In Progress</span>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">In Progress</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-blue-600">{inProgressServices.length}</span>
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Active Work</span>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jobs Completed</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600">{completedJobs.length}</span>
            <span className="text-[11px] font-bold text-muted-foreground">All-time Repairs</span>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">My Workshop</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground truncate">
              {workshop?.name || "Assigned Workshop"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              {workshop?.address || "Location on file"}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Active Queue & Recently Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned Service Requests */}
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded">
                <Wrench className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">Active Services</h2>
            </div>
            <Link href="/mechanic/dashboard/assigned-services" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeServices.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Wrench className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-muted-foreground">Queue is currently clear</p>
              <p className="text-xs text-muted-foreground">New maintenance requests assigned by your workshop manager will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeServices.slice(0, 4).map((service) => (
                <div key={service.id} className="p-4 rounded-lg bg-card border hover:border-amber-400 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${service.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                        {service.status}
                      </span>
                      <h3 className="font-bold text-sm text-foreground mt-1.5">{service.serviceType || "Automotive Repair"}</h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {service.scheduledDate ? new Date(service.scheduledDate).toLocaleDateString() : "Immediate"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {service.issueDescription || "No issue description provided."}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <Car className="w-3.5 h-3.5 text-amber-600" />
                      {service.vehicle ? `${service.vehicle.brand || service.vehicle.make || ''} ${service.vehicle.model || ''}` : "Vehicle"}
                    </span>
                    <span className="font-semibold text-foreground">
                      Client: {service.customer?.fullName || service.customer?.name || "Customer"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Completed Repairs */}
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">Recently Completed</h2>
            </div>
            <Link href="/mechanic/dashboard/history" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {completedJobs.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-muted-foreground">No completed jobs yet</p>
              <p className="text-xs text-muted-foreground">Completed maintenance tasks will be archived here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedJobs.slice(0, 4).map((service) => (
                <div key={service.id} className="p-4 rounded-lg bg-card border hover:border-emerald-400 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        COMPLETED
                      </span>
                      <h3 className="font-bold text-sm text-foreground mt-1.5">{service.serviceType || "Automotive Repair"}</h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(service.updatedAt || service.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {service.issueDescription || "Service finished successfully."}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      {service.customer?.fullName || service.customer?.name || "Customer"}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      Finished
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
