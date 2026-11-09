"use client";

import { useEffect, useState } from "react";
import { bookingsService } from "@/services/bookings.service";
import { RentalBooking } from "@/types/jatra";
import { 
  Car, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Wallet, 
  ArrowRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<RentalBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsService.getBookings();
      const raw = response?.data || (Array.isArray(response) ? response : []);
      setBookings(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Confirmed</span>;
      case "IN_PROGRESS":
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">In Progress</span>;
      case "COMPLETED":
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Completed</span>;
      case "CANCELLED":
        return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Pending Payment</span>;
    }
  };

  // Calculate cancellation tier estimate
  const getCancellationEstimate = (booking: RentalBooking) => {
    const now = new Date().getTime();
    const pickupTime = new Date(booking.pickupDate).getTime();
    const diffHours = (pickupTime - now) / (1000 * 60 * 60);
    const amount = booking.totalAmount || 0;

    let feePercent = 0;
    let tierDescription = "Full 100% Refund (>= 3 days in advance)";

    if (diffHours >= 72) {
      feePercent = 0;
      tierDescription = "Full 100% Refund (Cancelled 3+ days before pickup)";
    } else if (diffHours >= 24) {
      feePercent = 10;
      tierDescription = "90% Refund • 10% Cancellation Fee (1 to 3 days before pickup)";
    } else {
      feePercent = 30;
      tierDescription = "70% Refund • 30% Cancellation Fee (Less than 24 hours before pickup)";
    }

    const cancellationFee = Number(((amount * feePercent) / 100).toFixed(2));
    const refundAmount = Number((amount - cancellationFee).toFixed(2));

    return {
      diffHours: Math.max(0, Math.round(diffHours)),
      feePercent,
      tierDescription,
      cancellationFee,
      refundAmount,
    };
  };

  const handleOpenCancelModal = (booking: RentalBooking) => {
    setCancellingBooking(booking);
    setCancelReason("");
    setCancelError("");
    setCancelSuccess(false);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    try {
      setSubmittingCancel(true);
      setCancelError("");

      await bookingsService.cancelBooking(cancellingBooking.id, {
        reason: cancelReason.trim() || "Customer requested cancellation"
      });

      setCancelSuccess(true);
      await fetchBookings();
      setTimeout(() => {
        setCancellingBooking(null);
      }, 1500);
    } catch (err: any) {
      console.error("Cancellation error:", err);
      setCancelError(err?.response?.data?.message || err?.message || "Failed to cancel booking.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">
        Loading Rental Bookings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            My Rental Bookings
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Manage your booked rental vehicles, view price snapshots, and track wallet refunds upon cancellation.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <Car className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-lg font-black uppercase text-foreground">No Rental Bookings Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Explore our verified automotive rental fleet and hit the road with instant booking and guaranteed rates.
          </p>
          <a
            href="/vehicles"
            className="inline-block bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-sm hover:opacity-90"
          >
            Browse Rental Fleet
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const vehicle = booking.vehicle;
            const canCancel = booking.status === "ACCEPTED" || booking.status === "PENDING";
            const isCancelled = booking.status === "CANCELLED";
            const estimate = getCancellationEstimate(booking);

            return (
              <div 
                key={booking.id}
                className="bg-card border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Vehicle Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-20 h-20 rounded-xl bg-muted/60 border flex items-center justify-center shrink-0 overflow-hidden">
                    {vehicle?.images && vehicle.images.length > 0 ? (
                      <img 
                        src={vehicle.images[0]} 
                        alt={vehicle.model} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Car className="w-8 h-8 text-muted-foreground opacity-60" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">
                        Booking #{booking.id.slice(0, 8)}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>

                    <h3 className="text-base font-black text-foreground uppercase tracking-tight">
                      {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : "Vehicle Rental"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1 text-foreground font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(booking.pickupDate).toLocaleDateString()} &rarr; {new Date(booking.returnDate).toLocaleDateString()}
                      </span>

                      {booking.dailyPriceSnapshot && (
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-muted/60 px-2 py-0.5 rounded border">
                          Locked Rate: ${booking.dailyPriceSnapshot.toFixed(2)}/day
                        </span>
                      )}
                    </div>

                    {/* Cancellation Refund Note if Cancelled */}
                    {isCancelled && (
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-red-600 dark:text-red-400">
                          <span>Booking Cancelled</span>
                          {booking.cancelledAt && (
                            <span className="text-[10px] font-normal opacity-80 font-mono">
                              {new Date(booking.cancelledAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                          {booking.cancellationFee !== undefined && (
                            <span>Fee Retained: <strong className="text-foreground">${booking.cancellationFee.toFixed(2)}</strong></span>
                          )}
                          {booking.refundAmount !== undefined && (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Wallet className="w-3 h-3" /> Refunded to Wallet: ${booking.refundAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {booking.cancellationReason && (
                          <p className="text-[11px] italic text-muted-foreground">
                            Reason: &ldquo;{booking.cancellationReason}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Price & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 gap-3 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Total Paid
                    </p>
                    <p className="text-xl md:text-2xl font-black text-foreground">
                      ${booking.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCancelModal(booking)}
                        className="text-xs font-bold uppercase tracking-wider text-red-600 border-red-200 hover:bg-red-500/10 rounded-xl h-9"
                      >
                        Cancel Booking
                      </Button>
                    )}

                    <a
                      href={`/dashboard/messages?conversationId=${booking.id}`}
                      className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider px-3.5 h-9 rounded-xl border hover:bg-muted/50 transition-colors"
                    >
                      Contact Host
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setCancellingBooking(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                Booking Cancellation
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                Cancel Rental Reservation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cancellingBooking.vehicle?.make} {cancellingBooking.vehicle?.model} • Pickup on {new Date(cancellingBooking.pickupDate).toLocaleDateString()}
              </p>
            </div>

            {cancelSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-foreground">Booking Successfully Cancelled</h3>
                <p className="text-xs text-muted-foreground">
                  Your refund has been credited directly to your Jatra Wallet balance. The vehicle dates have been released.
                </p>
              </div>
            ) : (
              <>
                {/* Cancellation Policy Calculation Card */}
                {(() => {
                  const est = getCancellationEstimate(cancellingBooking);
                  return (
                    <div className="p-4 rounded-xl bg-muted/40 border space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          Time Until Pickup:
                        </span>
                        <span className="font-mono text-foreground font-black">
                          {est.diffHours} Hours
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-[11px]">
                        Policy Tier: {est.tierDescription}
                      </div>

                      <div className="space-y-1.5 pt-2 border-t">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Total Amount Paid:</span>
                          <span className="font-mono font-bold text-foreground">${cancellingBooking.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span>Cancellation Fee ({est.feePercent}%):</span>
                          <span className="font-mono font-bold">-${est.cancellationFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm pt-1 border-t">
                          <span className="flex items-center gap-1">
                            <Wallet className="w-4 h-4" /> Wallet Refund Amount:
                          </span>
                          <span className="font-mono font-black">+${est.refundAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Reason Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reason for Cancellation (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Let us know why you need to cancel this booking..."
                    className="w-full bg-muted/30 border rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
                  />
                </div>

                {cancelError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{cancelError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCancellingBooking(null)}
                    className="text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-4"
                  >
                    Keep Booking
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
    </div>
  );
}
