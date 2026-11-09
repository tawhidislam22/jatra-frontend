"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { bookingsService } from "@/services/bookings.service";
import { 
  Calendar, 
  Car, 
  User, 
  Wallet, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Clock, 
  Eye,
  Info
} from "lucide-react";
import { RentalBooking } from "@/types/jatra";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<RentalBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Detail Modal State
  const [selectedBooking, setSelectedBooking] = useState<RentalBooking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsService.getBookings();
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setBookings(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await bookingsService.updateStatus(id, { status });
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const getCancellationEstimate = (booking: RentalBooking) => {
    const now = new Date().getTime();
    const pickupTime = new Date(booking.pickupDate).getTime();
    const diffHours = (pickupTime - now) / (1000 * 60 * 60);
    const amount = booking.totalAmount || 0;

    let feePercent = 0;
    let tierDescription = "Full 100% Refund (>= 3 days in advance)";

    if (diffHours >= 72) {
      feePercent = 0;
      tierDescription = "100% Refund to Customer (>= 3 days before pickup)";
    } else if (diffHours >= 24) {
      feePercent = 10;
      tierDescription = "90% Refund to Customer • 10% Fee Retained by Host";
    } else {
      feePercent = 30;
      tierDescription = "70% Refund to Customer • 30% Fee Retained by Host";
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

  const handleOpenCancelModal = (b: RentalBooking) => {
    setCancellingBooking(b);
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
        reason: cancelReason.trim() || "Host cancelled booking"
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest";
    switch (status) {
      case 'PENDING': return <span className={`${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`}>PENDING</span>;
      case 'ACCEPTED': return <span className={`${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`}>CONFIRMED</span>;
      case 'IN_PROGRESS': return <span className={`${baseClasses} bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400`}>IN_PROGRESS</span>;
      case 'COMPLETED': return <span className={`${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`}>COMPLETED</span>;
      case 'CANCELLED': return <span className={`${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`}>CANCELLED</span>;
      default: return <span className={`${baseClasses} bg-muted text-gray-700`}>{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">Loading rental bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">Rental Bookings</h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Review customer rental reservations, locked daily rate snapshots, and cancellation ledger</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-card border rounded-2xl p-16 text-center shadow-sm space-y-3">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">No Bookings Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">There are no rental bookings placed for your fleet vehicles yet.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Customer</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Vehicle</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Rental Dates</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Daily Rate Snapshot</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Total Amount</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Status</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((b) => {
                  const customerName = (b as any).customer?.fullName || (b as any).customer?.name || (b as any).customer?.email?.split('@')[0] || "Customer";
                  const customerEmail = (b as any).customer?.email || "";
                  const vehicle = b.vehicle;

                  return (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs uppercase">{customerName}</p>
                            {customerEmail && (
                              <p className="text-[10px] text-muted-foreground">{customerEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div>
                          <p className="font-bold text-foreground text-xs uppercase">
                            {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                          </p>
                          {vehicle?.licensePlate && (
                            <p className="font-mono text-[10px] text-muted-foreground">{vehicle.licensePlate}</p>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-xs font-semibold text-foreground">
                        {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : 'N/A'} &rarr; {b.returnDate ? new Date(b.returnDate).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-xs font-bold bg-muted/60 px-2 py-0.5 rounded border text-foreground">
                          ${(b.dailyPriceSnapshot || vehicle?.pricePerDay || 0).toFixed(2)}/day
                        </span>
                      </td>

                      <td className="p-4 font-black font-mono text-foreground text-sm">
                        ${b.totalAmount.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          {getStatusBadge(b.status)}
                          {b.status === 'CANCELLED' && b.refundAmount !== undefined && (
                            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <Wallet className="w-3 h-3" /> Refunded: ${b.refundAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBooking(b)}
                            className="text-xs font-bold uppercase tracking-wider rounded-xl h-8 px-2.5"
                          >
                            <Eye className="w-3 h-3 mr-1" /> View
                          </Button>

                          {b.status === 'PENDING' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="font-bold text-xs uppercase tracking-wider rounded-xl h-8 text-primary border-primary/30 hover:bg-primary/10"
                              onClick={() => handleUpdateStatus(b.id, 'ACCEPTED')}
                            >
                              Confirm
                            </Button>
                          )}

                          {b.status === 'ACCEPTED' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="font-bold text-xs uppercase tracking-wider rounded-xl h-8 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                              onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                            >
                              Complete
                            </Button>
                          )}

                          {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                            <Button 
                              variant="outline"
                              size="sm" 
                              className="font-bold text-xs uppercase tracking-wider rounded-xl h-8 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleOpenCancelModal(b)}
                            >
                              Cancel
                            </Button>
                          )}
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">
                Booking ID: {selectedBooking.id}
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                Rental Booking Details
              </h2>
              <div className="pt-1">{getStatusBadge(selectedBooking.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Vehicle</span>
                <p className="font-extrabold text-foreground">
                  {selectedBooking.vehicle?.make} {selectedBooking.vehicle?.model}
                </p>
                <p className="text-muted-foreground">Plate: {selectedBooking.vehicle?.licensePlate}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Customer</span>
                <p className="font-extrabold text-foreground">
                  {(selectedBooking as any).customer?.fullName || (selectedBooking as any).customer?.name || "Customer"}
                </p>
                <p className="text-muted-foreground truncate">{(selectedBooking as any).customer?.email}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Pickup Date:</span>
                <span className="font-bold text-foreground">{new Date(selectedBooking.pickupDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Return Date:</span>
                <span className="font-bold text-foreground">{new Date(selectedBooking.returnDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Locked Daily Rate:</span>
                <span className="font-mono font-bold text-foreground">${(selectedBooking.dailyPriceSnapshot || selectedBooking.vehicle?.pricePerDay || 0).toFixed(2)}/day</span>
              </div>
              <div className="flex justify-between text-base font-black pt-2 border-t text-foreground">
                <span>Total Amount:</span>
                <span className="font-mono">${selectedBooking.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {selectedBooking.status === 'CANCELLED' && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-red-600 dark:text-red-400">
                  <span>Cancelled Booking</span>
                  {selectedBooking.cancelledAt && (
                    <span className="font-mono text-[10px] opacity-80">
                      {new Date(selectedBooking.cancelledAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Fee Retained by Host:</span>
                  <span className="font-bold text-foreground">${(selectedBooking.cancellationFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Refund Credited to Customer:</span>
                  <span className="font-mono font-black">${(selectedBooking.refundAmount || 0).toFixed(2)}</span>
                </div>
                {selectedBooking.cancellationReason && (
                  <p className="text-[11px] italic text-muted-foreground pt-1 border-t border-red-500/10">
                    Reason: &ldquo;{selectedBooking.cancellationReason}&rdquo;
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBooking(null)}
                className="text-xs font-bold uppercase tracking-wider rounded-xl h-9"
              >
                Close
              </Button>
            </div>
          </div>
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
                Host Cancellation
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                Cancel Customer Booking
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cancellingBooking.vehicle?.make} {cancellingBooking.vehicle?.model} • Pickup {new Date(cancellingBooking.pickupDate).toLocaleDateString()}
              </p>
            </div>

            {cancelSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-foreground">Booking Cancelled</h3>
                <p className="text-xs text-muted-foreground">
                  Refund has been automatically credited to the customer&apos;s wallet and dates have been released.
                </p>
              </div>
            ) : (
              <>
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
                          <span>Total Paid by Customer:</span>
                          <span className="font-mono font-bold text-foreground">${cancellingBooking.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-foreground">
                          <span>Host Retained Fee ({est.feePercent}%):</span>
                          <span className="font-mono font-bold">${est.cancellationFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm pt-1 border-t">
                          <span className="flex items-center gap-1">
                            <Wallet className="w-4 h-4" /> Customer Wallet Refund:
                          </span>
                          <span className="font-mono font-black">${est.refundAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reason for Cancellation
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Provide a reason for the customer..."
                    className="w-full bg-muted/30 border rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
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
