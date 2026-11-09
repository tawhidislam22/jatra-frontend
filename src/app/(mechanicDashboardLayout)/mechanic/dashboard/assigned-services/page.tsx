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
  FileText,
  Upload,
  X,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { serviceRequestsService } from "@/services/services.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServiceRequest } from "@/types/jatra";

export default function MechanicAssignedServicesPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Completion Modal State
  const [completeJob, setCompleteJob] = useState<ServiceRequest | null>(null);
  const [completionFiles, setCompletionFiles] = useState<File[]>([]);
  const [completionPreviews, setCompletionPreviews] = useState<string[]>([]);
  const [completionNotes, setCompletionNotes] = useState("");
  const [submittingCompletion, setSubmittingCompletion] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await serviceRequestsService.getRequests();
      const raw = response?.data || (Array.isArray(response) ? response : []);
      setRequests(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load service requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStartWork = async (id: string, scheduledDate?: string) => {
    if (scheduledDate && new Date() < new Date(scheduledDate)) {
      const schedTime = new Date(scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessage({ 
        type: 'error', 
        text: `Cannot start repair work before its scheduled appointment time (${schedTime}).` 
      });
      return;
    }
    setUpdatingId(id);
    setMessage(null);
    try {
      await serviceRequestsService.startWork(id);
      setMessage({ type: 'success', text: "Repair work started! Status updated to IN_PROGRESS." });
      await loadRequests();
    } catch (err: any) {
      console.error("Failed to start work:", err);
      setMessage({ type: 'error', text: err?.response?.data?.message || "Failed to start repair work." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setCompletionFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setCompletionPreviews(prev => [...prev, ...previews]);
  };

  const removeCompletionImage = (index: number) => {
    setCompletionFiles(prev => prev.filter((_, i) => i !== index));
    setCompletionPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeJob) return;

    if (completionFiles.length === 0) {
      setMessage({ type: 'error', text: "At least one completion photo showing finished work is mandatory." });
      return;
    }

    setSubmittingCompletion(true);
    setMessage(null);

    try {
      const formData = new FormData();
      if (completionNotes.trim()) {
        formData.append("notes", completionNotes.trim());
      }
      completionFiles.forEach(file => {
        formData.append("completionImages", file);
      });

      await serviceRequestsService.submitCompletion(completeJob.id, formData);
      setMessage({ type: 'success', text: "Completed work and photos submitted for manager verification!" });
      setCompleteJob(null);
      setCompletionFiles([]);
      setCompletionPreviews([]);
      setCompletionNotes("");
      await loadRequests();
    } catch (err: any) {
      console.error("Completion submission error:", err);
      setMessage({ type: 'error', text: err?.response?.data?.message || "Failed to submit completion." });
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesSearch =
      (req.serviceName || req.serviceType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.issueDescription || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.customer?.fullName || req.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.vehicle?.make || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.vehicle?.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            Mechanic Assigned Workstation
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Inspect car problem photos, start repair jobs, and submit required completion photos for manager approval
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-lg border border-amber-500/20">
            Total Assigned: {requests.length}
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' 
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search job ID, vehicle, client..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs font-medium h-10"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-muted/40 rounded-xl border">
          {["ALL", "ACCEPTED", "IN_PROGRESS", "REASSIGNMENT_REQUIRED", "COMPLETED_PENDING_REVIEW", "DONE"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-[11px] font-black uppercase rounded-lg transition-all ${
                statusFilter === s 
                  ? "bg-foreground text-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Feed */}
      {filteredRequests.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground text-xs uppercase font-bold tracking-wider">
          No repair jobs matching current filter
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map((req) => (
            <div 
              key={req.id} 
              className={`bg-card border rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                req.status === 'REASSIGNMENT_REQUIRED' ? 'border-orange-500/50 bg-orange-500/5' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">Job #{req.id.slice(0, 8)}</span>
                    <h2 className="text-base font-black text-foreground uppercase tracking-tight">
                      {req.serviceName || req.serviceType}
                    </h2>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                    req.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    req.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    req.status === 'COMPLETED_PENDING_REVIEW' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    req.status === 'DONE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    req.status === 'REASSIGNMENT_REQUIRED' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-muted text-foreground'
                  }`}>
                    {req.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Vehicle & Customer Specs */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Car className="w-3 h-3 text-amber-500" /> Vehicle
                    </span>
                    <p className="font-extrabold text-foreground">
                      {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.year})
                    </p>
                    <p className="text-[10px] text-muted-foreground">Plate: {req.vehicle?.licensePlate}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-500" /> Customer
                    </span>
                    <p className="font-extrabold text-foreground truncate">
                      {req.customer?.fullName || req.customer?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{req.customer?.phone || req.customer?.email}</p>
                  </div>
                </div>

                {/* Problem Images uploaded by Customer */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Customer Problem Photos (Inspect Issue):
                  </span>
                  {req.problemImages && req.problemImages.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {req.problemImages.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="w-20 h-14 rounded-lg overflow-hidden border shrink-0 bg-black block group relative">
                          <img src={img} alt="Problem Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">No problem photos attached.</p>
                  )}
                </div>

                {/* Issue Notes */}
                {req.issueDescription && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Customer Notes
                    </span>
                    <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg font-medium leading-relaxed">
                      {req.issueDescription}
                    </p>
                  </div>
                )}

                {/* Rework alert if applicable */}
                {req.status === 'REASSIGNMENT_REQUIRED' && req.reworkNotes && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 text-orange-900 dark:text-orange-400 rounded-lg text-xs space-y-1">
                    <span className="font-black flex items-center gap-1 uppercase tracking-wider text-[10px]">
                      <RotateCcw className="w-3.5 h-3.5" /> Manager Rework Instructions:
                    </span>
                    <p className="text-xs leading-relaxed">{req.reworkNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons for Mechanic */}
              <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {(() => {
                  const schedDate = new Date(req.scheduledDate);
                  const now = new Date();
                  const isBeforeSchedule = now < schedDate;
                  const isToday = schedDate.toDateString() === now.toDateString();
                  const formattedSched = isToday 
                    ? `Today at ${schedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : `${schedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${schedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                  return (
                    <>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Scheduled: <strong className="text-foreground">{formattedSched}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Start Repair Button */}
                        {req.status === 'ACCEPTED' && (
                          isBeforeSchedule ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Scheduled for {schedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <Button 
                                size="sm"
                                disabled
                                title={`Cannot start repair before scheduled appointment time (${formattedSched})`}
                                className="bg-muted text-muted-foreground border border-border text-xs font-bold uppercase tracking-wider h-8 cursor-not-allowed opacity-60"
                              >
                                <PlayCircle className="w-3.5 h-3.5 mr-1" /> Start Repair
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleStartWork(req.id, req.scheduledDate)}
                              disabled={updatingId === req.id}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider h-8 shadow-sm transition-all"
                            >
                              <PlayCircle className="w-3.5 h-3.5 mr-1" /> Start Repair
                            </Button>
                          )
                        )}

                  {/* Submit Completed Work Button (Mandatory Photo Modal) */}
                  {(req.status === 'IN_PROGRESS' || req.status === 'REASSIGNMENT_REQUIRED') && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        setCompleteJob(req);
                        setCompletionFiles([]);
                        setCompletionPreviews([]);
                        setCompletionNotes("");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider h-8 shadow-sm"
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" /> Submit Completed Work
                    </Button>
                  )}

                  {req.status === 'COMPLETED_PENDING_REVIEW' && (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Awaiting Manager Quality Review
                    </span>
                  )}

                  {(req.status === 'DONE' || req.status === 'COMPLETED') && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Finished
                    </span>
                  )}
                </div>
              </>
            );
          })()}
        </div>
            </div>
          ))}
        </div>
      )}

      {/* Mandatory Completion Photo Upload Modal */}
      {completeJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setCompleteJob(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Verification Gate</span>
              <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
                Submit Completed Work
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Job #{completeJob.id.slice(0, 8)} • {completeJob.serviceName}
              </p>
            </div>

            <form onSubmit={handleSubmitCompletion} className="space-y-4">
              {/* Mandatory Completion Photos */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Completion Photos <span className="text-red-500">* (Mandatory)</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Min 1 photo</span>
                </label>

                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/30 transition-colors">
                  <input
                    type="file"
                    id="completion-upload-input"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="completion-upload-input" className="cursor-pointer block space-y-1.5">
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
                    <p className="text-xs font-bold text-foreground">Click to upload completion photos</p>
                    <p className="text-[10px] text-muted-foreground">Showcase fixed parts, replaced fluids, or pristine finish</p>
                  </label>
                </div>

                {completionPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {completionPreviews.map((src, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square bg-black">
                        <img src={src} alt="Completion" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeCompletionImage(i)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Repair Notes */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Mechanic Completion Notes (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Note any parts replaced, fluid specs, or recommendations for the customer..."
                  className="w-full bg-muted/40 border rounded-xl p-3 text-xs font-medium text-foreground outline-none resize-none h-20 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setCompleteJob(null)} className="text-xs">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submittingCompletion || completionFiles.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider"
                >
                  {submittingCompletion ? "Uploading & Submitting..." : "Submit to Manager"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
