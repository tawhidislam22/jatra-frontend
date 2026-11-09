"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { centersService } from "@/services/centers.service";
import { vehiclesService } from "@/services/vehicles.service";
import { toast } from "sonner";
import { 
  Car, 
  Plus, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  AlertCircle,
  Edit2,
  CheckCircle2,
  Info,
  DollarSign
} from "lucide-react";

export default function FleetPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Vehicle Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    pricePerDay: "",
    features: "",
    centerId: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Vehicle Modal
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    pricePerDay: "",
    features: "",
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchFleet = async () => {
    try {
      setLoading(true);
      let centersList: any[] = [];
      if (user?.id) {
        try {
          const centersRes = await centersService.getAllCenters({ adminId: user.id });
          if (centersRes?.data && centersRes.data.length > 0) {
            centersList = centersRes.data;
          }
        } catch (err) {
          console.error("Failed to query centers by adminId", err);
        }
      }

      if (centersList.length === 0 && user?.managedCenters && user.managedCenters.length > 0) {
        centersList = user.managedCenters;
      } else if (centersList.length === 0 && user?.managedCenter) {
        centersList = [user.managedCenter];
      }

      setCenters(centersList);

      let allFleet: any[] = [];
      for (const center of centersList) {
        if (center?.id) {
          try {
            const detail = await centersService.getCenterById(center.id);
            if (detail?.data?.rentalFleet) {
              allFleet.push(...detail.data.rentalFleet);
            }
          } catch (e) {
            // ignore
          }
        }
      }

      const uniqueFleet = Array.from(new Map(allFleet.map((item) => [item.id, item])).values());
      setVehicles(uniqueFleet);

      if (centersList.length > 0 && !formData.centerId) {
        setFormData((prev) => ({ ...prev, centerId: centersList[0].id }));
      }
    } catch (error) {
      console.error("Error fetching fleet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFleet();
    }
  }, [user]);

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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const payload = new FormData();
      const payloadData = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        licensePlate: formData.licensePlate,
        pricePerDay: parseFloat(formData.pricePerDay),
        centerId: formData.centerId || undefined,
        type: 'RENTAL_FLEET',
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean)
      };
      
      payload.append('data', JSON.stringify(payloadData));
      if (imageFile) {
        payload.append('image', imageFile);
      }

      await vehiclesService.registerVehicle(payload);
      toast.success("Vehicle registered to your fleet!");
      setShowAddModal(false);
      setFormData({ 
        make: "", 
        model: "", 
        year: "", 
        licensePlate: "", 
        pricePerDay: "", 
        features: "", 
        centerId: centers[0]?.id || "" 
      });
      handleRemoveImage();
      fetchFleet();
    } catch (error: any) {
      console.error("Error registering vehicle:", error);
      const errMsg = error?.response?.data?.message || "Failed to register vehicle. Please check details.";
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (v: any) => {
    setEditingVehicle(v);
    setEditError("");
    setEditImageFile(null);
    setEditImagePreview(v.images && v.images.length > 0 ? v.images[0] : null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
    setEditFormData({
      make: v.make || "",
      model: v.model || "",
      year: v.year?.toString() || "",
      licensePlate: v.licensePlate || "",
      pricePerDay: (v.pricePerDay || 0).toString(),
      features: Array.isArray(v.features) ? v.features.join(", ") : "",
    });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    setSubmittingEdit(true);
    setEditError("");

    try {
      const payloadData: any = {
        make: editFormData.make,
        model: editFormData.model,
        year: parseInt(editFormData.year),
        licensePlate: editFormData.licensePlate,
        pricePerDay: parseFloat(editFormData.pricePerDay),
        features: editFormData.features.split(',').map((f: string) => f.trim()).filter(Boolean)
      };

      if (editImageFile) {
        const payload = new FormData();
        payload.append('data', JSON.stringify(payloadData));
        payload.append('image', editImageFile);
        await vehiclesService.updateVehicle(editingVehicle.id, payload);
      } else {
        if (!editImagePreview) {
          payloadData.images = [];
        }
        await vehiclesService.updateVehicle(editingVehicle.id, payloadData);
      }

      toast.success("Vehicle details and photo updated!");
      setEditingVehicle(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      await fetchFleet();
    } catch (err: any) {
      console.error("Error updating vehicle:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update vehicle.";
      setEditError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      await vehiclesService.updateVehicle(id, { 
        isAvailable: !isAvailable 
      });
      toast.info(isAvailable ? "Vehicle deactivated from rental availability." : "Vehicle activated for rental!");
      fetchFleet();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Failed to update vehicle status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">Fleet Vehicles</h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Manage rental inventory, live daily rates, and availability independently from workshop mechanics</p>
        </div>
        <Button 
          onClick={() => {
            setErrorMessage("");
            setShowAddModal(true);
          }} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs rounded-xl gap-2 h-10 px-5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">Loading fleet...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-card border rounded-2xl p-16 text-center shadow-sm space-y-3">
          <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">No Vehicles Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">Your rental fleet is empty. Add a vehicle with photos and daily pricing to make it bookable online.</p>
          <Button 
            onClick={() => {
              setErrorMessage("");
              setShowAddModal(true);
            }} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs rounded-xl h-10 px-6"
          >
            Add First Vehicle
          </Button>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Vehicle</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Year</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">License Plate</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Daily Rate</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest">Status</th>
                  <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vehicles.map((v) => {
                  const vehicleImg = v.images && v.images.length > 0 ? v.images[0] : null;

                  return (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {vehicleImg ? (
                            <img 
                              src={vehicleImg} 
                              alt={`${v.make} ${v.model}`} 
                              className="w-12 h-10 object-cover rounded-lg border shrink-0 bg-muted" 
                            />
                          ) : (
                            <div className="w-12 h-10 bg-muted/60 rounded-lg border flex items-center justify-center text-muted-foreground shrink-0">
                              <Car className="w-5 h-5 opacity-60" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground text-sm uppercase">{v.make} {v.model}</p>
                            {v.features && v.features.length > 0 && (
                              <p className="text-[11px] text-muted-foreground truncate max-w-xs">{v.features.join(", ")}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground font-medium">{v.year}</td>
                      <td className="p-4 font-mono text-xs font-bold uppercase text-foreground">{v.licensePlate}</td>
                      <td className="p-4 font-mono font-bold text-foreground">${v.pricePerDay || 0}/day</td>
                      <td className="p-4">
                        {(() => {
                          const now = new Date();
                          const activeRental = v.rentalBookings?.find((b: any) => {
                            const p = new Date(b.pickupDate);
                            const r = new Date(b.returnDate);
                            return p <= now && r > now && ['ACCEPTED', 'IN_PROGRESS', 'PENDING'].includes(b.status);
                          });

                          if (v.isAvailable === false) {
                            return (
                              <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Deactivated
                              </span>
                            );
                          }
                          if (activeRental) {
                            return (
                              <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Currently Rented
                              </span>
                            );
                          }
                          return (
                            <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              Available
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs font-bold uppercase tracking-wider rounded-xl h-8 gap-1"
                            onClick={() => handleOpenEdit(v)}
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`text-xs font-bold uppercase tracking-wider rounded-xl h-8 ${
                              v.isAvailable !== false ? 'hover:bg-red-500/10 text-muted-foreground' : 'text-emerald-600 hover:bg-emerald-500/10'
                            }`}
                            onClick={() => toggleAvailability(v.id, v.isAvailable !== false)}
                          >
                            {v.isAvailable !== false ? 'Deactivate' : 'Activate'}
                          </Button>
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

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-foreground">Edit Vehicle</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Update daily rate and specifications
                </p>
              </div>
              <button onClick={() => setEditingVehicle(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Snapshot Guarantee Notice */}
            <div className="mx-6 mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <Info className="w-4 h-4 shrink-0" />
                <span>Price Snapshot Integrity</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Updating the daily rental price applies to future bookings only. Previously confirmed or historical bookings preserve their agreed rate snapshots.
              </p>
            </div>

            {editError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Make</label>
                  <input 
                    required 
                    type="text" 
                    value={editFormData.make} 
                    onChange={(e) => setEditFormData({...editFormData, make: e.target.value})} 
                    className="w-full border rounded-xl p-2.5 outline-none focus:border-primary text-xs font-medium bg-background" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Model</label>
                  <input 
                    required 
                    type="text" 
                    value={editFormData.model} 
                    onChange={(e) => setEditFormData({...editFormData, model: e.target.value})} 
                    className="w-full border rounded-xl p-2.5 outline-none focus:border-primary text-xs font-medium bg-background" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Year</label>
                  <input 
                    required 
                    type="number" 
                    min="1900" 
                    max="2100" 
                    value={editFormData.year} 
                    onChange={(e) => setEditFormData({...editFormData, year: e.target.value})} 
                    className="w-full border rounded-xl p-2.5 outline-none focus:border-primary text-xs font-medium bg-background" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">License Plate</label>
                  <input 
                    required 
                    type="text" 
                    value={editFormData.licensePlate} 
                    onChange={(e) => setEditFormData({...editFormData, licensePlate: e.target.value})} 
                    className="w-full border rounded-xl p-2.5 outline-none focus:border-primary text-xs font-medium uppercase bg-background" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Daily Rental Rate ($)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={editFormData.pricePerDay} 
                  onChange={(e) => setEditFormData({...editFormData, pricePerDay: e.target.value})} 
                  className="w-full border rounded-xl p-2.5 outline-none focus:border-primary text-xs font-medium bg-background font-mono font-bold" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Features (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="AC, Bluetooth, GPS, Leather Seats" 
                  value={editFormData.features} 
                  onChange={(e) => setEditFormData({...editFormData, features: e.target.value})} 
                  className="w-full border rounded-xl p-2.5 outline-none focus:border-primary text-xs font-medium bg-background" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Vehicle Photo
                </label>
                <div className="flex items-center gap-4">
                  {editImagePreview ? (
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border bg-muted">
                      <img src={editImagePreview} alt="Vehicle Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveEditImage}
                        title="Remove photo"
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-28 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary flex flex-col items-center justify-center text-muted-foreground bg-muted/20 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Add Photo</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editFileInputRef.current?.click()}
                      className="h-9 text-xs font-bold uppercase tracking-wider rounded-xl"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" /> {editImagePreview ? "Change Photo" : "Upload Photo"}
                    </Button>
                    <p className="text-[10px] text-muted-foreground">Select a new image to replace current car photo.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingVehicle(null)} 
                  className="uppercase font-bold tracking-wider text-xs rounded-xl h-10 px-4"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submittingEdit} 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase font-bold tracking-wider text-xs rounded-xl h-10 px-6"
                >
                  {submittingEdit ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-foreground">Add Vehicle</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Register a rental fleet car for customer bookings</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                  Vehicle Photo
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border">
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
                      className="w-28 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary flex flex-col items-center justify-center text-muted-foreground bg-muted/20 cursor-pointer transition-colors"
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
                      className="h-9 text-xs font-bold uppercase tracking-wider rounded-xl"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" /> Select Image
                    </Button>
                    <p className="text-[10px] text-muted-foreground">Upload vehicle front or side angle.</p>
                  </div>
                </div>
              </div>

              {centers.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Assigned Workshop Branch
                  </label>
                  <div className="relative">
                    <select
                      value={formData.centerId}
                      onChange={(e) => setFormData({ ...formData, centerId: e.target.value })}
                      className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-xs bg-card uppercase"
                    >
                      {centers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.address || 'Branch'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Make</label>
                  <input required type="text" value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Model</label>
                  <input required type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Year</label>
                  <input required type="number" min="1900" max="2100" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">License Plate</label>
                  <input required type="text" value={formData.licensePlate} onChange={(e) => setFormData({...formData, licensePlate: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium uppercase" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Price Per Day ($)</label>
                <input required type="number" step="0.01" min="0" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Features (comma separated)</label>
                <input type="text" placeholder="AC, Bluetooth, GPS" value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium" />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="uppercase font-bold tracking-wider text-xs rounded-xl h-10 px-4">Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase font-bold tracking-wider text-xs rounded-xl h-10 px-6">
                  {submitting ? "Saving..." : "Add Vehicle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
