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
  MessageSquare, 
  Star, 
  Eye, 
  X,
  CreditCard,
  User,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import Link from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CustomerServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Review Modal
  const [reviewRequest, setReviewRequest] = useState<ServiceRequest | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

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
      await fetchRequests();
      setTimeout(() => {
        setReviewRequest(null);
      }, 1500);
    } catch (err: any) {
      console.error("Review error:", err);
      setReviewError(err?.response?.data?.message || err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
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

                  {/* Problem Photo Badge */}
                  {req.problemImages && req.problemImages.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                        {req.problemImages.length} Problem Photo{req.problemImages.length > 1 ? "s" : ""}
                      </span>
                      {req.completionImages && req.completionImages.length > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                          {req.completionImages.length} Completion Photo{req.completionImages.length > 1 ? "s" : ""}
                        </span>
                      )}
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
                <p className="font-extrabold text-foreground">{selectedRequest.center?.name}</p>
                <p className="text-muted-foreground truncate">{selectedRequest.center?.address}</p>
              </div>
            </div>

            {/* Problem Photos (Before) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Customer Problem Photos (Before Repair)
              </h3>
              {selectedRequest.problemImages && selectedRequest.problemImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {selectedRequest.problemImages.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border aspect-video bg-black">
                      <img src={img} alt="Problem Photo" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No problem images uploaded.</p>
              )}
            </div>

            {/* Mechanic Completion Photos (After) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mechanic Completion Photos (After Repair)
              </h3>
              {selectedRequest.completionImages && selectedRequest.completionImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {selectedRequest.completionImages.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border aspect-video bg-black">
                      <img src={img} alt="Completion Photo" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-muted/30 border border-dashed text-center text-xs text-muted-foreground">
                  Repair completion photos will be uploaded by the assigned mechanic upon completion.
                </div>
              )}
            </div>

            {/* Issue Description & Mechanic Notes */}
            {selectedRequest.issueDescription && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reported Issue Notes</span>
                <p className="text-xs text-foreground bg-muted/40 p-3 rounded-lg leading-relaxed font-medium">
                  {selectedRequest.issueDescription}
                </p>
              </div>
            )}

            {/* Assigned Mechanic */}
            {selectedRequest.mechanic && (
              <div className="p-3 rounded-xl bg-muted/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Mechanic</span>
                    <p className="font-extrabold text-foreground">{selectedRequest.mechanic.fullName || selectedRequest.mechanic.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t flex items-center justify-between">
              <a
                href="/dashboard/messages"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-primary hover:underline"
              >
                <MessageSquare className="w-4 h-4" /> Message Workshop Host
              </a>
              <Button onClick={() => setSelectedRequest(null)} className="h-9 px-6 font-bold uppercase tracking-wider text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setReviewRequest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Service Feedback</span>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                Rate & Review Workshop
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {reviewRequest.center?.name} • {reviewRequest.serviceName}
              </p>
            </div>

            {reviewSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-black uppercase text-foreground">Thank You For Your Review!</h3>
                <p className="text-xs text-muted-foreground">Your feedback has been recorded and submitted to the workshop.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* 5-Star Rating Selector */}
                <div className="space-y-1.5 text-center py-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating</span>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="block text-xs font-black text-amber-500 uppercase tracking-widest">
                    {rating === 5 ? "Exceptional" : rating === 4 ? "Very Good" : rating === 3 ? "Average" : rating === 2 ? "Disappointing" : "Unsatisfactory"}
                  </span>
                </div>

                {/* Feedback Comment */}
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
