"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { centersService } from "@/services/centers.service";
import { WORKSHOP_SERVICES, IStandardService } from "@/constants/serviceCatalog";
import { IWorkshopServicePackage } from "@/types/jatra";
import { toast } from "sonner";
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
  Trash2,
  DollarSign
} from "lucide-react";

const normalizeCenterServices = (centerObj: any): IWorkshopServicePackage[] => {
  if (centerObj?.customServices && Array.isArray(centerObj.customServices) && centerObj.customServices.length > 0) {
    return centerObj.customServices.map((s: any, idx: number) => ({
      id: s.id || `custom-${idx}`,
      name: s.name || "Workshop Service",
      description: s.description || "",
      price: Number(s.price) || 50,
      estimatedDuration: Number(s.estimatedDuration) || 60,
      category: s.category || "General",
      iconName: s.iconName || "Wrench"
    }));
  }
  if (centerObj?.servicesOffered && Array.isArray(centerObj.servicesOffered) && centerObj.servicesOffered.length > 0) {
    return centerObj.servicesOffered.map((nameStr: string, idx: number) => {
      const match = WORKSHOP_SERVICES.find(ws => ws.name.toLowerCase() === nameStr.toLowerCase());
      if (match) {
        return { ...match };
      }
      return {
        id: `service-${idx}`,
        name: nameStr,
        description: `Professional ${nameStr} performed by certified workshop technicians.`,
        price: 50,
        estimatedDuration: 60,
        category: "General",
        iconName: "Wrench"
      };
    });
  }
  return WORKSHOP_SERVICES.slice(0, 4);
};

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
    customServices: [] as IWorkshopServicePackage[],
    images: [] as string[],
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Custom service input state
  const [customServiceName, setCustomServiceName] = useState("");
  const [customServicePrice, setCustomServicePrice] = useState(50);
  const [customServiceDuration, setCustomServiceDuration] = useState(60);
  const [customServiceDesc, setCustomServiceDesc] = useState("");

  // New center modal state
  const [newCenterData, setNewCenterData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    latitude: "23.8103",
    longitude: "90.4125",
    services: ["Oil Change & Lube", "Wheel Alignment", "Brake System Overhaul", "50-Point Full Inspection"] as string[],
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
        const initialServices = normalizeCenterServices(activeCenter);
        setEditFormData({
          name: activeCenter.name || "",
          address: activeCenter.address || "",
          phone: activeCenter.phone || "",
          description: activeCenter.description || "",
          latitude: activeCenter.latitude || 23.8103,
          longitude: activeCenter.longitude || 90.4125,
          services: initialServices.map(s => s.name),
          customServices: initialServices,
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
    const initialServices = normalizeCenterServices(centerObj);
    setEditFormData({
      name: centerObj.name || "",
      address: centerObj.address || "",
      phone: centerObj.phone || "",
      description: centerObj.description || "",
      latitude: centerObj.latitude || 23.8103,
      longitude: centerObj.longitude || 90.4125,
      services: initialServices.map(s => s.name),
      customServices: initialServices,
      images: centerObj.images || [],
    });
    setEditImagePreview(centerObj.images?.[0] || null);
    setEditImageFile(null);
  };

  const activeCenterServices = useMemo(() => {
    return normalizeCenterServices(activeCenter);
  }, [activeCenter]);

  // Service Management Handlers
  const handleAddCatalogService = (catalogItem: IStandardService) => {
    const alreadyExists = editFormData.customServices.some(
      s => s.name.toLowerCase() === catalogItem.name.toLowerCase()
    );
    if (alreadyExists) return;

    const newPkg: IWorkshopServicePackage = {
      id: catalogItem.id,
      name: catalogItem.name,
      description: catalogItem.description,
      price: catalogItem.price,
      estimatedDuration: catalogItem.estimatedDuration,
      category: catalogItem.category,
      iconName: catalogItem.iconName
    };

    setEditFormData(prev => {
      const updated = [...prev.customServices, newPkg];
      return {
        ...prev,
        customServices: updated,
        services: updated.map(s => s.name)
      };
    });
  };

  const handleUpdateServiceItem = (index: number, field: keyof IWorkshopServicePackage, value: any) => {
    setEditFormData(prev => {
      const updated = [...prev.customServices];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        customServices: updated,
        services: updated.map(s => s.name)
      };
    });
  };

  const handleRemoveServiceItem = (index: number) => {
    setEditFormData(prev => {
      const updated = prev.customServices.filter((_, idx) => idx !== index);
      return {
        ...prev,
        customServices: updated,
        services: updated.map(s => s.name)
      };
    });
  };

  const handleAddNewCustomService = () => {
    if (!customServiceName.trim()) return;
    const newPkg: IWorkshopServicePackage = {
      id: `custom-${Date.now()}`,
      name: customServiceName.trim(),
      description: customServiceDesc.trim() || `Professional ${customServiceName.trim()} service.`,
      price: Number(customServicePrice) || 50,
      estimatedDuration: Number(customServiceDuration) || 60,
      category: "Custom Service",
      iconName: "Wrench"
    };

    setEditFormData(prev => {
      const updated = [...prev.customServices, newPkg];
      return {
        ...prev,
        customServices: updated,
        services: updated.map(s => s.name)
      };
    });

    setCustomServiceName("");
    setCustomServiceDesc("");
    setCustomServicePrice(50);
    setCustomServiceDuration(60);
  };

  const handleSaveEdit = async () => {
    if (!activeCenter?.id) return;
    setSavingEdit(true);
    setErrorMessage("");
    try {
      const servicesPayload = editFormData.customServices;
      const servicesNames = servicesPayload.map(s => s.name);

      if (editImageFile) {
        const formData = new FormData();
        formData.append("name", editFormData.name);
        formData.append("address", editFormData.address);
        formData.append("phone", editFormData.phone);
        formData.append("description", editFormData.description);
        formData.append("latitude", String(editFormData.latitude));
        formData.append("longitude", String(editFormData.longitude));
        formData.append("servicesOffered", JSON.stringify(servicesNames));
        formData.append("customServices", JSON.stringify(servicesPayload));
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
          servicesOffered: servicesNames,
          customServices: servicesPayload,
          images: editFormData.images,
        });
      }
      setIsEditing(false);
      await fetchCenters();
      toast.success("Workshop profile and service catalog updated successfully!");
    } catch (error: any) {
      console.error("Error updating workshop:", error);
      const msg = error?.response?.data?.message || "Failed to update workshop information.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateNewCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdd(true);
    setErrorMessage("");
    try {
      const defaultCatalogPackages = WORKSHOP_SERVICES.slice(0, 4);
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
        formData.append("customServices", JSON.stringify(defaultCatalogPackages));
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
          customServices: defaultCatalogPackages,
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
        services: ["Oil Change & Lube", "Wheel Alignment", "Brake System Overhaul", "50-Point Full Inspection"],
      });
      setNewCenterImage(null);
      setNewCenterImagePreview(null);
      await fetchCenters();
      if (created?.data?.id) {
        setSelectedCenterId(created.data.id);
      }
      toast.success("New workshop center registered successfully!");
    } catch (error: any) {
      console.error("Error creating workshop:", error);
      const msg = error?.response?.data?.message || "Failed to create new workshop.";
      setErrorMessage(msg);
      toast.error(msg);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            Workshop Management & Service Rates
          </h1>
          <p className="text-muted-foreground text-xs font-medium mt-1">
            Configure workshop location, branch details, provided services, custom pricing ($), and estimated service time.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-zinc-800 text-white font-bold uppercase tracking-wider text-xs rounded-lg h-10 px-4 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Workshop
        </Button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {centers.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-extrabold text-lg text-foreground uppercase tracking-tight">No Workshop Registered</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Register your first automotive workshop to start receiving customer service requests, assigning mechanics, and generating revenue.
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-zinc-800 text-white font-bold uppercase tracking-wider text-xs rounded-lg h-11 px-6 shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register Workshop Now
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Workshop Branch Switcher */}
          {centers.length > 1 && (
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                Your Registered Workshops ({centers.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {centers.map((c) => {
                  const isSelected = c.id === selectedCenterId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCenter(c)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 border ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-muted/40 hover:bg-muted text-foreground border-border/80"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{c.name}</span>
                      {c.isApproved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-1" />
                      ) : (
                        <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.2 rounded font-black">
                          PENDING
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Workshop Profile Card */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            {!isEditing ? (
              /* View Mode */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-6">
                  <div className="flex items-start gap-4">
                    {activeCenter.images && activeCenter.images.length > 0 ? (
                      <div className="w-24 h-20 rounded-xl overflow-hidden border shrink-0 bg-muted">
                        <img src={activeCenter.images[0]} alt={activeCenter.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-20 rounded-xl bg-muted border flex items-center justify-center shrink-0 text-muted-foreground">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{activeCenter.name}</h2>
                        {activeCenter.isApproved ? (
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                            Verified
                          </span>
                        ) : (
                          <span className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {activeCenter.id}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="font-bold uppercase tracking-wider text-xs h-10 px-4 rounded-xl shrink-0"
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Info & Service Rates
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
                        <p className="text-xs font-semibold text-foreground mt-0.5 font-mono">
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
                        <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1 font-bold text-amber-500">
                          {activeCenter.rating || 5.0} / 5.0
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned Mechanics</p>
                    <p className="text-sm font-extrabold text-foreground">
                      {(activeCenter.mechanics || []).length} Mechanics on roster
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Publicly bookable slots rely on active mechanics on duty.
                    </p>
                  </div>
                </div>

                {/* About this Center / Description Section */}
                <div className="pt-4 border-t">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                    About this Workshop
                  </p>
                  {activeCenter.description ? (
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/60">
                      {activeCenter.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-xl border border-dashed">
                      No custom description provided yet. Click &quot;Edit Info & Service Rates&quot; to add details about your workshop facilities and specialties.
                    </p>
                  )}
                </div>

                {/* Workshop Services, Pricing & Duration Menu */}
                <div className="pt-6 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-500" /> Services Provided, Price & Service Time
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        Customers selecting this center on the booking route will choose from these services at your configured prices and durations.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold uppercase rounded-xl"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Adjust Service Rates
                    </Button>
                  </div>

                  {activeCenterServices.length === 0 ? (
                    <div className="p-6 bg-muted/20 border border-dashed rounded-xl text-center space-y-2">
                      <p className="text-xs text-muted-foreground">No services configured yet for this workshop.</p>
                      <Button size="sm" onClick={() => setIsEditing(true)} className="text-xs font-bold">
                        Add Services & Pricing
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeCenterServices.map((service, idx) => (
                        <div key={idx} className="p-4 rounded-xl border bg-card/60 shadow-xs space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-extrabold text-sm uppercase text-foreground leading-snug">{service.name}</span>
                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded text-xs font-black shrink-0">
                              ${service.price}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                            <span className="flex items-center gap-1 text-foreground">
                              <Clock className="w-3.5 h-3.5 text-amber-500" /> {service.estimatedDuration} mins
                            </span>
                            {service.category && (
                              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono uppercase">
                                {service.category}
                              </span>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                              {service.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Editing Form */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-wider text-foreground">
                      Edit Workshop Details & Service Menu — {activeCenter.name}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      Configure your workshop info, provided services, prices ($), and estimated repair times.
                    </p>
                  </div>
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
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Workshop Cover Photo</Label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {editImagePreview ? (
                        <div className="relative w-36 h-24 rounded-xl overflow-hidden border">
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
                        <div className="w-36 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
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
                          className="h-10 text-xs font-bold uppercase tracking-wider rounded-xl"
                        >
                          <Upload className="w-4 h-4 mr-1.5" /> Upload Photo
                        </Button>
                        <p className="text-[11px] text-muted-foreground">JPG, PNG or WEBP up to 5MB.</p>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Workshop Name</Label>
                    <Input
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="rounded-xl h-10 text-xs font-medium"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Contact Phone</Label>
                    <Input
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="rounded-xl h-10 text-xs font-medium"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Physical Address</Label>
                    <Input
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="rounded-xl h-10 text-xs font-medium"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">About / Facilities Description</Label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      rows={3}
                      className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium resize-y bg-background"
                    />
                  </div>

                  {/* GPS Coordinates */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">GPS Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={editFormData.latitude}
                      onChange={(e) => setEditFormData({ ...editFormData, latitude: parseFloat(e.target.value) || 0 })}
                      className="rounded-xl h-10 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">GPS Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={editFormData.longitude}
                      onChange={(e) => setEditFormData({ ...editFormData, longitude: parseFloat(e.target.value) || 0 })}
                      className="rounded-xl h-10 text-xs font-medium"
                    />
                  </div>

                  {/* Comprehensive Services, Time & Price Manager */}
                  <div className="space-y-4 md:col-span-2 pt-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <Label className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-amber-500" /> Services Provided, Price ($) & Service Time (Minutes)
                        </Label>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                          Configure which services your center offers, how much you charge ($), and the estimated duration (minutes) for slot booking.
                        </p>
                      </div>
                    </div>

                    {/* Quick-Add Standard Catalog Services */}
                    <div className="p-4 bg-muted/30 border rounded-xl space-y-2.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Quick Add from Standard Catalog:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {WORKSHOP_SERVICES.map((pkg) => {
                          const alreadyAdded = editFormData.customServices.some(
                            s => s.name.toLowerCase() === pkg.name.toLowerCase()
                          );
                          return (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => handleAddCatalogService(pkg)}
                              disabled={alreadyAdded}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                alreadyAdded
                                  ? "bg-muted text-muted-foreground border-border/50 opacity-50 cursor-not-allowed"
                                  : "bg-card hover:bg-amber-500/10 hover:border-amber-500 text-foreground"
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5 text-amber-500" />
                              <span>{pkg.name}</span>
                              <span className="text-[10px] text-muted-foreground">(${pkg.price} &bull; {pkg.estimatedDuration}m)</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Configured Services List */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Configured Workshop Menu ({editFormData.customServices.length})
                      </Label>
                      {editFormData.customServices.length === 0 ? (
                        <p className="text-xs text-amber-500 p-4 border border-dashed border-amber-500/30 rounded-xl bg-amber-500/5">
                          No services currently enabled for this center. Add at least one service from the catalog above or custom form below.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {editFormData.customServices.map((service, index) => (
                            <div key={index} className="p-4 bg-muted/20 border rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                              <div className="flex-1 min-w-[200px] space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Service Name</Label>
                                <Input
                                  value={service.name}
                                  onChange={(e) => handleUpdateServiceItem(index, "name", e.target.value)}
                                  placeholder="Service Name"
                                  className="h-9 font-extrabold text-xs uppercase"
                                />
                                <Input
                                  value={service.description || ""}
                                  onChange={(e) => handleUpdateServiceItem(index, "description", e.target.value)}
                                  placeholder="Short service description (optional)"
                                  className="h-8 text-[11px] text-muted-foreground border-dashed"
                                />
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="w-28">
                                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                                    Price ($)
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">$</span>
                                    <Input
                                      type="number"
                                      min="1"
                                      step="1"
                                      value={service.price}
                                      onChange={(e) => handleUpdateServiceItem(index, "price", parseFloat(e.target.value) || 0)}
                                      className="h-9 pl-6 text-xs font-black text-amber-500"
                                    />
                                  </div>
                                </div>

                                <div className="w-32">
                                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                                    Duration (mins)
                                  </label>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      min="15"
                                      step="15"
                                      value={service.estimatedDuration}
                                      onChange={(e) => handleUpdateServiceItem(index, "estimatedDuration", parseInt(e.target.value, 10) || 60)}
                                      className="h-9 text-xs font-bold pr-11"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">mins</span>
                                  </div>
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveServiceItem(index)}
                                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-9 w-9 p-0 mt-5 shrink-0"
                                  title="Remove Service"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Custom Service Box */}
                    <div className="p-4 bg-muted/30 border border-dashed rounded-xl space-y-3">
                      <Label className="text-xs font-black uppercase tracking-wider text-foreground">
                        + Add Custom Service Not in Catalog
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <Input
                            value={customServiceName}
                            onChange={(e) => setCustomServiceName(e.target.value)}
                            placeholder="Custom Service Name (e.g. Ceramic Paint Coating)"
                            className="h-9 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">$</span>
                            <Input
                              type="number"
                              min="1"
                              value={customServicePrice}
                              onChange={(e) => setCustomServicePrice(parseFloat(e.target.value) || 0)}
                              placeholder="Price"
                              className="h-9 pl-6 text-xs font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="relative">
                            <Input
                              type="number"
                              min="15"
                              step="15"
                              value={customServiceDuration}
                              onChange={(e) => setCustomServiceDuration(parseInt(e.target.value, 10) || 60)}
                              placeholder="Duration"
                              className="h-9 text-xs font-bold pr-11"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">mins</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          value={customServiceDesc}
                          onChange={(e) => setCustomServiceDesc(e.target.value)}
                          placeholder="Optional short description of what this service includes..."
                          className="h-8 text-[11px]"
                        />
                        <Button
                          type="button"
                          onClick={handleAddNewCustomService}
                          disabled={!customServiceName.trim()}
                          className="h-8 px-4 text-xs font-bold uppercase shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add to Menu
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="uppercase font-bold text-xs rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={savingEdit || editFormData.customServices.length === 0}
                    className="bg-primary hover:bg-zinc-800 text-white uppercase font-bold text-xs rounded-xl px-6"
                  >
                    {savingEdit ? "Saving Changes..." : "Save Changes & Rates"}
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
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg p-6 relative border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-black text-foreground uppercase tracking-wider mb-2">
              Add New Workshop Branch
            </h2>
            <p className="text-xs text-muted-foreground font-medium mb-6">
              Create a new automotive service center branch to offer certified repairs and fleet rentals.
            </p>

            <form onSubmit={handleCreateNewCenter} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Workshop Cover Image</Label>
                <div className="flex items-center gap-3">
                  {newCenterImagePreview ? (
                    <div className="w-20 h-16 rounded-lg overflow-hidden border shrink-0">
                      <img src={newCenterImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground bg-muted/20 shrink-0">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
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
                    onClick={() => addFileInputRef.current?.click()}
                    className="h-9 text-xs font-bold uppercase tracking-wider rounded-xl"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Choose Image
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Workshop Name</Label>
                <Input
                  required
                  value={newCenterData.name}
                  onChange={(e) => setNewCenterData({ ...newCenterData, name: e.target.value })}
                  className="rounded-xl h-10 text-xs font-medium"
                  placeholder="e.g. Apex Auto Care & Performance"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Address / City</Label>
                <Input
                  required
                  value={newCenterData.address}
                  onChange={(e) => setNewCenterData({ ...newCenterData, address: e.target.value })}
                  className="rounded-xl h-10 text-xs font-medium"
                  placeholder="e.g. Road 11, Block D, Banani, Dhaka"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Contact Phone</Label>
                <Input
                  value={newCenterData.phone}
                  onChange={(e) => setNewCenterData({ ...newCenterData, phone: e.target.value })}
                  className="rounded-xl h-10 text-xs font-medium"
                  placeholder="e.g. +880 1700 000000"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">About Workshop</Label>
                <textarea
                  rows={2}
                  value={newCenterData.description}
                  onChange={(e) => setNewCenterData({ ...newCenterData, description: e.target.value })}
                  className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium resize-y bg-background"
                  placeholder="Describe facilities, equipment, diagnostic tools, and warranty guarantees..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={newCenterData.latitude}
                    onChange={(e) => setNewCenterData({ ...newCenterData, latitude: e.target.value })}
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={newCenterData.longitude}
                    onChange={(e) => setNewCenterData({ ...newCenterData, longitude: e.target.value })}
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Default Services Provided</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newCenterData.services.map((s, idx) => (
                    <span key={idx} className="bg-muted px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border">
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
                    placeholder="Add service (e.g. Transmission Flush)..."
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                  <Button type="button" onClick={handleAddModalService} variant="outline" className="rounded-xl shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submittingAdd}
                className="w-full bg-primary hover:bg-zinc-800 text-white font-bold uppercase tracking-wider rounded-xl h-11 mt-4"
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
