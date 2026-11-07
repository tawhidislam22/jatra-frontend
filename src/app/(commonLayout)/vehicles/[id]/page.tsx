"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, Users, Fuel, Gauge, CheckCircle2, Calendar, Clock, AlertTriangle, CarFront, Navigation, Bluetooth, Thermometer, Camera, Sun, Armchair } from "lucide-react";
import { motion } from "framer-motion";
import { bookingsService } from "@/services/bookings.service";
import { vehiclesService } from "@/services/vehicles.service";

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
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await vehiclesService.getVehicleById(params.id as string);
        if (response && response.data) {
          setVehicle(response.data);
        } else {
          setVehicle(response);
        }
      } catch (err) {
        console.error("Failed to fetch vehicle:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicle();
  }, [params.id]);



  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBookingLoading(true);
    
    try {
      const pDate = new Date(`${pickupDate}T${pickupTime || "00:00"}:00`);
      const rDate = new Date(`${returnDate}T00:00:00`);
      
      const diffTime = Math.abs(rDate.getTime() - pDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      const price = Number(vehicle.pricePerDay);
      if (isNaN(price) || price < 1) {
        setError("This vehicle does not have a valid daily price set.");
        setBookingLoading(false);
        return;
      }
      const totalAmount = diffDays * price;

      // 1. Create the rental booking
      const bookingResponse = await bookingsService.createBooking({
        vehicleId: vehicle.id,
        pickupDate: pDate.toISOString(),
        returnDate: rDate.toISOString(),
        totalAmount
      });
      
      // 2. Create the Stripe checkout session
      const { paymentService } = await import("@/services/payment.service");
      const checkoutResponse = await paymentService.createCheckoutSession({
        amount: totalAmount,
        rentalBookingId: bookingResponse.data.id
      });
      
      // 3. Redirect to Stripe
      if (checkoutResponse.success && checkoutResponse.data?.url) {
        window.location.href = checkoutResponse.data.url;
      } else {
        setBooked(true); // Fallback to old behavior if no URL is returned
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || "Failed to create booking & payment");
      setBookingLoading(false); // Only stop loading if there's an error so the user isn't stuck if the redirect takes a moment
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
      {/* Zauto Style Header */}
      <div 
        className="py-24 mb-16 relative overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3166&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0" />
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
              <div className="flex items-center gap-3">
                <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  Vehicle Details
                </h3>
                <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Available
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tight">
                {vehicle.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">{vehicle.model}</span>
              </h1>
              
              <div className="flex flex-wrap gap-6 mt-4">
                <span className="text-xs text-muted-foreground font-bold tracking-widest uppercase flex items-center bg-card/10 px-3 py-1.5 rounded-sm">
                  {vehicle.year} Model
                </span>
                <span className="text-xs text-muted-foreground font-bold tracking-widest uppercase flex items-center bg-card/10 px-3 py-1.5 rounded-sm">
                  {vehicle.type}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Showcase & Info */}
          <div className="lg:col-span-2 space-y-12">
            
            <motion.div 
              className="bg-card rounded-sm shadow-xl p-12 border-t-4 border-primary flex items-center justify-center min-h-[400px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {vehicle.images && vehicle.images.length > 0 && (
                <img 
                  src={vehicle.images[0]} 
                  alt={`${vehicle.make} ${vehicle.model}`} 
                  className="w-full max-w-2xl h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
                />
              )}
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { icon: Users, label: "Seats", value: vehicle.features?.find((f: string) => f.includes('Seat')) || '5' },
                { icon: Settings, label: "Transmission", value: vehicle.features?.includes('Automatic') ? 'Auto' : 'Manual' },
                { icon: Fuel, label: "Fuel Type", value: vehicle.features?.includes('Petrol') ? 'Petrol' : vehicle.features?.includes('Diesel') ? 'Diesel' : 'Petrol' },
                { icon: Gauge, label: "Mileage", value: "Unlimited" },
              ].map((spec, i) => (
                <div key={i} className="bg-card p-6 border border-border rounded-sm shadow-sm flex flex-col items-center text-center gap-3">
                  <spec.icon className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{spec.label}</div>
                    <div className="font-extrabold text-foreground text-sm uppercase">{spec.value}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 className="text-2xl font-extrabold text-foreground uppercase tracking-tight mb-6 flex items-center gap-3">
                <CarFront className="w-6 h-6 text-primary" /> Features Included
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(vehicle.features || []).map((feature: string, i: number) => (
                  <div key={i} className="bg-card p-4 border border-border rounded-sm shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center shrink-0">
                      {getFeatureIcon(feature)}
                    </div>
                    <span className="font-bold text-foreground text-sm uppercase tracking-wide">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Booking Widget */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-card rounded-sm shadow-xl p-8 border-t-4 border-primary sticky top-32 border border-border">
              
              <div className="flex justify-between items-end mb-8 pb-8 border-b border-border">
                <div>
                  <h4 className="text-2xl font-extrabold text-foreground uppercase tracking-tight mb-1">Reserve Now</h4>
                  <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Select your dates</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-primary">${vehicle.pricePerDay}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[2px]">Per Day</div>
                </div>
              </div>
              
              {booked ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-wide">Reservation Sent!</h3>
                  <p className="text-muted-foreground mb-6 font-medium text-xs leading-loose">
                    Your rental request has been received. Our team will contact you shortly to confirm the vehicle availability and arrange pickup.
                  </p>
                  <Button 
                    className="w-full bg-transparent border-2 border-border text-gray-700 hover:bg-zinc-800 hover:text-white hover:border-[#1a1a1a] rounded-sm font-bold uppercase tracking-widest text-[11px] h-12 transition-colors"
                    onClick={() => setBooked(false)}
                  >
                    Modify Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-6">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-primary" /> Pickup Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full bg-muted/40 border border-border text-foreground p-4 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-sm"
                        required
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-primary" /> Pickup Time
                      </label>
                      <input 
                        type="time" 
                        className="w-full bg-muted/40 border border-border text-foreground p-4 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-sm"
                        required
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-primary" /> Return Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full bg-muted/40 border border-border text-foreground p-4 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-sm"
                        required
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    {error && <div className="text-red-500 text-sm mb-4 font-bold">{error}</div>}
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-primary hover:bg-zinc-800 text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-colors duration-300 shadow-lg"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? "Processing..." : "Confirm Rental"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
