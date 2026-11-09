"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Star, 
  Wrench, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Droplet, 
  Disc, 
  ClipboardCheck, 
  Paintbrush,
  Upload,
  X,
  ShieldCheck,
  CreditCard,
  Car,
  Image as ImageIcon
} from "lucide-react";
import { serviceRequestsService } from "@/services/services.service";
import { centersService } from "@/services/centers.service";
import { WORKSHOP_SERVICES, getServiceByNameOrId } from "@/constants/serviceCatalog";
import { useAuth } from "@/context/AuthContext";

const getServiceIcon = (iconName?: string) => {
  switch ((iconName || "").toLowerCase()) {
    case 'wrench': return <Wrench className="w-4 h-4 text-primary" />;
    case 'droplet': return <Droplet className="w-4 h-4 text-primary" />;
    case 'disc': return <Disc className="w-4 h-4 text-primary" />;
    case 'clipboardcheck': return <ClipboardCheck className="w-4 h-4 text-primary" />;
    case 'paintbrush': return <Paintbrush className="w-4 h-4 text-primary" />;
    case 'alerttriangle': return <AlertTriangle className="w-4 h-4 text-primary" />;
    default: return <Wrench className="w-4 h-4 text-primary" />;
  }
};

export default function CenterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [center, setCenter] = useState<any>(null);

  // Form State
  const [myVehicles, setMyVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedService, setSelectedService] = useState<any>(WORKSHOP_SERVICES[0]);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("09:00");
  const [issueDescription, setIssueDescription] = useState("");
  const [error, setError] = useState("");

  // Availability Slots
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Mandatory Problem Images
  const [problemFiles, setProblemFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch Center & Vehicles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centerRes, vehiclesRes] = await Promise.all([
          centersService.getCenterById(params.id as string),
          import("@/services/vehicles.service")
            .then(m => m.vehiclesService.getMyVehicles())
            .catch(() => ({ data: [] }))
        ]);
        
        if (centerRes && centerRes.data) {
          setCenter(centerRes.data);
        } else {
          setCenter(centerRes);
        }

        const rawVehicles = vehiclesRes?.data || (Array.isArray(vehiclesRes) ? vehiclesRes : []);
        setMyVehicles(rawVehicles);
        if (rawVehicles.length > 0) setSelectedVehicle(rawVehicles[0].id);
      } catch (err) {
        console.error("Failed to fetch center data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);

  // Fetch Slot Availability whenever center, date, or selected service changes
  useEffect(() => {
    if (!center?.id || !date) return;

    const fetchAvailability = async () => {
      setSlotsLoading(true);
      try {
        const duration = selectedService?.estimatedDuration || 60;
        const res = await serviceRequestsService.getCenterAvailability(center.id, date, duration);
        if (res?.data?.slots) {
          setAvailableSlots(res.data.slots);
          // Auto-select first available slot
          const firstAvailable = res.data.slots.find((s: any) => s.available);
          if (firstAvailable) {
            setTime(firstAvailable.time);
          }
        }
      } catch (err) {
        console.error("Failed to check availability:", err);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailability();
  }, [center?.id, date, selectedService]);

  // Handle Problem Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setProblemFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setProblemFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Submit Booking & Redirect to Stripe
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      router.push(`/login?redirect=/centers/${params.id}`);
      return;
    }

    if (!selectedVehicle) {
      setError("Please select a vehicle from your registered fleet or add one first.");
      return;
    }

    if (problemFiles.length === 0) {
      setError("At least one problem image showing your car issue is mandatory to proceed.");
      return;
    }

    setBookingLoading(true);

    try {
      const scheduledDateTime = new Date(`${date}T${time}:00`);

      const formData = new FormData();
      formData.append("serviceType", "WORKSHOP");
      formData.append("serviceName", selectedService.name);
      formData.append("scheduledDate", scheduledDateTime.toISOString());
      formData.append("vehicleId", selectedVehicle);
      formData.append("centerId", center.id);
      formData.append("estimatedDuration", String(selectedService.estimatedDuration));
      formData.append("totalAmount", String(selectedService.price));
      if (issueDescription.trim()) {
        formData.append("issueDescription", issueDescription.trim());
      }

      problemFiles.forEach((file) => {
        formData.append("problemImages", file);
      });

      // 1. Create provisional booking
      const requestRes = await serviceRequestsService.createRequest(formData);
      const bookingData = requestRes.data;

      // 2. Create Stripe Checkout Session
      const { paymentService } = await import("@/services/payment.service");
      const session = await paymentService.createCheckoutSession({
        amount: selectedService.price,
        serviceRequestId: bookingData?.id || requestRes.id
      });

      if (session?.data?.url) {
        window.location.href = session.data.url;
      } else {
        router.push("/dashboard/service-requests");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to process booking. Please try another slot.");
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

  if (!center) {
    return (
      <div className="bg-muted/40 min-h-screen pt-24 pb-32 flex justify-center items-center">
        <div className="text-xl font-bold">Center not found</div>
      </div>
    );
  }

  const headerImage = (center.images && center.images.length > 0) 
    ? center.images[0] 
    : "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&q=80";

  return (
    <div className="bg-muted/40 min-h-screen pb-32">
      {/* Hero Header */}
      <div 
        className="bg-[#1a1a1a] py-24 mb-16 relative overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: `url('${headerImage}')` }}
      >
        <div className="absolute inset-0 bg-black/75 z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 text-black text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Certified Workshop
              </span>
              {center.isApproved && (
                <span className="bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
              {center.name}
            </h1>
            <div className="flex flex-wrap gap-5 text-xs text-zinc-300 font-bold uppercase tracking-wider">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-amber-500" /> {center.address}</span>
              {center.phone && <span className="flex items-center"><Phone className="w-4 h-4 mr-1.5 text-amber-500" /> {center.phone}</span>}
              <span className="flex items-center"><Star className="w-4 h-4 mr-1.5 text-amber-500 fill-amber-500" /> {center.rating || 5.0} / 5.0 Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Center Profile & Services Catalog */}
          <div className="lg:col-span-2 space-y-10">
            {/* Services Offered */}
            <div className="bg-card border rounded-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-500" /> Service Packages
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    Select a certified repair or maintenance service with upfront pricing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WORKSHOP_SERVICES.map((pkg) => {
                  const isSelected = selectedService?.id === pkg.id;
                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedService(pkg)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-amber-500 bg-amber-500/5 shadow-md ring-1 ring-amber-500" 
                          : "border-border hover:border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          {getServiceIcon(pkg.iconName)}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-foreground">${pkg.price}</span>
                          <span className="block text-[10px] text-muted-foreground font-bold uppercase">{pkg.estimatedDuration} mins</span>
                        </div>
                      </div>
                      <h3 className="font-extrabold text-sm uppercase text-foreground">{pkg.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-medium">{pkg.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* About & Quality Guarantee */}
            <div className="bg-card border rounded-xl p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-black uppercase tracking-wider text-foreground">Workshop Guarantee & Inspection Process</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {center.description || "Every repair at Jatra certified workshops includes mandatory mechanic completion photos, manager quality verification, and direct customer approval. You only rate and review once your car passes complete factory inspection."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-muted/40 border text-center space-y-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold uppercase">Quality Verified</p>
                  <p className="text-[10px] text-muted-foreground">Manager-approved work</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border text-center space-y-1">
                  <CreditCard className="w-5 h-5 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold uppercase">Secure Stripe</p>
                  <p className="text-[10px] text-muted-foreground">Encrypted checkout</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border text-center space-y-1">
                  <Wrench className="w-5 h-5 text-blue-500 mx-auto" />
                  <p className="text-xs font-bold uppercase">Multi-Mechanic</p>
                  <p className="text-[10px] text-muted-foreground">Live slot reservation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Booking Widget */}
          <div className="relative">
            <div className="bg-card border rounded-xl shadow-xl p-6 sticky top-24 space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-black uppercase tracking-wider text-foreground">Book Service Slot</h3>
                <p className="text-xs text-muted-foreground font-medium">Configure vehicle, slot, and problem photo</p>
              </div>

              <form onSubmit={handleBooking} className="space-y-5">
                {/* 1. Selected Service Summary */}
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Selected Service</span>
                    <p className="font-extrabold text-sm text-foreground uppercase">{selectedService?.name}</p>
                    <span className="text-xs text-muted-foreground font-semibold">{selectedService?.estimatedDuration} mins duration</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400">${selectedService?.price}</span>
                  </div>
                </div>

                {/* 2. Vehicle Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-amber-500" /> Select Your Vehicle <span className="text-red-500">*</span>
                  </label>
                  {myVehicles.length === 0 ? (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg text-xs text-red-600">
                      You have no registered vehicles. Please add a vehicle in your Customer Dashboard first.
                    </div>
                  ) : (
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full bg-muted/40 border rounded-lg p-3 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    >
                      <option value="">-- Choose a Vehicle --</option>
                      {myVehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.year}) - {v.licensePlate}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 3. Date & Multi-Mechanic Dynamic Slot Picker */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Booking Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-muted/40 border rounded-lg p-2.5 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />

                  {/* Slot availability grid */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Available Workshop Slots ({date})
                    </span>
                    {slotsLoading ? (
                      <div className="py-4 text-center text-xs text-muted-foreground font-bold uppercase animate-pulse">
                        Checking Mechanic Capacity...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-2 text-center">No slots found for this date.</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => {
                          const isSelected = time === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setTime(slot.time)}
                              className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                                !slot.available 
                                  ? "opacity-40 bg-muted cursor-not-allowed border-dashed" 
                                  : isSelected 
                                    ? "bg-amber-500 text-black border-amber-500 shadow-sm" 
                                    : "bg-card hover:border-amber-500/50"
                              }`}
                            >
                              <div>{slot.time}</div>
                              <div className="text-[9px] font-normal uppercase tracking-tighter opacity-80">
                                {slot.available ? `${slot.availableMechanicsCount} open` : "Full"}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Mandatory Problem Images Uploader */}
                <div className="space-y-2 border-t pt-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> Car Problem Photos <span className="text-red-500">* (Mandatory)</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Min 1 image</span>
                  </label>
                  
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/30 transition-colors">
                    <input
                      type="file"
                      id="problem-image-input"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="problem-image-input" className="cursor-pointer block space-y-1.5">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
                      <p className="text-xs font-bold text-foreground">Click to upload problem photos</p>
                      <p className="text-[10px] text-muted-foreground">Shows mechanic the issue before inspection</p>
                    </label>
                  </div>

                  {/* Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border aspect-square bg-black">
                          <img src={src} alt="Problem Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Optional Issue Description */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Issue Description</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Describe any symptoms, unusual sounds, or concerns..."
                    className="w-full bg-muted/40 border rounded-lg p-2.5 text-xs font-medium text-foreground outline-none resize-none h-18 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 6. Checkout CTA */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={bookingLoading || problemFiles.length === 0 || !selectedVehicle}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-xs h-12 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                  >
                    {bookingLoading ? (
                      "Initializing Secure Checkout..."
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" /> Pay ${selectedService?.price} & Confirm Slot
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2 font-medium">
                    Protected by Stripe. Unfulfilled slots are never locked permanently.
                  </p>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
