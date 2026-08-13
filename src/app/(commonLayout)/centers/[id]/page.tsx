"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Wrench, CheckCircle2, Calendar, Clock, AlertTriangle, Droplet, Disc, ClipboardCheck, Paintbrush } from "lucide-react";

const getServiceIcon = (service: string) => {
  switch (service.toLowerCase()) {
    case 'engine repair': return <Wrench className="w-4 h-4 text-primary" />;
    case 'oil change': return <Droplet className="w-4 h-4 text-primary" />;
    case 'wheel alignment': return <Disc className="w-4 h-4 text-primary" />;
    case 'full inspection': return <ClipboardCheck className="w-4 h-4 text-primary" />;
    case 'dent paint': return <Paintbrush className="w-4 h-4 text-primary" />;
    default: return <CheckCircle2 className="w-4 h-4 text-primary" />;
  }
};

export default function CenterDetailsPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  // Mocking the data fetch
  const center = { 
    id: params.id as string, 
    name: "Jatra Premier Service", 
    address: "Road 11, Block E, Gulshan 1, Dhaka", 
    latitude: 23.7808, 
    longitude: 90.4196, 
    phone: "01744444444", 
    rating: 4.8, 
    isApproved: true, 
    servicesOffered: ["Engine Repair", "Oil Change", "Wheel Alignment", "Full Inspection", "Dent Paint"] 
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      setBooked(true);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="bg-[#f4f4f4] min-h-screen pt-24 pb-32 flex justify-center items-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-32">
      {/* Zauto Style Header */}
      <div className="bg-[#1a1a1a] py-24 mb-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[150px] font-black text-white/5 select-none z-0 tracking-tighter uppercase whitespace-nowrap">
          SERVICE
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  Center Details
                </h3>
                {center.isApproved && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tight">
                {center.name}
              </h1>
              <div className="flex flex-wrap gap-6 mt-4">
                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" /> {center.address}
                </span>
                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-primary" /> {center.phone}
                </span>
                <span className="text-xs text-gray-400 font-bold tracking-widest uppercase flex items-center">
                  <Star className="w-4 h-4 mr-2 text-primary fill-primary" /> {center.rating} / 5.0 Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Services & Info */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h4 className="text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-tight mb-6 flex items-center gap-3">
                <Wrench className="w-6 h-6 text-primary" /> Available Services
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {center.servicesOffered.map((service, i) => (
                  <div key={i} className="bg-white p-4 border border-gray-200 rounded-sm shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center shrink-0">
                      {getServiceIcon(service)}
                    </div>
                    <span className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wide">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 border border-gray-200 rounded-sm shadow-sm">
              <h4 className="text-xl font-extrabold text-[#1a1a1a] uppercase tracking-tight mb-4">About this Center</h4>
              <p className="text-gray-500 font-medium leading-loose text-sm">
                This center is equipped with state-of-the-art diagnostic tools and certified mechanics to ensure your vehicle receives the highest standard of care. We use genuine parts and provide a warranty on all our services. Experience premium automotive care with quick turnaround times.
              </p>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="relative">
            <div className="bg-white rounded-sm shadow-xl p-8 border-t-4 border-primary sticky top-32 border border-gray-100">
              <h4 className="text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-tight mb-6">Book an Appointment</h4>
              
              {booked ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-[#1a1a1a] mb-2 uppercase tracking-wide">Booking Confirmed!</h3>
                  <p className="text-gray-600 mb-6 font-medium text-xs">
                    Your appointment has been successfully scheduled. We will contact you shortly to confirm the details.
                  </p>
                  <Button 
                    className="w-full bg-transparent border-2 border-gray-200 text-gray-700 hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] rounded-sm font-bold uppercase tracking-widest text-[11px] h-12 transition-colors"
                    onClick={() => setBooked(false)}
                  >
                    Book Another Service
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-500 mb-2 flex items-center gap-2">
                      <Wrench className="w-3 h-3 text-primary" /> Service Type
                    </label>
                    <select className="w-full bg-gray-50 border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm appearance-none focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-sm cursor-pointer">
                      <option>Select a Service</option>
                      {center.servicesOffered.map((s, i) => <option key={i}>{s}</option>)}
                      <option>General Inspection</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-500 mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-primary" /> Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full bg-gray-50 border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-500 mb-2 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-primary" /> Time
                      </label>
                      <input 
                        type="time" 
                        className="w-full bg-gray-50 border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-500 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-primary" /> Issue Description
                    </label>
                    <textarea 
                      className="w-full bg-gray-50 border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm min-h-[100px] resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-sm" 
                      placeholder="Briefly describe the issue..." 
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-primary hover:bg-[#1a1a1a] text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-colors duration-300 mt-2 shadow-lg"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? "Processing..." : "Confirm Booking"}
                  </Button>
                </form>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
