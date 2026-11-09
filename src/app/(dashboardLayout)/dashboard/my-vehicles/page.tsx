"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { vehiclesService } from "@/services/vehicles.service";
import { CarFront, X, Upload, Image as ImageIcon, Trash2, Car } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehiclesService.getMyVehicles();
      if (res && res.data) {
        setVehicles(res.data);
      } else if (Array.isArray(res)) {
        setVehicles(res);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("make", make);
        formData.append("model", model);
        formData.append("year", year);
        formData.append("licensePlate", licensePlate);
        formData.append("type", "CUSTOMER_OWNED");
        formData.append("image", imageFile);
        await vehiclesService.registerVehicle(formData);
      } else {
        await vehiclesService.registerVehicle({
          make,
          model,
          year: parseInt(year),
          licensePlate,
          type: "CUSTOMER_OWNED"
        });
      }
      setShowAddModal(false);
      setMake("");
      setModel("");
      setYear("");
      setLicensePlate("");
      handleRemoveImage();
      fetchVehicles();
      toast.success("Vehicle registered successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to add vehicle";
      setError(msg);
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Vehicles</h1>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-zinc-800 text-white">Add Vehicle</Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">Loading Vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-card border rounded-xl p-16 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <CarFront className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Vehicles Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">You haven't added any vehicles to your account yet. Add a vehicle to easily book service requests.</p>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-zinc-800 text-white">Add Your First Vehicle</Button>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold">Year</th>
                <th className="p-4 font-semibold">License Plate</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const vehicleImg = v.images && v.images.length > 0 ? v.images[0] : null;

                return (
                  <tr key={v.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {vehicleImg ? (
                          <img 
                            src={vehicleImg} 
                            alt={`${v.make} ${v.model}`} 
                            className="w-12 h-10 object-cover rounded-md border shrink-0 bg-muted" 
                          />
                        ) : (
                          <div className="w-12 h-10 bg-muted/60 rounded-md border flex items-center justify-center text-muted-foreground shrink-0">
                            <Car className="w-5 h-5 opacity-60" />
                          </div>
                        )}
                        <span className="font-bold text-primary">{v.make} {v.model}</span>
                      </div>
                    </td>
                    <td className="p-4">{v.year}</td>
                    <td className="p-4 font-mono font-bold">{v.licensePlate}</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Active</span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href="/centers">
                        <Button variant="outline" size="sm" className="font-bold text-xs uppercase tracking-wider">Book Service</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-black uppercase tracking-tight text-foreground mb-6">Add New Vehicle</h2>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                {/* Photo Upload with Live Preview */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2">
                    Vehicle Photo (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-28 h-20 rounded-lg overflow-hidden border">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center text-muted-foreground bg-muted/20 cursor-pointer transition-colors"
                      >
                        <ImageIcon className="w-5 h-5 text-muted-foreground mb-1" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Add Photo</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 text-xs font-bold uppercase tracking-wider rounded-sm"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" /> Select Image
                      </Button>
                      <p className="text-[10px] text-muted-foreground">Upload your car photo.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2">Make</label>
                    <input 
                      type="text" 
                      className="w-full bg-muted/40 border border-border text-foreground p-3 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary rounded-sm"
                      placeholder="e.g. Toyota"
                      required
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2">Model</label>
                    <input 
                      type="text" 
                      className="w-full bg-muted/40 border border-border text-foreground p-3 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary rounded-sm"
                      placeholder="e.g. Camry"
                      required
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2">Year</label>
                  <input 
                    type="number" 
                    className="w-full bg-muted/40 border border-border text-foreground p-3 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary rounded-sm"
                    placeholder="e.g. 2022"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground mb-2">License Plate</label>
                  <input 
                    type="text" 
                    className="w-full bg-muted/40 border border-border text-foreground p-3 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary rounded-sm uppercase"
                    placeholder="e.g. ABC-1234"
                    required
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  />
                </div>
                
                {error && <div className="text-red-500 text-sm font-bold mt-2">{error}</div>}
                
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="font-bold">Cancel</Button>
                  <Button type="submit" disabled={adding} className="bg-primary hover:bg-zinc-800 text-white font-bold tracking-wide">
                    {adding ? "Adding..." : "Save Vehicle"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
