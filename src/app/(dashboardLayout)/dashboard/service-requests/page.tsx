"use client";

import { useEffect, useState } from "react";
import { serviceRequestsService } from "@/services/services.service";
import { reviewsService } from "@/services/reviews.service";
import { ServiceRequest } from "@/types/jatra";
import { 
  Wrench, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  Eye, 
  X,
  CreditCard,
  User,
  ShieldAlert,
  Wallet,
  Receipt,
  Camera,
  Maximize2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CustomerServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Review Modal
  const [reviewRequest, setReviewRequest] = useState<ServiceRequest | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Cancellation Modal
  const [cancellingRequest, setCancellingRequest] = useState<ServiceRequest | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await serviceRequestsService.getRequests();
      const raw = response?.data || (Array.isArray(response) ? response : []);
      setRequests(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to fetch service requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenReview = (req: ServiceRequest) => {
    setReviewRequest(req);
    setRating(5);
    setComment("");
    setReviewSuccess(false);
    setReviewError("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRequest) return;

    setSubmittingReview(true);
    setReviewError("");

    try {
      await reviewsService.createReview({
        centerId: reviewRequest.centerId,
        serviceRequestId: reviewRequest.id,
        rating,
        comment: comment.trim() || undefined
      });

      setReviewSuccess(true);
      toast.success("Review submitted! Thank you for your feedback.");
      await fetchRequests();
      setTimeout(() => {
        setReviewRequest(null);
      }, 1500);
    } catch (err: any) {
      console.error("Review error:", err);
      const errMsg = err?.response?.data?.message || err.message || "Failed to submit review.";
      setReviewError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getCancellationEstimate = (req: ServiceRequest) => {
    const now = new Date().getTime();
    const scheduledTime = new Date(req.scheduledDate).getTime();
    const diffHours = (scheduledTime - now) / (1000 * 60 * 60);
    const amount = (req as any).payment?.amount || (req as any).totalAmount || 50;

    let feePercent = 0;
    let tierDescription = "Full 100% Refund (>= 3 days in advance)";

    if (diffHours >= 72) {
      feePercent = 0;
      tierDescription = "Full 100% Refund (3+ days before appointment)";
    } else if (diffHours >= 24) {
      feePercent = 10;
      tierDescription = "90% Refund • 10% Cancellation Fee (1 to 3 days before appointment)";
    } else {
      feePercent = 30;
      tierDescription = "70% Refund • 30% Cancellation Fee (Less than 24 hours before appointment)";
    }

    const cancellationFee = Number(((amount * feePercent) / 100).toFixed(2));
    const refundAmount = Number((amount - cancellationFee).toFixed(2));

    return {
      diffHours: Math.max(0, Math.round(diffHours)),
      feePercent,
      tierDescription,
      amount,
      cancellationFee,
      refundAmount,
    };
  };

  const handleOpenCancelModal = (req: ServiceRequest) => {
    setCancellingRequest(req);
    setCancelReason("");
    setCancelError("");
    setCancelSuccess(false);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingRequest) return;
    try {
      setSubmittingCancel(true);
      setCancelError("");

      await serviceRequestsService.cancelRequest(cancellingRequest.id, {
        reason: cancelReason.trim() || "Customer requested cancellation"
      });

      setCancelSuccess(true);
      toast.success("Service appointment cancelled. Refund credited to your wallet!");
      await fetchRequests();
      if (selectedRequest?.id === cancellingRequest.id) {
        setSelectedRequest(null);
      }
      setTimeout(() => {
        setCancellingRequest(null);
      }, 1500);
    } catch (err: any) {
      console.error("Service cancellation error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to cancel service request.";
      setCancelError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider">Confirmed</span>;
      case "IN_PROGRESS":
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider animate-pulse">In Progress</span>;
      case "COMPLETED_PENDING_REVIEW":
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider">Quality Verification</span>;
      case "DONE":
      case "COMPLETED":
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider">Done & Approved</span>;
      case "REASSIGNMENT_REQUIRED":
        return <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider">Rework Underway</span>;
      case "CANCELLED":
        return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider">Awaiting Payment</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">
        Loading Service Requests...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            Workshop Service Bookings
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Track repairs, review before & after photos, inspect mechanic progress, and rate completed work
          </p>
        </div>
      </div>

      {/* Requests Feed */}
      {requests.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center space-y-4">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-lg font-black uppercase text-foreground">No Service Bookings Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Book professional car maintenance and diagnostics from certified automotive centers near you.
          </p>
          <a
            href="/centers"
            className="inline-block bg-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm"
          >
            Explore Workshop Centers
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((req) => {
            const hasReview = Boolean(req.review);
            const isDone = req.status === "DONE" || req.status === "COMPLETED";
            const canCancel = req.status === "ACCEPTED" || req.status === "PENDING";
            const isCancelled = req.status === "CANCELLED";

            return (
              <div 
                key={req.id} 
                className="bg-card border rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">
                        Job #{req.id.slice(0, 8)}
                      </span>
                      <h2 className="text-base font-black text-foreground uppercase tracking-tight">
                        {req.serviceName || req.serviceType || "Car Service"}
                      </h2>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  {/* Vehicle & Center Info */}
                  <div className="p-3 rounded-lg bg-muted/40 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Car className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{req.vehicle ? `${req.vehicle.make} ${req.vehicle.model} (${req.vehicle.year})` : "Vehicle"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">{req.center?.name || "Automotive Center"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{new Date(req.scheduledDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                  </div>

                  {/* Cancelled badge details */}
                  {isCancelled && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-red-600 dark:text-red-400 text-[11px]">
                        <span>Appointment Cancelled</span>
                        {req.cancelledAt && (
                          <span className="font-mono text-[10px] opacity-80">
                            {new Date(req.cancelledAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {req.refundAmount != null && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <Wallet className="w-3 h-3" /> Refunded to Wallet: ${Number(req.refundAmount).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Problem & Completion Photo Badges & Preview Thumbnails */}
                  {((req.problemImages && req.problemImages.length > 0) || (req.completionImages && req.completionImages.length > 0)) && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        {req.problemImages && req.problemImages.length > 0 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {req.problemImages.length} Problem Photo{req.problemImages.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {req.completionImages && req.completionImages.length > 0 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {req.completionImages.length} Completed Photo{req.completionImages.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Photo Thumbnails */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {req.problemImages?.slice(0, 2).map((img, i) => (
                          <div key={`prob-${i}`} className="w-12 h-9 rounded-lg border border-amber-500/30 overflow-hidden shrink-0 bg-black/40">
                            <img src={img} alt="Problem thumbnail" className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ))}
                        {req.completionImages?.slice(0, 2).map((img, i) => (
                          <div key={`comp-${i}`} className="w-12 h-9 rounded-lg border border-emerald-500/30 overflow-hidden shrink-0 bg-black/40">
                            <img src={img} alt="Completion thumbnail" className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ))}
                        {(Number(req.problemImages?.length || 0) + Number(req.completionImages?.length || 0) > 4) && (
                          <span className="text-[10px] font-bold text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                            +{Number(req.problemImages?.length || 0) + Number(req.completionImages?.length || 0) - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rework alert if applicable */}
                  {req.status === "REASSIGNMENT_REQUIRED" && req.reworkNotes && (
                    <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 text-orange-800 dark:text-orange-400 rounded-lg text-xs space-y-1">
                      <span className="font-bold flex items-center gap-1 text-[11px] uppercase">
                        <ShieldAlert className="w-3.5 h-3.5" /> Quality Tuning in Progress
                      </span>
                      <p className="text-[11px] opacity-90">{req.reworkNotes}</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRequest(req)}
                    className="text-xs font-bold uppercase tracking-wider h-8"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                  </Button>

                  {canCancel && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenCancelModal(req)}
                      className="text-xs font-bold uppercase tracking-wider text-red-600 border-red-200 hover:bg-red-500/10 h-8"
                    >
                      Cancel
                    </Button>
                  )}

                  {isDone && !hasReview && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenReview(req)}
                      className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase tracking-wider h-8 shadow-sm"
                    >
                      <Star className="w-3.5 h-3.5 mr-1 fill-black" /> Rate Service
                    </Button>
                  )}

                  {hasReview && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 font-mono">
                Booking ID: {selectedRequest.id}
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                {selectedRequest.serviceName || selectedRequest.serviceType}
              </h2>
              <div className="pt-1">{getStatusBadge(selectedRequest.status)}</div>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vehicle</span>
                <p className="font-extrabold text-foreground">
                  {selectedRequest.vehicle?.make} {selectedRequest.vehicle?.model} ({selectedRequest.vehicle?.year})
                </p>
                <p className="text-muted-foreground">Plate: {selectedRequest.vehicle?.licensePlate}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Workshop Center</span>
                <p className="font-extrabold text-foreground">{selectedRequest.center?.name || "Automotive Center"}</p>
                <p className="text-muted-foreground">{selectedRequest.center?.address || "Location unavailable"}</p>
              </div>
            </div>

            {/* Schedule & Mechanic Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/40 space-y-1.5 border border-border/50">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold uppercase tracking-wider text-[10px]">
                  <Calendar className="w-3.5 h-3.5" /> Scheduled Appointment
                </div>
                <p className="font-extrabold text-foreground">
                  {new Date(selectedRequest.scheduledDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  Estimated: {selectedRequest.estimatedDuration || 60} mins
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 space-y-1.5 border border-border/50">
                <div className="flex items-center gap-1.5 text-blue-500 font-bold uppercase tracking-wider text-[10px]">
                  <User className="w-3.5 h-3.5" /> Assigned Mechanic
                </div>
                <p className="font-extrabold text-foreground">
                  {selectedRequest.mechanic?.fullName || selectedRequest.mechanic?.name || "Pending workshop assignment"}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {selectedRequest.mechanic?.phone ? `Direct Contact: ${selectedRequest.mechanic.phone}` : "Workshop technician will be assigned shortly"}
                </p>
              </div>
            </div>

            {/* Customer Problem Photos & Description */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" /> Your Uploaded Problem Photos
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {selectedRequest.problemImages?.length || 0} photo{selectedRequest.problemImages?.length !== 1 ? "s" : ""}
                  </span>
                </h4>
              </div>

              {selectedRequest.issueDescription && (
                <div className="p-3 rounded-lg bg-card border text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Reported Issue Description:
                  </span>
                  <p className="text-foreground leading-relaxed italic">
                    &ldquo;{selectedRequest.issueDescription}&rdquo;
                  </p>
                </div>
              )}

              {selectedRequest.problemImages && selectedRequest.problemImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {selectedRequest.problemImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setPreviewImage(img)}
                      className="group relative rounded-xl overflow-hidden border border-border bg-black/40 aspect-video cursor-pointer hover:border-amber-500 transition-all shadow-sm"
                    >
                      <img
                        src={img}
                        alt={`Problem photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[11px] font-bold">
                        <Maximize2 className="w-4 h-4" />
                        <span>Enlarge</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No problem photos submitted with this request.</p>
              )}
            </div>

            {/* Mechanic Completion & Inspection Photos */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Mechanic Completion & Inspection Photos
                  {selectedRequest.completionImages && selectedRequest.completionImages.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {selectedRequest.completionImages.length} photo{selectedRequest.completionImages.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </h4>
              </div>

              {selectedRequest.completionImages && selectedRequest.completionImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {selectedRequest.completionImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setPreviewImage(img)}
                      className="group relative rounded-xl overflow-hidden border border-border bg-black/40 aspect-video cursor-pointer hover:border-emerald-500 transition-all shadow-sm"
                    >
                      <img
                        src={img}
                        alt={`Completion photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[11px] font-bold">
                        <Maximize2 className="w-4 h-4" />
                        <span>Enlarge</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-card/60 border text-center space-y-1.5">
                  <Clock className="w-6 h-6 text-muted-foreground mx-auto opacity-70" />
                  <p className="text-xs font-bold text-foreground">
                    {selectedRequest.status === "COMPLETED" || selectedRequest.status === "DONE"
                      ? "No completion photos uploaded by mechanic."
                      : "Inspection & work in progress"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedRequest.status === "COMPLETED" || selectedRequest.status === "DONE"
                      ? "The workshop completed service without attaching extra photos."
                      : "Mechanic completion photos and inspection reports will appear here once service is finalized."}
                  </p>
                </div>
              )}
            </div>

            {/* Quality Tuning / Rework Notes Alert */}
            {selectedRequest.status === "REASSIGNMENT_REQUIRED" && selectedRequest.reworkNotes && (
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  <ShieldAlert className="w-3.5 h-3.5" /> Quality Tuning & Rework in Progress
                </span>
                <p className="text-foreground italic">&ldquo;{selectedRequest.reworkNotes}&rdquo;</p>
              </div>
            )}

            {/* Cancelled Info */}
            {selectedRequest.status === "CANCELLED" && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-2">
                <div className="flex justify-between font-bold text-red-600 dark:text-red-400">
                  <span>Cancelled Service Appointment</span>
                  {selectedRequest.cancelledAt && (
                    <span className="font-mono text-[11px] opacity-80">
                      {new Date(selectedRequest.cancelledAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-4 text-muted-foreground">
                  {selectedRequest.cancellationFee != null && (
                    <span>Fee Retained: <strong className="text-foreground">${Number(selectedRequest.cancellationFee).toFixed(2)}</strong></span>
                  )}
                  {selectedRequest.refundAmount != null && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" /> Refunded to Wallet: ${Number(selectedRequest.refundAmount).toFixed(2)}
                    </span>
                  )}
                </div>
                {selectedRequest.cancellationReason && (
                  <p className="text-[11px] italic text-muted-foreground">
                    Reason: &ldquo;{selectedRequest.cancellationReason}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons in Modal */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <a
                  href={`/dashboard/messages?conversationId=${selectedRequest.id}`}
                  className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl border text-xs font-bold uppercase tracking-wider hover:bg-muted/50"
                >
                  Contact Workshop
                </a>
                {(selectedRequest.status === "ACCEPTED" || selectedRequest.status === "PENDING") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenCancelModal(selectedRequest)}
                    className="text-xs font-bold uppercase tracking-wider text-red-600 border-red-200 hover:bg-red-500/10 h-9 rounded-xl"
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
                className="text-xs font-bold uppercase tracking-wider h-9 rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for enlarged image preview */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl max-h-[90vh] bg-card border rounded-2xl overflow-hidden shadow-2xl flex flex-col w-full"
          >
            <div className="p-3.5 border-b flex items-center justify-between bg-card shrink-0">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-500" />
                Service Photo Preview
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Original
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-black/90 max-h-[calc(90vh-65px)]">
              <img
                src={previewImage}
                alt="Enlarged photo view"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setCancellingRequest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                Service Cancellation
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                Cancel Workshop Appointment
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cancellingRequest.serviceName || cancellingRequest.serviceType} • Scheduled on {new Date(cancellingRequest.scheduledDate).toLocaleDateString()}
              </p>
            </div>

            {cancelSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-foreground">Appointment Cancelled</h3>
                <p className="text-xs text-muted-foreground">
                  Your refund has been credited directly to your Jatra Wallet balance. The mechanic slot has been released.
                </p>
              </div>
            ) : (
              <>
                {(() => {
                  const est = getCancellationEstimate(cancellingRequest);
                  return (
                    <div className="p-4 rounded-xl bg-muted/40 border space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Time Until Appointment:
                        </span>
                        <span className="font-mono text-foreground font-black">
                          {est.diffHours} Hours
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                        Policy Tier: {est.tierDescription}
                      </div>

                      <div className="space-y-1.5 pt-2 border-t">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Service Booking Cost:</span>
                          <span className="font-mono font-bold text-foreground">${Number(est.amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span>Cancellation Fee ({est.feePercent}%):</span>
                          <span className="font-mono font-bold">-${Number(est.cancellationFee || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm pt-1 border-t">
                          <span className="flex items-center gap-1">
                            <Wallet className="w-4 h-4" /> Wallet Refund Amount:
                          </span>
                          <span className="font-mono font-black">+${Number(est.refundAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reason for Cancellation (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Tell us why you are cancelling..."
                    className="w-full bg-muted/30 border rounded-xl p-3 text-xs outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {cancelError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{cancelError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCancellingRequest(null)}
                    className="text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-4"
                  >
                    Keep Appointment
                  </Button>
                  <Button
                    type="button"
                    disabled={submittingCancel}
                    onClick={handleConfirmCancel}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-5 gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{submittingCancel ? "Processing..." : "Confirm Cancellation"}</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setReviewRequest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                Verified Customer Feedback
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                Rate Workshop Service
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {reviewRequest.serviceName || reviewRequest.serviceType} at {reviewRequest.center?.name}
              </p>
            </div>

            {reviewSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-foreground">Review Submitted!</h3>
                <p className="text-xs text-muted-foreground">Thank you for rating our automotive service.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1.5 text-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Rating Score
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Comments & Experience (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the repair quality, timeliness, and customer service..."
                    className="w-full bg-muted/40 border rounded-xl p-3 text-xs font-medium text-foreground outline-none resize-none h-24 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {reviewError && (
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-600 rounded-lg text-xs font-bold">
                    {reviewError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-xs h-11 rounded-xl shadow-md"
                >
                  {submittingReview ? "Submitting Review..." : "Submit Review"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
