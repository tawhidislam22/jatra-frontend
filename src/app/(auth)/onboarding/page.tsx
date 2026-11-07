"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { centersService } from "@/services/centers.service";
import { vehiclesService } from "@/services/vehicles.service";

const SERVICES_LIST = [
  "Engine Repair",
  "Oil Change",
  "Wheel Alignment",
  "Full Inspection",
  "Dent & Paint",
  "Brake Service",
  "AC Service",
  "General Maintenance",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [centerId, setCenterId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Step 1 State
  const [centerInfo, setCenterInfo] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    latitude: "",
    longitude: "",
  });
  const [centerImage, setCenterImage] = useState<File | null>(null);

  // Step 2 State
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState("");

  // Step 3 State
  const [vehicleInfo, setVehicleInfo] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    pricePerDay: "",
  });
  const [vehicleImage, setVehicleImage] = useState<File | null>(null);
  const [vehicleAdded, setVehicleAdded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authService.getMe();
        if (res?.data) {
          const user = res.data;
          
          let centerIdToUse = user.data?.managedCenter?.id;

          // If managedCenter is not in getMe response, try fetching it directly
          if (!centerIdToUse) {
            try {
              const centerRes = await centersService.getAllCenters({ adminId: user.id });
              if (centerRes?.data?.length > 0) {
                centerIdToUse = centerRes.data[0].id;
              }
            } catch (err) {
              console.error("Failed to check existing centers:", err);
            }
          }

          // If the user already has a center but is on Step 1, auto-skip to Step 2
          if (centerIdToUse) {
            setCenterId(centerIdToUse);
            if (currentStep === 1) {
              setCurrentStep(2);
            }
          }
          
          // Refresh the token if they are an OWNER in DB, just to be safe
          if (user.role === 'OWNER') {
            try {
              const refreshRes = await authService.refreshToken();
              if (refreshRes?.data?.accessToken) {
                localStorage.setItem("token", refreshRes.data.accessToken);
              }
            } catch (e) {
              console.error("Auto-refresh token failed (likely due to cross-site cookies). Forcing re-login.");
              localStorage.removeItem("token");
              router.push("/login?message=Account+upgraded+successfully!+Please+log+in+again+to+apply+your+new+permissions.");
              return; // Stop execution so we don't render the page
            }
          }
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payloadData = {
        name: centerInfo.name,
        address: centerInfo.address,
        phone: centerInfo.phone,
        description: centerInfo.description,
        latitude: parseFloat(centerInfo.latitude),
        longitude: parseFloat(centerInfo.longitude),
      };
      
      const formData = new FormData();
      formData.append('data', JSON.stringify(payloadData));
      formData.append('name', centerInfo.name);
      formData.append('address', centerInfo.address);
      formData.append('phone', centerInfo.phone);
      formData.append('description', centerInfo.description);
      formData.append('latitude', centerInfo.latitude);
      formData.append('longitude', centerInfo.longitude);
      if (centerImage) {
        formData.append('image', centerImage);
      }

      const response = await centersService.registerCenter(formData);
      // Try multiple possible paths for the center ID depending on API response format
      const id = response?.id || response?.data?.id || response?.center?.id;
      if (id) {
        setCenterId(id);
        
        // Refresh the token so the frontend gets the new ADMIN role
        try {
          const refreshRes = await authService.refreshToken();
          if (refreshRes?.data?.accessToken) {
            localStorage.setItem("token", refreshRes.data.accessToken);
            window.dispatchEvent(new Event("storage"));
            setCurrentStep(2);
          }
        } catch (refreshErr) {
          console.error("Failed to refresh token after center creation:", refreshErr);
          // If cookies fail (cross-origin), we MUST log them out and force a re-login 
          // so they get a fresh token with the ADMIN role, otherwise Step 2 will throw 403.
          localStorage.removeItem("token");
          router.push("/login?message=Account+upgraded+successfully!+Please+log+in+again+to+continue+setup.");
        }
      } else {
        throw new Error("Failed to retrieve center ID from response.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to register center.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!centerId) throw new Error("Center ID is missing.");
      
      const allServices = [...selectedServices];
      if (customService.trim()) {
        allServices.push(customService.trim());
      }
      
      if (allServices.length === 0) {
        setError("Please select or enter at least one service.");
        setIsLoading(false);
        return;
      }
      
      await centersService.updateCenter(centerId, { servicesOffered: allServices });
      setCurrentStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to update services.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payloadData = {
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: parseInt(vehicleInfo.year),
        licensePlate: vehicleInfo.licensePlate,
        pricePerDay: parseFloat(vehicleInfo.pricePerDay),
        type: "RENTAL_FLEET",
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payloadData));
      if (vehicleImage) {
        formData.append('image', vehicleImage);
      }

      await vehiclesService.registerVehicle(formData);
      setVehicleAdded(true);
      setCurrentStep(4);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to add vehicle.");
    } finally {
      setIsLoading(false);
    }
  };

  const skipStep3 = () => {
    setCurrentStep(4);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 flex items-center w-full bg-card p-4 sm:p-6 rounded-sm shadow-sm overflow-hidden">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className={`flex items-center ${step < 4 ? "flex-1" : ""}`}>
            <div
              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                currentStep >= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full ${
                  currentStep > step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-sm shadow-2xl p-8 md:p-12 border-t-4 border-primary">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold uppercase tracking-wider rounded-sm border border-red-100">
            {error}
          </div>
        )}

        {/* STEP 1: Business Information */}
        {currentStep === 1 && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl uppercase tracking-tight font-extrabold text-foreground mb-2">Business Details</h1>
              <p className="text-muted-foreground font-medium">Tell us about your automotive center</p>
            </div>
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="name">Center Name</Label>
                <Input
                  id="name"
                  required
                  value={centerInfo.name}
                  onChange={(e) => setCenterInfo({ ...centerInfo, name: e.target.value })}
                  className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="address">Address</Label>
                <Input
                  id="address"
                  required
                  value={centerInfo.address}
                  onChange={(e) => setCenterInfo({ ...centerInfo, address: e.target.value })}
                  className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={centerInfo.phone}
                  onChange={(e) => setCenterInfo({ ...centerInfo, phone: e.target.value })}
                  className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="description">About Center / Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  value={centerInfo.description}
                  onChange={(e) => setCenterInfo({ ...centerInfo, description: e.target.value })}
                  placeholder="Describe your center facilities, certified team, and services..."
                  className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-4 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm resize-y"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    required
                    value={centerInfo.latitude}
                    onChange={(e) => setCenterInfo({ ...centerInfo, latitude: e.target.value })}
                    className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    required
                    value={centerInfo.longitude}
                    onChange={(e) => setCenterInfo({ ...centerInfo, longitude: e.target.value })}
                    className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="image">Business Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setCenterImage(e.target.files[0]);
                    }
                  }}
                  className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-[#1a1a1a] file:transition-colors"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-zinc-800 text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] h-14"
              >
                {isLoading ? "Saving..." : "Next Step"}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: Services Offered */}
        {currentStep === 2 && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl uppercase tracking-tight font-extrabold text-foreground mb-2">Services Offered</h1>
              <p className="text-muted-foreground font-medium">Select the services your center provides</p>
            </div>
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {SERVICES_LIST.map((service) => (
                  <label key={service} className="flex items-center space-x-3 cursor-pointer p-4 border border-border rounded-sm hover:bg-muted/60">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary rounded-sm border-gray-300 focus:ring-primary"
                      checked={selectedServices.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices([...selectedServices, service]);
                        } else {
                          setSelectedServices(selectedServices.filter((s) => s !== service));
                        }
                      }}
                    />
                    <span className="text-sm font-bold text-foreground">{service}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="customService">Other Service (Optional)</Label>
                <Input
                  id="customService"
                  placeholder="e.g. Custom Detailing"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/3 bg-card border border-border hover:bg-muted/60 text-foreground rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] h-14"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 bg-primary hover:bg-zinc-800 text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] h-14"
                >
                  {isLoading ? "Saving..." : "Next Step"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Add First Vehicle */}
        {currentStep === 3 && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl uppercase tracking-tight font-extrabold text-foreground mb-2">Add First Vehicle</h1>
              <p className="text-muted-foreground font-medium">Add a rental vehicle to your fleet</p>
            </div>
            <form onSubmit={handleStep3Submit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    required
                    value={vehicleInfo.make}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                    className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    required
                    value={vehicleInfo.model}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                    className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    required
                    value={vehicleInfo.year}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
                    className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    required
                    value={vehicleInfo.licensePlate}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, licensePlate: e.target.value })}
                    className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="pricePerDay">Price Per Day ($)</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  step="any"
                  required
                  value={vehicleInfo.pricePerDay}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, pricePerDay: e.target.value })}
                  className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground" htmlFor="vehicleImage">Vehicle Image (Optional)</Label>
                <Input
                  id="vehicleImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setVehicleImage(e.target.files[0]);
                    }
                  }}
                  className="w-full bg-muted/40 border border-gray-300 shadow-sm hover:border-gray-400 text-foreground p-6 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-[#1a1a1a] file:transition-colors"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="w-1/3 bg-card border border-border hover:bg-muted/60 text-foreground rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] h-14"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 bg-primary hover:bg-zinc-800 text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] h-14"
                >
                  {isLoading ? "Saving..." : "Next Step"}
                </Button>
              </div>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={skipStep3}
                  className="text-sm font-bold text-muted-foreground hover:text-primary uppercase tracking-wider"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Confirmation */}
        {currentStep === 4 && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-20 h-20 text-emerald-500" />
            </div>
            <h1 className="text-3xl uppercase tracking-tight font-extrabold text-foreground mb-4">You're All Set!</h1>
            <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto">
              Your automotive center has been registered and is currently under review. Once approved, your center will be visible to customers.
            </p>
            
            <div className="bg-muted/40 rounded-sm p-6 mb-8 text-left border border-border">
              <h3 className="uppercase tracking-wider font-extrabold text-foreground text-sm mb-4">Summary</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Center Name</span>
                  <span className="font-semibold text-foreground">{centerInfo.name}</span>
                </li>
                <li className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Services</span>
                  <span className="font-semibold text-foreground">{selectedServices.length + (customService.trim() ? 1 : 0)} selected</span>
                </li>
                <li className="flex justify-between items-center pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fleet</span>
                  <span className="font-semibold text-foreground">{vehicleAdded ? "1 Vehicle Added" : "None Added"}</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => router.push('/owner/dashboard')}
              className="w-full bg-primary hover:bg-zinc-800 text-white rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] h-14"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
