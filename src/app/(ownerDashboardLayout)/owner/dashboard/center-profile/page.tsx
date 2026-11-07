"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { centersService } from "@/services/centers.service";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Star, 
  Plus, 
  X, 
  Wrench, 
  Car, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Edit3,
  Globe,
  Navigation,
  Image as ImageIcon,
  Upload,
  Trash2
} from "lucide-react";

export default function CenterProfilePage() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    latitude: 23.8103,
    longitude: 90.4125,
    services: [] as string[],
    images: [] as string[],
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [newEditService, setNewEditService] = useState("");
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // New center modal state
  const [newCenterData, setNewCenterData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    latitude: "23.8103",
    longitude: "90.4125",
    services: ["Oil Change", "Brake Service", "Engine Diagnostics", "AC Repair"] as string[],
  });
  const [newCenterImage, setNewCenterImage] = useState<File | null>(null);
  const [newCenterImagePreview, setNewCenterImagePreview] = useState<string | null>(null);
  const [newModalService, setNewModalService] = useState("");
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      let list: any[] = [];

      if (user?.id) {
        try {
          const res = await centersService.getAllCenters({ adminId: user.id });
          if (res?.data?.length > 0) {
            list = res.data;
          }
        } catch (err) {
          console.error("Failed to query centers by adminId", err);
        }
      }

      if (list.length === 0 && user?.managedCenters && user.managedCenters.length > 0) {
        list = user.managedCenters;
      } else if (list.length === 0 && user?.managedCenter) {
        list = [user.managedCenter];
      }

      setCenters(list);

      const activeId = selectedCenterId && list.some(c => c.id === selectedCenterId)
        ? selectedCenterId
        : (list.length > 0 ? list[0].id : "");

      if (activeId) {
        setSelectedCenterId(activeId);
        const activeCenter = list.find(c => c.id === activeId) || list[0];
        setEditFormData({
          name: activeCenter.name || "",
          address: activeCenter.address || "",
          phone: activeCenter.phone || "",
          description: activeCenter.description || "",
          latitude: activeCenter.latitude || 23.8103,
          longitude: activeCenter.longitude || 90.4125,
          services: activeCenter.servicesOffered || activeCenter.services || [],
          images: activeCenter.images || [],
        });
        setEditImagePreview(activeCenter.images?.[0] || null);
        setEditImageFile(null);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCenters();
    }
  }, [user]);

  const activeCenter = centers.find(c => c.id === selectedCenterId) || (centers.length > 0 ? centers[0] : null);

  const handleSelectCenter = (centerObj: any) => {
    setSelectedCenterId(centerObj.id);
    setIsEditing(false);
    setEditFormData({
      name: centerObj.name || "",
      address: centerObj.address || "",
      phone: centerObj.phone || "",
      description: centerObj.description || "",
      latitude: centerObj.latitude || 23.8103,
      longitude: centerObj.longitude || 90.4125,
      services: centerObj.servicesOffered || centerObj.services || [],
      images: centerObj.images || [],
    });
    setEditImagePreview(centerObj.images?.[0] || null);
    setEditImageFile(null);
  };

  const handleSaveEdit = async () => {
    if (!activeCenter?.id) return;
    setSavingEdit(true);
    setErrorMessage("");
    try {
      if (editImageFile) {
        const formData = new FormData();
        formData.append("name", editFormData.name);
        formData.append("address", editFormData.address);
        formData.append("phone", editFormData.phone);
        formData.append("description", editFormData.description);
        formData.append("latitude", String(editFormData.latitude));
        formData.append("longitude", String(editFormData.longitude));
        formData.append("servicesOffered", JSON.stringify(editFormData.services));
        formData.append("image", editImageFile);
        await centersService.updateCenter(activeCenter.id, formData);
      } else {
        await centersService.updateCenter(activeCenter.id, {
          name: editFormData.name,
          address: editFormData.address,
          phone: editFormData.phone,
          description: editFormData.description,
          latitude: Number(editFormData.latitude),
          longitude: Number(editFormData.longitude),
          servicesOffered: editFormData.services,
          images: editFormData.images,
        });
      }
      setIsEditing(false);
      await fetchCenters();
    } catch (error: any) {
      console.error("Error updating workshop:", error);
      setErrorMessage(error?.response?.data?.message || "Failed to update workshop information.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateNewCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdd(true);
    setErrorMessage("");
    try {
      let payloadData: any;
      if (newCenterImage) {
        const formData = new FormData();
        formData.append("name", newCenterData.name);
        formData.append("address", newCenterData.address);
        formData.append("phone", newCenterData.phone);
        formData.append("description", newCenterData.description);
        formData.append("latitude", newCenterData.latitude || "23.8103");
        formData.append("longitude", newCenterData.longitude || "90.4125");
        formData.append("servicesOffered", JSON.stringify(newCenterData.services));
        formData.append("image", newCenterImage);
        payloadData = formData;
      } else {
        payloadData = {
          name: newCenterData.name,
          address: newCenterData.address,
          phone: newCenterData.phone,
          description: newCenterData.description,
          latitude: parseFloat(newCenterData.latitude) || 23.8103,
          longitude: parseFloat(newCenterData.longitude) || 90.4125,
          servicesOffered: newCenterData.services,
          images: [],
        };
      }

      const created = await centersService.registerCenter(payloadData);
      setShowAddModal(false);
      setNewCenterData({
        name: "",
        address: "",
        phone: "",
        description: "",
        latitude: "23.8103",
        longitude: "90.4125",
        services: ["Oil Change", "Brake Service", "Engine Diagnostics", "AC Repair"],
      });
      setNewCenterImage(null);
      setNewCenterImagePreview(null);
      await fetchCenters();
      if (created?.data?.id) {
        setSelectedCenterId(created.data.id);
      }
    } catch (error: any) {
      console.error("Error creating workshop:", error);
      setErrorMessage(error?.response?.data?.message || "Failed to create new workshop.");
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCenterImage(file);
      setNewCenterImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddEditService = () => {
    if (newEditService.trim() && !editFormData.services.includes(newEditService.trim())) {
      setEditFormData({
        ...editFormData,
        services: [...editFormData.services, newEditService.trim()],
      });
      setNewEditService("");
    }
  };

  const handleRemoveEditService = (service: string) => {
    setEditFormData({
      ...editFormData,
      services: editFormData.services.filter((s) => s !== service),
    });
  };

  const handleAddModalService = () => {
    if (newModalService.trim() && !newCenterData.services.includes(newModalService.trim())) {
      setNewCenterData({
        ...newCenterData,
        services: [...newCenterData.services, newModalService.trim()],
      });
      setNewModalService("");
    }
  };

  const handleRemoveModalService = (service: string) => {
    setNewCenterData({
      ...newCenterData,
      services: newCenterData.services.filter((s) => s !== service),
    });
  };

  if (loading && centers.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">
        Loading workshops...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header & Add Workshop Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-wider">
            Workshops & Branches
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Manage your company&apos;s automotive workshop branches across the country
          </p>
        </div>

        <Button
          onClick={() => {
            setErrorMessage("");
            setShowAddModal(true);
          }}
          className="bg-[#E60000] hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs rounded-sm h-11 px-5"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Workshop
        </Button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Workshop Branch Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            All Company Locations ({centers.length})
          </Label>
          <span className="text-[11px] text-muted-foreground font-medium">
            Click a branch to view and manage details
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centers.map((c) => {
            const isSelected = c.id === activeCenter?.id;
            const centerImg = c.images && c.images.length > 0 ? c.images[0] : null;

            return (
              <div
                key={c.id}
                onClick={() => handleSelectCenter(c)}
                className={`rounded-xl border cursor-pointer overflow-hidden transition-all duration-200 ${
                  isSelected
                    ? "bg-stone-900 text-white border-primary shadow-md ring-2 ring-primary/40"
                    : "bg-card hover:bg-muted/40 border-border text-card-foreground shadow-xs"
                }`}
              >
                {centerImg && (
                  <div className="h-32 w-full overflow-hidden bg-stone-800 relative">
                    <img 
                      src={centerImg} 
                      alt={c.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm truncate uppercase tracking-tight">
                        {c.name}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${
                      c.isApproved ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {c.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>

                  <p className={`text-xs truncate flex items-center gap-1 mb-3 ${isSelected ? "text-stone-300" : "text-muted-foreground"}`}>
                    <MapPin className="w-3 h-3 shrink-0 text-primary" />
                    {c.address || "Location on file"}
                  </p>

                  <div className={`pt-3 border-t flex items-center justify-between text-[11px] font-semibold ${isSelected ? "border-stone-800 text-stone-400" : "border-border/60 text-muted-foreground"}`}>
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      {c.mechanics?.length || 0} Mechanics
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {c.rentalFleet?.length || 0} Fleet
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      {c.rating || "0.0"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Workshop Profile Details */}
      {activeCenter && (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm space-y-0">
          {/* Top Center Banner Image (if available) */}
          {activeCenter.images && activeCenter.images.length > 0 && !isEditing && (
            <div className="h-48 md:h-64 w-full overflow-hidden bg-stone-900 relative">
              <img
                src={activeCenter.images[0]}
                alt={activeCenter.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="bg-primary text-white text-[10px] font-black uppercase px-2.5 py-1 rounded">
                  Workshop Image
                </span>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-1 text-white">
                  {activeCenter.name}
                </h2>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8 space-y-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        Selected Branch
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        activeCenter.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {activeCenter.isApproved ? "Verified & Approved" : "Pending Verification"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                      {activeCenter.name}
                    </h2>
                  </div>

                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="font-bold uppercase tracking-wider text-xs h-10 px-4"
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Workshop Info
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Address & Location</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{activeCenter.address || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Direct Contact Phone</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{activeCenter.phone || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0 mt-0.5">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GPS Coordinates</p>
                        <p className="text-xs font-semibold text-foreground mt-0.5">
                          Lat: {activeCenter.latitude || 23.8103}, Lng: {activeCenter.longitude || 90.4125}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg shrink-0 mt-0.5">
                        <Star className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer Rating</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1">
                          {activeCenter.rating || 0} / 5.0 (0 Reviews)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Services Offered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(activeCenter.servicesOffered || activeCenter.services || []).length > 0 ? (
                        (activeCenter.servicesOffered || activeCenter.services || []).map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-muted px-2.5 py-1 rounded text-xs font-bold text-foreground border"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">No services registered yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* About this Center / Description Section */}
                <div className="pt-4 border-t">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                    About this Workshop
                  </p>
                  {activeCenter.description ? (
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed bg-muted/30 p-4 rounded-lg border border-border/60">
                      {activeCenter.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded border border-dashed">
                      No custom description provided yet. Click &quot;Edit Workshop Info&quot; to add details about your workshop facilities, experience, and specialties.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Editing Form */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="text-lg font-black uppercase tracking-wider text-foreground">
                    Edit Workshop Details — {activeCenter.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="font-bold text-xs"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Image Edit Upload */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Workshop Image</Label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {editImagePreview ? (
                        <div className="relative w-36 h-24 rounded-lg overflow-hidden border">
                          <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setEditImageFile(null);
                              setEditImagePreview(null);
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-36 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                          <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-[10px] uppercase font-bold">No Image</span>
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
                          onClick={() => editFileInputRef.current?.click()}
                          className="h-10 text-xs font-bold uppercase tracking-wider rounded-sm"
                        >
                          <Upload className="w-4 h-4 mr-2" /> Upload New Photo
                        </Button>
                        <p className="text-[11px] text-muted-foreground">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Workshop / Branch Name</Label>
                    <Input
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="rounded-sm h-10 text-xs font-medium"
                      placeholder="e.g. Jatra Auto Care - Gulshan Branch"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Contact Phone</Label>
                    <Input
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="rounded-sm h-10 text-xs font-medium"
                      placeholder="+880 1711-000000"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Full Physical Address</Label>
                    <Input
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="rounded-sm h-10 text-xs font-medium"
                      placeholder="House 12, Road 45, Gulshan 2, Dhaka"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">About Workshop / Description</Label>
                    <textarea
                      rows={3}
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full border rounded-sm p-3 outline-none focus:ring-2 focus:ring-[#E60000]/20 text-xs font-medium resize-y"
                      placeholder="Describe your workshop facilities, certified technicians, diagnostic equipment, specialties, and warranty terms..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">GPS Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={editFormData.latitude}
                      onChange={(e) => setEditFormData({ ...editFormData, latitude: parseFloat(e.target.value) || 0 })}
                      className="rounded-sm h-10 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">GPS Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={editFormData.longitude}
                      onChange={(e) => setEditFormData({ ...editFormData, longitude: parseFloat(e.target.value) || 0 })}
                      className="rounded-sm h-10 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Services Offered</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editFormData.services.map((s, idx) => (
                        <span key={idx} className="bg-muted px-2.5 py-1 rounded-sm text-xs font-bold flex items-center gap-1.5 border">
                          {s}
                          <button type="button" onClick={() => handleRemoveEditService(s)} className="text-muted-foreground hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newEditService}
                        onChange={(e) => setNewEditService(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddEditService())}
                        placeholder="Add a new service and press Enter..."
                        className="rounded-sm h-10 text-xs font-medium"
                      />
                      <Button type="button" onClick={handleAddEditService} variant="outline" className="rounded-sm shrink-0">
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="uppercase font-bold text-xs rounded-sm">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="bg-[#E60000] hover:bg-red-700 text-white uppercase font-bold text-xs rounded-sm px-6"
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Workshop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg p-6 relative border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-muted-foreground focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-black text-foreground uppercase tracking-wider mb-2">
              Add New Workshop / Branch
            </h2>
            <p className="text-xs text-muted-foreground font-medium mb-6">
              Register a new automotive service location for your company
            </p>

            <form onSubmit={handleCreateNewCenter} className="space-y-4">
              {/* Workshop Photo Upload in Modal */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Workshop Photo</Label>
                <div className="flex items-center gap-4">
                  {newCenterImagePreview ? (
                    <div className="relative w-28 h-20 rounded-lg overflow-hidden border">
                      <img src={newCenterImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setNewCenterImage(null);
                          setNewCenterImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => addFileInputRef.current?.click()}
                      className="w-28 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center text-muted-foreground bg-muted/20 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Add Photo</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAddImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addFileInputRef.current?.click()}
                      className="h-9 text-xs font-bold uppercase tracking-wider rounded-sm"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" /> Select Image
                    </Button>
                    <p className="text-[10px] text-muted-foreground">Upload workshop facade, entrance, or bay photo.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Workshop / Branch Name</Label>
                <Input
                  required
                  value={newCenterData.name}
                  onChange={(e) => setNewCenterData({ ...newCenterData, name: e.target.value })}
                  className="rounded-sm h-10 text-xs font-medium"
                  placeholder="e.g. Jatra Auto Care - Chittagong Branch"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Contact Phone</Label>
                <Input
                  required
                  value={newCenterData.phone}
                  onChange={(e) => setNewCenterData({ ...newCenterData, phone: e.target.value })}
                  className="rounded-sm h-10 text-xs font-medium"
                  placeholder="+880 1711-223344"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Full Physical Address</Label>
                <Input
                  required
                  value={newCenterData.address}
                  onChange={(e) => setNewCenterData({ ...newCenterData, address: e.target.value })}
                  className="rounded-sm h-10 text-xs font-medium"
                  placeholder="e.g. Agrabad Commercial Area, Chittagong"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">About Workshop / Description</Label>
                <textarea
                  rows={3}
                  value={newCenterData.description}
                  onChange={(e) => setNewCenterData({ ...newCenterData, description: e.target.value })}
                  className="w-full border rounded-sm p-3 outline-none focus:ring-2 focus:ring-[#E60000]/20 text-xs font-medium resize-y"
                  placeholder="Describe this workshop branch facilities, specialties, team, equipment, and customer services..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Latitude</Label>
                  <Input
                    required
                    value={newCenterData.latitude}
                    onChange={(e) => setNewCenterData({ ...newCenterData, latitude: e.target.value })}
                    className="rounded-sm h-10 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Longitude</Label>
                  <Input
                    required
                    value={newCenterData.longitude}
                    onChange={(e) => setNewCenterData({ ...newCenterData, longitude: e.target.value })}
                    className="rounded-sm h-10 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Services Offered</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newCenterData.services.map((s, idx) => (
                    <span key={idx} className="bg-muted px-2.5 py-1 rounded-sm text-xs font-bold flex items-center gap-1.5 border">
                      {s}
                      <button type="button" onClick={() => handleRemoveModalService(s)} className="text-muted-foreground hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newModalService}
                    onChange={(e) => setNewModalService(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddModalService())}
                    placeholder="Add service (e.g. Wheel Alignment)..."
                    className="rounded-sm h-10 text-xs font-medium"
                  />
                  <Button type="button" onClick={handleAddModalService} variant="outline" className="rounded-sm shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submittingAdd}
                className="w-full bg-[#E60000] hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-sm h-11 mt-4"
              >
                {submittingAdd ? "Creating Workshop..." : "Create Workshop Branch"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
