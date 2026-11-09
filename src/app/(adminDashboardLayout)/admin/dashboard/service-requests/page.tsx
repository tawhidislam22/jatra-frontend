"use client";

import { useState, useEffect } from "react";
import { 
  Wrench, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Building2, 
  User, 
  Car,
  Filter,
  Eye,
  Camera,
  Maximize2,
  ExternalLink,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serviceRequestsService } from "@/services/services.service";

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await serviceRequestsService.getRequests();
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setRequests(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load service requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await serviceRequestsService.updateStatus(id, newStatus);
      await fetchRequests();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesSearch = 
      (r.customer?.fullName || r.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.center?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.serviceType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.issueDescription || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Service Requests Oversight
            </h1>
            <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {requests.length} Requests
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-medium mt-1">
            Nationwide monitoring of workshop bookings, maintenance logs, and vehicle inspection requests.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, center, issue..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-10 focus:border-red-500"
            />
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
            {["ALL", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
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
          Loading Service Requests...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-16 text-center shadow-xl">
          <Wrench className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Service Requests Found</h3>
          <p className="text-zinc-500 text-xs mt-1">No requests match the selected status filter or search criteria.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Customer & Vehicle</th>
                  <th className="p-4">Workshop Center</th>
                  <th className="p-4">Service & Issue</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filtered.map((r) => {
                  const statusBadgeClass = 
                    r.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    r.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    r.status === "ACCEPTED" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    r.status === "CANCELLED" ? "bg-zinc-800 text-zinc-400 border-zinc-700" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20";

                  return (
                    <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Customer & Car */}
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-white text-sm">
                            {r.customer?.fullName || r.customer?.name || "Customer"}
                          </p>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Car className="w-3 h-3 text-zinc-500" />
                            {r.vehicle ? `${r.vehicle.make} ${r.vehicle.model} (${r.vehicle.licensePlate})` : "Vehicle not listed"}
                          </p>
                        </div>
                      </td>

                      {/* Center */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-zinc-200">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="font-semibold">{r.center?.name || "Automotive Center"}</span>
                        </div>
                        {r.mechanic && (
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            Assigned Mech: {r.mechanic?.fullName || r.mechanic?.name}
                          </p>
                        )}
                      </td>

                      {/* Issue & Photos */}
                      <td className="p-4 max-w-xs space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-zinc-900 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-800 inline-block">
                            {r.serviceName || r.serviceType}
                          </span>
                          {r.problemImages && r.problemImages.length > 0 && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Camera className="w-3 h-3" /> {r.problemImages.length}
                            </span>
                          )}
                          {r.completionImages && r.completionImages.length > 0 && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {r.completionImages.length}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-300 truncate" title={r.issueDescription}>
                          {r.issueDescription || "No issue description"}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : "TBD"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${statusBadgeClass}`}>
                          {r.status}
                        </span>
                      </td>

                      {/* Status Selector & Inspect Action */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequest(r)}
                            title="Inspect Photos & Details"
                            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={r.status}
                            disabled={updatingId === r.id}
                            onChange={(e) => handleStatusUpdate(r.id, e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Inspection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative text-zinc-200">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 font-mono">
                Booking ID: {selectedRequest.id}
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                {selectedRequest.serviceName || selectedRequest.serviceType}
              </h2>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-zinc-900 border-zinc-800 text-zinc-300">
                  {selectedRequest.status}
                </span>
                <span className="text-xs text-zinc-400">
                  Scheduled: {new Date(selectedRequest.scheduledDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
            </div>

            {/* Quick Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Customer</span>
                <p className="font-extrabold text-white">{selectedRequest.customer?.fullName || selectedRequest.customer?.name || "Customer"}</p>
                <p className="text-zinc-400 text-[11px]">{selectedRequest.customer?.email || selectedRequest.customer?.phone || "No contact"}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Vehicle</span>
                <p className="font-extrabold text-white">
                  {selectedRequest.vehicle?.make} {selectedRequest.vehicle?.model} ({selectedRequest.vehicle?.year})
                </p>
                <p className="text-zinc-400 text-[11px]">Plate: {selectedRequest.vehicle?.licensePlate}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Workshop & Mechanic</span>
                <p className="font-extrabold text-white">{selectedRequest.center?.name || "Automotive Center"}</p>
                <p className="text-zinc-400 text-[11px]">
                  {selectedRequest.mechanic?.fullName || selectedRequest.mechanic?.name ? `Mech: ${selectedRequest.mechanic.fullName || selectedRequest.mechanic.name}` : "Pending assignment"}
                </p>
              </div>
            </div>

            {/* Side-by-side Photo Inspection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Problem Photos */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Camera className="w-4 h-4" /> Customer Problem Photos ({selectedRequest.problemImages?.length || 0})
                  </h4>
                </div>

                {selectedRequest.issueDescription && (
                  <p className="text-xs text-zinc-300 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 italic">
                    &ldquo;{selectedRequest.issueDescription}&rdquo;
                  </p>
                )}

                {selectedRequest.problemImages && selectedRequest.problemImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {selectedRequest.problemImages.map((img: string, i: number) => (
                      <div
                        key={i}
                        onClick={() => setPreviewImage(img)}
                        className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video cursor-pointer hover:border-amber-500 transition-all shadow-sm"
                      >
                        <img src={img} alt="Problem Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold">
                          <Maximize2 className="w-3.5 h-3.5" /> Enlarge
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No customer problem photos submitted.</p>
                )}
              </div>

              {/* Completion Photos */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Mechanic Completion Photos ({selectedRequest.completionImages?.length || 0})
                  </h4>
                </div>

                {selectedRequest.completionImages && selectedRequest.completionImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {selectedRequest.completionImages.map((img: string, i: number) => (
                      <div
                        key={i}
                        onClick={() => setPreviewImage(img)}
                        className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video cursor-pointer hover:border-emerald-500 transition-all shadow-sm"
                      >
                        <img src={img} alt="Completion Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold">
                          <Maximize2 className="w-3.5 h-3.5" /> Enlarge
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    Mechanic has not uploaded completion photos yet.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
                className="text-xs font-bold uppercase tracking-wider h-9 rounded-xl border-zinc-800 hover:bg-zinc-900 text-zinc-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Lightbox */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col w-full"
          >
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 shrink-0 text-white">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-500" />
                Service Photo Preview
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Original
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-black max-h-[calc(90vh-65px)]">
              <img
                src={previewImage}
                alt="Enlarged photo view"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
