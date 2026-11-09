"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  MapPin, 
  Car, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  CheckCheck, 
  Eye, 
  X, 
  RotateCcw, 
  ShieldCheck, 
  MessageSquare,
  Users,
  Search,
  Filter
} from "lucide-react";
import { serviceRequestsService } from "@/services/services.service";
import { useAuth } from "@/context/AuthContext";
import { centersService } from "@/services/centers.service";
import { ServiceRequest } from "@/types/jatra";

export default function OwnerServiceRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Assign State
  const [selectedMechanics, setSelectedMechanics] = useState<Record<string, string>>({});

  // Verification & Review Drawer
  const [inspectRequest, setInspectRequest] = useState<ServiceRequest | null>(null);
  const [reworkNotes, setReworkNotes] = useState("");
  const [showReworkInput, setShowReworkInput] = useState(false);
  const [reassignMechanicId, setReassignMechanicId] = useState("");

  // Reopen Job Drawer
  const [reopenRequest, setReopenRequest] = useState<ServiceRequest | null>(null);
  const [reopenReason, setReopenReason] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const centerId = user?.managedCenter?.id;
      const [requestsRes, centerRes] = await Promise.all([
        serviceRequestsService.getRequests(),
        centerId ? centersService.getCenterById(centerId) : (user?.id ? centersService.getAllCenters({ adminId: user.id }) : Promise.resolve(null)),
      ]);

      const rawRequests = requestsRes?.data || (Array.isArray(requestsRes) ? requestsRes : []);
      setRequests(Array.isArray(rawRequests) ? rawRequests : []);
      
      if (centerRes?.data) {
        const centerData = Array.isArray(centerRes.data) ? centerRes.data[0] : centerRes.data;
        if (centerData?.mechanics) {
          setMechanics(centerData.mechanics);
        } else if (centerData?.id) {
          const detailRes = await centersService.getCenterById(centerData.id);
          setMechanics(detailRes?.data?.mechanics || []);
        }
      }
    } catch (error) {
      console.error("Failed to load service requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleMechanicSelect = (requestId: string, mechanicId: string) => {
    setSelectedMechanics(prev => ({ ...prev, [requestId]: mechanicId }));
  };

  const handleAssign = async (id: string) => {
    const mechanicId = selectedMechanics[id];
    if (!mechanicId) return;

    setActionLoading(true);
    try {
      await serviceRequestsService.assignMechanic(id, mechanicId);
      await loadData();
    } catch (error) {
      console.error("Failed to assign mechanic", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await serviceRequestsService.verifyCompletion(id, { action: "APPROVE" });
      setInspectRequest(null);
      await loadData();
    } catch (error) {
      console.error("Failed to approve work", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRework = async (id: string) => {
    if (!reworkNotes.trim()) return;

    setActionLoading(true);
    try {
      await serviceRequestsService.verifyCompletion(id, {
        action: "REWORK",
        notes: reworkNotes.trim(),
        newMechanicId: reassignMechanicId || undefined
      });
      setInspectRequest(null);
      setShowReworkInput(false);
      setReworkNotes("");
      await loadData();
    } catch (error) {
      console.error("Failed to request rework", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenRequest || !reopenReason.trim()) return;

    setActionLoading(true);
    try {
      await serviceRequestsService.reopenForRework(reopenRequest.id, {
        reason: reopenReason.trim()
      });
      setReopenRequest(null);
      setReopenReason("");
      await loadData();
    } catch (error) {
      console.error("Failed to reopen job", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper: check if a mechanic currently has an active in-progress job
  const getMechanicWorkload = (mechanicId: string) => {
    const activeJob = requests.find(r => 
      r.mechanicId === mechanicId && 
      (r.status === 'IN_PROGRESS' || r.status === 'ACCEPTED')
    );
    return activeJob;
  };

  // Filter requests by tab and search
  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      (req.serviceName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.customer?.fullName || req.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.vehicle?.make || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.vehicle?.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "NEEDS_MECHANIC") {
      return (req.status === "ACCEPTED" || req.status === "PENDING") && !req.mechanicId;
    }
    if (activeTab === "IN_PROGRESS") {
      return req.status === "IN_PROGRESS";
    }
    if (activeTab === "NEEDS_VERIFICATION") {
      return req.status === "COMPLETED_PENDING_REVIEW";
    }
    if (activeTab === "DONE") {
      return req.status === "DONE" || req.status === "COMPLETED";
    }
    if (activeTab === "REWORK") {
      return req.status === "REASSIGNMENT_REQUIRED";
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Confirmed</span>;
      case "IN_PROGRESS":
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">In Progress</span>;
      case "COMPLETED_PENDING_REVIEW":
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Needs Verification</span>;
      case "DONE":
      case "COMPLETED":
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Done & Approved</span>;
      case "REASSIGNMENT_REQUIRED":
        return <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Rework Required</span>;
      case "CANCELLED":
        return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Awaiting Payment</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">
        Loading Workshop Management Console...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            Workshop Operations Console
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Manage incoming bookings, allocate mechanics, inspect completion photos, and approve finished repairs
          </p>
        </div>
      </div>

      {/* Mechanics Roster & Live Capacity Card */}
      <div className="bg-card border rounded-xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" /> Workshop Mechanics Roster ({mechanics.length})
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">
            1 Active Job Per Mechanic Concurrency Rule
          </span>
        </div>

        {mechanics.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            No mechanics registered yet. Add mechanics to your center from the Mechanics tab to accept service jobs.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {mechanics.map((m) => {
              const activeJob = getMechanicWorkload(m.id);
              return (
                <div key={m.id} className="p-3 rounded-lg border bg-muted/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground">{m.fullName || m.name}</span>
                    {activeJob ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        Busy
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Available
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                  {activeJob && (
                    <p className="text-[10px] font-mono text-purple-600 truncate">
                      Job #{activeJob.id.slice(0, 8)}: {activeJob.serviceName}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap gap-1.5 p-1 bg-muted/50 rounded-xl border">
          {[
            { id: "ALL", label: `All (${requests.length})` },
            { id: "NEEDS_MECHANIC", label: "Needs Mechanic" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "NEEDS_VERIFICATION", label: `Verification (${requests.filter(r => r.status === 'COMPLETED_PENDING_REVIEW').length})` },
            { id: "DONE", label: "Approved / Done" },
            { id: "REWORK", label: "Rework" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === tab.id 
                  ? "bg-foreground text-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by job ID, customer, car..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border bg-muted/40 outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Bookings Feed */}
      {filteredRequests.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground text-xs uppercase font-bold tracking-wider">
          No service requests matching current filter
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const hasReview = Boolean(req.review);
            const isPendingReview = req.status === "COMPLETED_PENDING_REVIEW";
            const isDone = req.status === "DONE" || req.status === "COMPLETED";

            return (
              <div 
                key={req.id} 
                className={`bg-card border rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow ${
                  isPendingReview ? "border-amber-500/70 bg-amber-500/5" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-muted-foreground">Job #{req.id.slice(0, 8)}</span>
                      {getStatusBadge(req.status)}
                      <span className="text-xs font-extrabold text-foreground">${req.totalAmount || 50} Paid</span>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                      {req.serviceName || req.serviceType}
                    </h3>
                  </div>

                  {/* Schedule & Duration */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {new Date(req.scheduledDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {req.estimatedDuration || 60} mins duration
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Vehicle */}
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-amber-500" /> Vehicle
                    </span>
                    <p className="font-extrabold text-foreground">
                      {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.year})
                    </p>
                    <p className="text-muted-foreground">Plate: {req.vehicle?.licensePlate}</p>
                  </div>

                  {/* Customer */}
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-500" /> Customer
                    </span>
                    <p className="font-extrabold text-foreground truncate">
                      {req.customer?.fullName || req.customer?.name}
                    </p>
                    <p className="text-muted-foreground truncate">{req.customer?.phone || req.customer?.email}</p>
                  </div>

                  {/* Assigned Mechanic / Allocation */}
                  <div className="p-3 rounded-lg bg-muted/40 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-amber-500" /> Assigned Mechanic
                    </span>

                    {req.mechanic ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {req.mechanic.fullName || req.mechanic.name}
                        </span>
                        {(req.status === "ACCEPTED" || req.status === "REASSIGNMENT_REQUIRED") && (
                          <button
                            onClick={() => setSelectedMechanics(prev => ({ ...prev, [req.id]: "" }))}
                            className="text-[10px] font-bold text-amber-600 hover:underline"
                          >
                            Reassign
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedMechanics[req.id] || ""}
                          onChange={(e) => handleMechanicSelect(req.id, e.target.value)}
                          className="bg-card border rounded p-1.5 text-xs font-bold text-foreground outline-none flex-1"
                        >
                          <option value="">-- Choose Mechanic --</option>
                          {mechanics.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.fullName || m.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          disabled={!selectedMechanics[req.id] || actionLoading}
                          onClick={() => handleAssign(req.id)}
                          className="h-7 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-600"
                        >
                          Assign
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Problem Images & Issue Description Preview */}
                {req.problemImages && req.problemImages.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Customer Problem Images ({req.problemImages.length}):
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {req.problemImages.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="w-16 h-12 rounded border overflow-hidden shrink-0 bg-black block">
                          <img src={img} alt="Problem" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls & Review Verification */}
                <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setInspectRequest(req)}
                      className="text-xs font-bold uppercase tracking-wider h-8"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Inspect & Verification
                    </Button>

                    <a
                      href="/owner/dashboard/messages"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline uppercase"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat
                    </a>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isPendingReview && (
                      <Button
                        size="sm"
                        onClick={() => setInspectRequest(req)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider h-8 shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Review Completion
                      </Button>
                    )}

                    {/* Low rating complaint investigation & reopen */}
                    {isDone && req.review && req.review.rating <= 2 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setReopenRequest(req);
                          setReopenReason(`Customer left a ${req.review?.rating}★ rating: ${req.review?.comment || 'Complaint received'}`);
                        }}
                        className="text-xs font-bold uppercase tracking-wider h-8"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Investigate & Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Inspection & Verification Drawer / Modal */}
      {inspectRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                setInspectRequest(null);
                setShowReworkInput(false);
                setReworkNotes("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 font-mono">
                Job #{inspectRequest.id}
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                Service Completion & Quality Review
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {inspectRequest.serviceName} • {inspectRequest.vehicle?.make} {inspectRequest.vehicle?.model}
              </p>
            </div>

            {/* Side-by-Side Photo Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Before: Customer Problem Photos */}
              <div className="space-y-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Before: Customer Problem Photos
                </h4>
                {inspectRequest.problemImages && inspectRequest.problemImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {inspectRequest.problemImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border aspect-video bg-black">
                        <img src={img} alt="Problem Photo" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No problem photos submitted.</p>
                )}
                {inspectRequest.issueDescription && (
                  <p className="text-xs text-muted-foreground bg-card p-2.5 rounded border mt-2">
                    <span className="font-bold text-foreground">Reported: </span>{inspectRequest.issueDescription}
                  </p>
                )}
              </div>

              {/* After: Mechanic Completion Photos */}
              <div className="space-y-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> After: Mechanic Completion Photos
                </h4>
                {inspectRequest.completionImages && inspectRequest.completionImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {inspectRequest.completionImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border aspect-video bg-black">
                        <img src={img} alt="Completion Photo" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Mechanic has not uploaded completion photos yet.
                  </div>
                )}
                {inspectRequest.mechanic && (
                  <p className="text-xs text-muted-foreground bg-card p-2.5 rounded border mt-2">
                    <span className="font-bold text-foreground">Mechanic: </span>
                    {inspectRequest.mechanic.fullName || inspectRequest.mechanic.name}
                  </p>
                )}
              </div>
            </div>

            {/* Rework Input Drawer */}
            {showReworkInput && (
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-400">
                  Specify Rework Notes & Reassignment
                </h4>
                <textarea
                  value={reworkNotes}
                  onChange={(e) => setReworkNotes(e.target.value)}
                  placeholder="Explain why the work is unsatisfactory and what needs adjustment..."
                  className="w-full bg-card border rounded-lg p-3 text-xs font-medium text-foreground outline-none resize-none h-20 focus:ring-1 focus:ring-orange-500"
                  required
                />
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Optionally Reassign to Different Mechanic:
                  </label>
                  <select
                    value={reassignMechanicId}
                    onChange={(e) => setReassignMechanicId(e.target.value)}
                    className="bg-card border rounded p-2 text-xs font-bold text-foreground outline-none w-full"
                  >
                    <option value="">Keep current mechanic ({inspectRequest.mechanic?.fullName || 'Current'})</option>
                    {mechanics.filter(m => m.id !== inspectRequest.mechanicId).map(m => (
                      <option key={m.id} value={m.id}>{m.fullName || m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowReworkInput(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={!reworkNotes.trim() || actionLoading}
                    onClick={() => handleRework(inspectRequest.id)}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase"
                  >
                    Confirm Rework Request
                  </Button>
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setInspectRequest(null)}
                className="text-xs font-bold uppercase h-10"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {!showReworkInput && (
                  <Button
                    variant="outline"
                    onClick={() => setShowReworkInput(true)}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-xs font-black uppercase h-10"
                  >
                    Request Rework
                  </Button>
                )}

                <Button
                  disabled={actionLoading || !inspectRequest.completionImages || inspectRequest.completionImages.length === 0}
                  onClick={() => handleApprove(inspectRequest.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase h-10 shadow-md"
                >
                  <CheckCheck className="w-4 h-4 mr-1.5" /> Approve & Mark Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Complaint Modal */}
      {reopenRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setReopenRequest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Quality Investigation</span>
              <h3 className="text-xl font-black uppercase text-foreground">Reopen Booking for Rework</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Job #{reopenRequest.id.slice(0, 8)} • Customer reported unsatisfactory service
              </p>
            </div>

            <form onSubmit={handleReopen} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Investigation Findings & Instructions for Mechanic <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full bg-muted/40 border rounded-xl p-3 text-xs font-medium text-foreground outline-none resize-none h-24 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setReopenRequest(null)} className="text-xs">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={actionLoading || !reopenReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider"
                >
                  Reopen Job
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
