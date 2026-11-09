"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Users, 
  Fuel, 
  Gauge, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CarFront, 
  Navigation, 
  Bluetooth, 
  Thermometer, 
  Camera, 
  Sun, 
  Armchair,
  ShieldCheck,
  Info,
  Wallet,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { bookingsService } from "@/services/bookings.service";
import { vehiclesService } from "@/services/vehicles.service";
import { useAuth } from "@/context/AuthContext";
import { WishlistButton } from "@/components/ui/WishlistButton";
import Link from "next/link";
import { toast } from "sonner";

const getFeatureIcon = (feature: string) => {
  switch (feature.toLowerCase()) {
    case 'gps navigation': return <Navigation className="w-4 h-4 text-primary" />;
    case 'bluetooth & usb': return <Bluetooth className="w-4 h-4 text-primary" />;
    case 'heated seats': return <Thermometer className="w-4 h-4 text-primary" />;
    case 'backup camera': return <Camera className="w-4 h-4 text-primary" />;
    case 'sunroof': return <Sun className="w-4 h-4 text-primary" />;
    case 'leather interior': return <Armchair className="w-4 h-4 text-primary" />;
    default: return <CheckCircle2 className="w-4 h-4 text-primary" />;
  }
};

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  const [vehicle, setVehicle] = useState<any>(null);
  const [bookedRanges, setBookedRanges] = useState<any[]>([]);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);

  // 1. Fetch vehicle details & availability
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        const [vehRes, availRes] = await Promise.all([
          vehiclesService.getVehicleById(params.id as string),
          bookingsService.getVehicleAvailability(params.id as string).catch(() => ({ data: [] }))
        ]);

        const vehData = vehRes?.data || vehRes;
        setVehicle(vehData);

        const rawAvail = availRes?.data || (Array.isArray(availRes) ? availRes : []);
        setBookedRanges(Array.isArray(rawAvail) ? rawAvail : []);
      } catch (err) {
        console.error("Failed to fetch vehicle:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchVehicleData();
    }
  }, [params.id]);

  // 2. Fetch customer's own active bookings to enforce single active rental constraint
  useEffect(() => {
    const fetchCustomerBookings = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await bookingsService.getBookings();
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setCustomerBookings(Array.isArray(raw) ? raw : []);
      } catch (err) {
        console.error("Failed to fetch customer bookings:", err);
      }
    };

    fetchCustomerBookings();
  }, [isAuthenticated]);

  // 3. Calculate rental days & price
  const rentalCalculation = useMemo(() => {
    if (!pickupDate || !returnDate || !vehicle?.pricePerDay) {
      return { days: 0, totalAmount: 0, isValid: false };
    }
    const pDate = new Date(`${pickupDate}T${pickupTime || "00:00"}:00`);
    const rDate = new Date(`${returnDate}T00:00:00`);

    if (pDate >= rDate) {
      return { days: 0, totalAmount: 0, isValid: false };
    }

    const diffTime = rDate.getTime() - pDate.getTime();
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = Number((days * Number(vehicle.pricePerDay)).toFixed(2));

    return { days, totalAmount, isValid: true };
  }, [pickupDate, pickupTime, returnDate, vehicle]);

  // 4. Overlap conflict checks
  const { isVehicleBookedForDates, isCustomerConflict } = useMemo(() => {
    if (!pickupDate || !returnDate) {
      return { isVehicleBookedForDates: false, isCustomerConflict: false };
    }
    const pDate = new Date(pickupDate);
    const rDate = new Date(returnDate);

    // A. Check if vehicle is already booked for these dates
    const vehicleConflict = bookedRanges.some((b) => {
      const bPick = new Date(b.pickupDate);
      const bRet = new Date(b.returnDate);
      return bPick < rDate && bRet > pDate;
    });

    // B. Check if customer already has an active overlapping rental booking
    const customerConflict = customerBookings.some((b) => {
      if (b.status === 'CANCELLED' || b.status === 'COMPLETED' || b.status === 'DONE') return false;
      const bPick = new Date(b.pickupDate);
      const bRet = new Date(b.returnDate);
      return bPick < rDate && bRet > pDate;
    });

    return {
      isVehicleBookedForDates: vehicleConflict,
      isCustomerConflict: customerConflict
    };
  }, [pickupDate, returnDate, bookedRanges, customerBookings]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      toast.error("Please sign in to book this rental vehicle.");
      router.push(`/login?redirect=${encodeURIComponent(`/vehicles/${params.id}`)}`);
      return;
    }

    if (!rentalCalculation.isValid) {
      const msg = "Please select a valid pickup date and return date (return date must be after pickup).";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (isVehicleBookedForDates) {
      const msg = "This vehicle is already reserved for the selected date range. Please select different dates.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (isCustomerConflict) {
      const msg = "You already have an active car rental during this period. One user cannot rent multiple vehicles simultaneously.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setBookingLoading(true);
    const toastId = toast.loading("Reserving vehicle & preparing secure checkout...");
    
    try {
      const pDate = new Date(`${pickupDate}T${pickupTime || "00:00"}:00`);
      const rDate = new Date(`${returnDate}T00:00:00`);

      // 1. Create the rental booking
      const bookingResponse = await bookingsService.createBooking({
        vehicleId: vehicle.id,
        pickupDate: pDate.toISOString(),
        returnDate: rDate.toISOString(),
        totalAmount: rentalCalculation.totalAmount
      });
      
      const newBookingId = bookingResponse?.data?.id || bookingResponse?.id;

      // 2. Create the Stripe checkout session
      const { paymentService } = await import("@/services/payment.service");
      const checkoutResponse = await paymentService.createCheckoutSession({
        amount: rentalCalculation.totalAmount,
        rentalBookingId: newBookingId
      });
      
      // 3. Redirect to Stripe Checkout
      if (checkoutResponse.success && checkoutResponse.data?.url) {
        toast.success("Reservation confirmed! Redirecting to payment...", { id: toastId });
        window.location.href = checkoutResponse.data.url;
      } else {
        toast.success("Booking placed successfully!", { id: toastId });
        setBooked(true);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      const errMsg = err.response?.data?.message || "Failed to create booking & payment. Please check your dates.";
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-muted/40 min-h-screen pt-24 pb-32 flex justify-center items-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="bg-muted/40 min-h-screen pt-24 pb-32 flex justify-center items-center">
        <div className="text-xl font-bold">Vehicle not found</div>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 min-h-screen pb-32">
      {/* Header Banner */}
      <div 
        className="py-24 mb-16 relative overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3166&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 -translate-y-1/2 text-[150px] font-black text-white/5 select-none z-0 tracking-tighter uppercase whitespace-nowrap"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          {vehicle.make}
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  Rental Fleet Vehicle
                </h3>
                {vehicle.isCurrentlyRented ? (
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1 bg-amber-600">
                    <Clock className="h-3 w-3" /> Currently Rented
                  </span>
                ) : (
                  <span className={`text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1 ${vehicle.isAvailable !== false ? "bg-emerald-600" : "bg-red-600"}`}>
                    <CheckCircle2 className="h-3 w-3" /> {vehicle.isAvailable !== false ? "Active for Rent" : "Inactive"}
                  </span>
                )}
                <WishlistButton vehicleId={vehicle.id} size="sm" showLabel className="bg-white/10 text-white border-white/20 hover:bg-white/20" />
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tight">
                {vehicle.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">{vehicle.model}</span>
              </h1>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <span className="text-xs text-white/80 font-bold tracking-widest uppercase flex items-center bg-white/10 px-3 py-1.5 rounded-sm">
                  {vehicle.year} Model
                </span>
                <span className="text-xs text-white/80 font-bold tracking-widest uppercase flex items-center bg-white/10 px-3 py-1.5 rounded-sm">
                  Plate: {vehicle.licensePlate}
                </span>
                {vehicle.center && (
                  <span className="text-xs text-primary font-bold tracking-widest uppercase flex items-center gap-1.5 bg-primary/20 px-3 py-1.5 rounded-sm border border-primary/30">
                    <Building2 className="w-3.5 h-3.5" /> {vehicle.center.name} ({vehicle.center.address})
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Showcase & Info */}
          <div className="lg:col-span-2 space-y-10">
            
            <motion.div 
              className="bg-card rounded-xl shadow-md p-8 md:p-12 border flex items-center justify-center min-h-[380px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {vehicle.images && vehicle.images.length > 0 ? (
                <img 
                  src={vehicle.images[0]} 
                  alt={`${vehicle.make} ${vehicle.model}`} 
                  className="w-full max-w-2xl h-auto max-h-[340px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="text-center text-muted-foreground space-y-2">
                  <CarFront className="w-16 h-16 mx-auto opacity-40" />
                  <p className="text-sm font-semibold uppercase tracking-wider">No photo uploaded</p>
                </div>
              )}
            </motion.div>

            {/* Specifications */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { icon: Users, label: "Seats", value: vehicle.features?.find((f: string) => f.includes('Seat')) || '5 Seats' },
                { icon: Settings, label: "Transmission", value: vehicle.features?.some((f: string) => f.toLowerCase().includes('auto')) ? 'Automatic' : 'Manual' },
                { icon: Fuel, label: "Fuel Type", value: vehicle.features?.some((f: string) => f.toLowerCase().includes('diesel')) ? 'Diesel' : 'Petrol' },
                { icon: Gauge, label: "Rental Availability", value: "Daily Basis" },
              ].map((spec, i) => (
                <div key={i} className="bg-card p-5 border rounded-xl shadow-xs flex flex-col items-center text-center gap-2.5">
                  <spec.icon className="w-7 h-7 text-primary" />
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{spec.label}</div>
                    <div className="font-extrabold text-foreground text-sm uppercase">{spec.value}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-card p-6 border rounded-xl"
              >
                <h4 className="text-lg font-black text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
                  <CarFront className="w-5 h-5 text-primary" /> Included Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicle.features.map((feature: string, i: number) => (
                    <div key={i} className="bg-muted/40 p-3 rounded-lg flex items-center gap-3">
                      <div className="w-7 h-7 bg-primary/10 rounded flex items-center justify-center shrink-0">
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="font-bold text-foreground text-xs uppercase tracking-wide">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Already Booked Dates Indicator */}
            {bookedRanges.length > 0 && (
              <div className="bg-card border rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Existing Reservations for this Vehicle</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  The vehicle is currently booked for the following date ranges. You may choose any non-overlapping dates:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {bookedRanges.map((b, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold"
                    >
                      {new Date(b.pickupDate).toLocaleDateString()} &rarr; {new Date(b.returnDate).toLocaleDateString()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Common Cancellation Policy Card */}
            <div className="bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-foreground">
                    Jatra Flexible Cancellation & Refund Policy
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium">
                    All refunds are automatically and instantly credited to your in-app Jatra Wallet.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-card/80 border rounded-lg p-3.5 space-y-1">
                  <div className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    &ge; 3 Days Before
                  </div>
                  <div className="text-lg font-black text-foreground">100% Refund</div>
                  <div className="text-[10px] text-muted-foreground">0% cancellation fee</div>
                </div>

                <div className="bg-card/80 border rounded-lg p-3.5 space-y-1">
                  <div className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400">
                    1 to 3 Days Before
                  </div>
                  <div className="text-lg font-black text-foreground">90% Refund</div>
                  <div className="text-[10px] text-muted-foreground">10% cancellation fee</div>
                </div>

                <div className="bg-card/80 border rounded-lg p-3.5 space-y-1">
                  <div className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">
                    &lt; 24 Hours Before
                  </div>
                  <div className="text-lg font-black text-foreground">70% Refund</div>
                  <div className="text-[10px] text-muted-foreground">30% cancellation fee</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl shadow-xl p-8 border sticky top-24 space-y-6">
              
              <div className="flex justify-between items-end pb-6 border-b">
                <div>
                  <h4 className="text-2xl font-black text-foreground uppercase tracking-tight">Reserve Fleet</h4>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">Select pickup & return dates</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-primary">${vehicle.pricePerDay}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Per Day</div>
                </div>
              </div>

              {/* Single Active Rental Constraint Alert */}
              {isCustomerConflict && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Single Rental Policy</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed">
                    You already have an active rental booking during these dates. One user cannot rent multiple vehicles simultaneously.
                  </p>
                </div>
              )}

              {/* Vehicle Already Booked Alert */}
              {isVehicleBookedForDates && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-1 text-red-800 dark:text-red-300">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Dates Unavailable</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed">
                    This vehicle is already booked for all or part of this date range. Please select another time window.
                  </p>
                </div>
              )}

              {booked ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-black text-foreground uppercase tracking-wide">Reservation Initiated!</h3>
                  <p className="text-muted-foreground font-medium text-xs leading-relaxed">
                    Your rental request has been placed. Please complete your checkout to lock in your booking.
                  </p>
                  <Button 
                    className="w-full mt-4 font-bold uppercase tracking-wider text-xs h-11"
                    onClick={() => setBooked(false)}
                  >
                    Modify Selection
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-5">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> Pickup Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full bg-muted/40 border text-foreground p-3.5 font-semibold text-xs outline-none focus:border-primary rounded-xl"
                        required
                        value={pickupDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" /> Pickup Time
                      </label>
                      <input 
                        type="time" 
                        className="w-full bg-muted/40 border text-foreground p-3.5 font-semibold text-xs outline-none focus:border-primary rounded-xl"
                        required
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> Return Date (Hand-over)
                      </label>
                      <input 
                        type="date" 
                        className="w-full bg-muted/40 border text-foreground p-3.5 font-semibold text-xs outline-none focus:border-primary rounded-xl"
                        required
                        value={returnDate}
                        min={pickupDate || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setReturnDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Price Calculation Breakdown */}
                  {rentalCalculation.isValid && (
                    <div className="bg-muted/40 p-4 rounded-xl border space-y-2 text-xs">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Daily Rate:</span>
                        <span className="font-bold text-foreground">${vehicle.pricePerDay} / day</span>
                      </div>
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Rental Duration:</span>
                        <span className="font-bold text-foreground">{rentalCalculation.days} {rentalCalculation.days === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between items-center font-bold text-sm text-foreground">
                        <span>Total Price:</span>
                        <span className="text-primary text-base font-black">${rentalCalculation.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="text-red-600 dark:text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-colors"
                    disabled={
                      bookingLoading || 
                      vehicle.isAvailable === false || 
                      isVehicleBookedForDates || 
                      isCustomerConflict || 
                      !rentalCalculation.isValid
                    }
                  >
                    {bookingLoading 
                      ? "Verifying & Redirecting to Stripe..." 
                      : isCustomerConflict
                      ? "Active Rental Exists"
                      : isVehicleBookedForDates
                      ? "Vehicle Already Booked"
                      : !rentalCalculation.isValid
                      ? "Select Dates to Book"
                      : `Book & Pay $${rentalCalculation.totalAmount.toFixed(2)}`}
                  </Button>

                  <p className="text-[10px] text-center text-muted-foreground font-medium">
                    Secured by Stripe • Instant refund to Jatra Wallet on cancellation.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
