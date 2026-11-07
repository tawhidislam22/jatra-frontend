"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Search, 
  MapPin, 
  Phone, 
  Building2, 
  CheckCircle2, 
  Clock, 
  User, 
  Navigation,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emergencyService } from "@/services/emergency.service";

export default function AdminEmergenciesPage() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const res = await emergencyService.getEmergencies();
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setEmergencies(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load emergencies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await emergencyService.updateStatus(id, newStatus);
      await fetchEmergencies();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = emergencies.filter((em) => {
    const matchesStatus = statusFilter === "ALL" || em.status === statusFilter;
    const matchesSearch = 
      (em.customer?.fullName || em.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (em.center?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (em.issueDescription || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (em.customer?.phone || "").includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  const pendingCount = emergencies.filter(e => e.status === "PENDING").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Emergency Dispatch Monitor
            </h1>
            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/30">
              {pendingCount} Pending Dispatch
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-medium mt-1">
            Real-time roadside emergency assistance dispatch, live coordinates, and dispatch response tracking.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emergency, phone, location..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-10 focus:border-red-500"
            />
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
            {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Loading Emergency Dispatches...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-16 text-center shadow-xl">
          <AlertTriangle className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Emergencies Found</h3>
          <p className="text-zinc-500 text-xs mt-1">No roadside emergency calls match the selected filter.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Distressed Customer</th>
                  <th className="p-4">Assigned Workshop</th>
                  <th className="p-4">Emergency Details</th>
                  <th className="p-4">GPS Coordinates</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Dispatch Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filtered.map((em) => {
                  const statusBadgeClass = 
                    em.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    em.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    em.status === "CANCELLED" ? "bg-zinc-800 text-zinc-400 border-zinc-700" :
                    "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse";

                  return (
                    <tr key={em.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Customer Info */}
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-white text-sm">
                            {em.customer?.fullName || em.customer?.name || "Anonymous Caller"}
                          </p>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-zinc-500" />
                            {em.customer?.phone || "Phone not provided"}
                          </p>
                        </div>
                      </td>

                      {/* Workshop */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-zinc-200">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="font-semibold">{em.center?.name || "Unassigned"}</span>
                        </div>
                        {em.mechanic && (
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            Driver / Mech: {em.mechanic?.fullName || em.mechanic?.name}
                          </p>
                        )}
                      </td>

                      {/* Emergency Issue */}
                      <td className="p-4 max-w-xs">
                        <p className="text-xs text-zinc-300 truncate" title={em.issueDescription}>
                          {em.issueDescription || "Roadside emergency breakdown"}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {em.requestedAt ? new Date(em.requestedAt).toLocaleString() : "Just now"}
                        </p>
                      </td>

                      {/* GPS */}
                      <td className="p-4 text-zinc-300 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-red-400" />
                          <span>{em.latitude?.toFixed(4)}, {em.longitude?.toFixed(4)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${statusBadgeClass}`}>
                          {em.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <select
                          value={em.status}
                          disabled={updatingId === em.id}
                          onChange={(e) => handleStatusUpdate(em.id, e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
