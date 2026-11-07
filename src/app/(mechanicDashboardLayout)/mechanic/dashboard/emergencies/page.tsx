"use client";

import { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  ShieldAlert, 
  ExternalLink,
  PlayCircle,
  CheckCheck
} from "lucide-react";
import { emergencyService } from "@/services/emergency.service";
import { Button } from "@/components/ui/button";

export default function MechanicEmergenciesPage() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadEmergencies = async () => {
    setLoading(true);
    try {
      const res = await emergencyService.getEmergencies();
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setEmergencies(raw);
    } catch (err) {
      console.error("Failed to load emergency tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setMessage(null);
    try {
      await emergencyService.updateStatus(id, { status: newStatus });
      setMessage({ type: 'success', text: `Emergency request status updated to ${newStatus} successfully!` });
      await loadEmergencies();
    } catch (err: any) {
      console.error("Failed to update emergency status:", err);
      setMessage({ type: 'error', text: err?.response?.data?.message || "Failed to update emergency status." });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredEmergencies = emergencies.filter((em) => {
    if (statusFilter === "ALL") return true;
    return em.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded animate-pulse">
              Emergency Dispatch
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground mt-1">
            Emergency Breakdown Calls
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Respond to roadside vehicle breakdowns with GPS navigation and direct customer support
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 px-3 py-1.5 rounded-sm">
            Active Calls: {emergencies.filter(e => e.status !== 'RESOLVED' && e.status !== 'CANCELLED').length}
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
          {message.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded text-xs font-extrabold uppercase tracking-wider transition-colors ${statusFilter === st ? 'bg-red-600 text-white shadow-sm' : 'bg-card border text-muted-foreground hover:bg-muted'}`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Emergency Cards */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-bold uppercase text-xs tracking-wider animate-pulse">
          Loading breakdown calls...
        </div>
      ) : filteredEmergencies.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-foreground uppercase">No Breakdown Calls Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {statusFilter !== 'ALL'
              ? `No emergency assistance requests with status '${statusFilter}'.`
              : "All emergency breakdown calls for your center are currently resolved."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEmergencies.map((em) => {
            const hasCoords = em.latitude && em.longitude;
            const mapsUrl = hasCoords ? `https://www.google.com/maps?q=${em.latitude},${em.longitude}` : null;

            return (
              <div 
                key={em.id} 
                className={`bg-card border-2 rounded-xl p-6 shadow-sm space-y-4 transition-all flex flex-col justify-between ${em.status === 'PENDING' ? 'border-red-500 bg-red-50/20' : 'border-border hover:border-amber-400'}`}
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 border-b pb-3">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded ${
                        em.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        em.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        em.status === 'ACCEPTED' ? 'bg-amber-100 text-amber-800' : 'bg-red-600 text-white'
                      }`}>
                        {em.status}
                      </span>
                      <h2 className="text-base font-extrabold text-foreground uppercase mt-2">
                        {em.issueDescription || "Roadside Breakdown Assistance"}
                      </h2>
                    </div>

                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(em.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Customer Info & Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3 text-red-600" /> Customer Name
                      </span>
                      <p className="font-bold text-foreground">
                        {em.customer?.fullName || em.customer?.name || "Customer in need"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {em.customer?.email || "No email"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3 text-red-600" /> Emergency Phone
                      </span>
                      {em.customer?.phone ? (
                        <a href={`tel:${em.customer.phone}`} className="font-bold text-red-600 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {em.customer.phone}
                        </a>
                      ) : (
                        <p className="font-bold text-muted-foreground">Not provided</p>
                      )}
                    </div>
                  </div>

                  {/* GPS & Navigation */}
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-600" /> GPS Breakdown Location
                      </span>
                      <p className="font-mono text-xs font-bold text-foreground">
                        {hasCoords ? `LAT: ${Number(em.latitude).toFixed(5)}, LNG: ${Number(em.longitude).toFixed(5)}` : "Location info attached"}
                      </p>
                    </div>

                    {mapsUrl && (
                      <a 
                        href={mapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-sm shrink-0"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Navigate <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Mechanic Actions */}
                <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-2 mt-4">
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Emergency ID: #{em.id?.slice(0, 8)}
                  </span>

                  <div className="flex items-center gap-2">
                    {em.status === 'PENDING' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStatusUpdate(em.id, 'ACCEPTED')}
                        disabled={updatingId === em.id}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold uppercase tracking-wider h-8"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept Call
                      </Button>
                    )}

                    {(em.status === 'ACCEPTED' || em.status === 'PENDING') && (
                      <Button 
                        size="sm"
                        onClick={() => handleStatusUpdate(em.id, 'IN_PROGRESS')}
                        disabled={updatingId === em.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider h-8"
                      >
                        <PlayCircle className="w-3.5 h-3.5 mr-1" /> En Route / At Site
                      </Button>
                    )}

                    {em.status === 'IN_PROGRESS' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStatusUpdate(em.id, 'RESOLVED')}
                        disabled={updatingId === em.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider h-8"
                      >
                        <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                      </Button>
                    )}

                    {em.status === 'RESOLVED' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Breakdown Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
