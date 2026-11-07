"use client";

import { useEffect, useState } from "react";
import { 
  Wrench, 
  Search, 
  Calendar, 
  Car, 
  User, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  CheckCheck, 
  Filter, 
  AlertCircle,
  FileText
} from "lucide-react";
import { serviceRequestsService } from "@/services/services.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MechanicAssignedServicesPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await serviceRequestsService.getRequests();
      const raw = response?.data || (Array.isArray(response) ? response : []);
      setRequests(raw);
    } catch (err) {
      console.error("Failed to load service requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setMessage(null);
    try {
      await serviceRequestsService.updateStatus(id, { status: newStatus });
      setMessage({ type: 'success', text: `Service request status updated to ${newStatus} successfully!` });
      await loadRequests();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setMessage({ type: 'error', text: err?.response?.data?.message || "Failed to update service status." });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesSearch =
      (req.serviceType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.issueDescription || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.customer?.fullName || req.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.vehicle?.model || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            Assigned Service Requests
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Manage your repair queue, inspect vehicle issues, and update live progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1.5 rounded-sm">
            Total Jobs: {requests.length}
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          {message.text}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search by customer, vehicle, or issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs font-semibold rounded-sm border-border"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-card p-1 rounded-lg border">
          {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider transition-colors ${statusFilter === st ? 'bg-amber-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Service Request Cards */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-bold uppercase text-xs tracking-wider animate-pulse">
          Loading assigned services...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center space-y-3">
          <Wrench className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-foreground uppercase">No Service Requests Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? "No service requests match your search and filter criteria."
              : "You currently have no service requests assigned."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-card border rounded-xl p-5 shadow-sm space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                {/* Status & Service Type Header */}
                <div className="flex items-start justify-between gap-3 border-b pb-3">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded ${
                      req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      req.status === 'ACCEPTED' ? 'bg-amber-100 text-amber-800' : 'bg-muted text-gray-800'
                    }`}>
                      {req.status}
                    </span>
                    <h2 className="text-base font-extrabold text-foreground uppercase mt-2">
                      {req.serviceType || "Automotive Service"}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded">
                    <Calendar className="w-3.5 h-3.5" />
                    {req.scheduledDate ? new Date(req.scheduledDate).toLocaleDateString() : "Immediate"}
                  </span>
                </div>

                {/* Vehicle & Customer Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-muted/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Car className="w-3 h-3 text-amber-600" /> Vehicle
                    </span>
                    <p className="font-bold text-foreground">
                      {req.vehicle ? `${req.vehicle.brand || ''} ${req.vehicle.model || ''}` : "Unknown"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Year: {req.vehicle?.year || "N/A"}
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-muted/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-600" /> Customer
                    </span>
                    <p className="font-bold text-foreground truncate">
                      {req.customer?.fullName || req.customer?.name || "Client"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {req.customer?.email || req.customer?.phone || "No contact"}
                    </p>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Reported Issue
                  </span>
                  <p className="text-xs text-foreground bg-amber-500/5 p-3 rounded border border-amber-500/10 leading-relaxed font-medium">
                    {req.issueDescription || "No issue description provided by customer."}
                  </p>
                </div>
              </div>

              {/* Action Controls for Mechanic */}
              <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Job ID: #{req.id?.slice(0, 8)}
                </span>

                <div className="flex items-center gap-2">
                  {req.status === 'PENDING' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                      disabled={updatingId === req.id}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold uppercase tracking-wider h-8"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept Job
                    </Button>
                  )}

                  {(req.status === 'ACCEPTED' || req.status === 'PENDING') && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')}
                      disabled={updatingId === req.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider h-8"
                    >
                      <PlayCircle className="w-3.5 h-3.5 mr-1" /> Start Repair
                    </Button>
                  )}

                  {req.status === 'IN_PROGRESS' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusUpdate(req.id, 'COMPLETED')}
                      disabled={updatingId === req.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider h-8"
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark Completed
                    </Button>
                  )}

                  {req.status === 'COMPLETED' && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Finished
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
