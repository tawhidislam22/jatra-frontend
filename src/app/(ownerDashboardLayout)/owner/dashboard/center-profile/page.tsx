"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { centersService } from "@/services/centers.service";
import { Star, MapPin, Phone, AlertCircle, X, Plus } from "lucide-react";

export default function CenterProfilePage() {
  const [center, setCenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    services: [] as string[],
  });
  const [newService, setNewService] = useState("");

  const fetchCenter = async () => {
    try {
      setLoading(true);
      const user = await authService.getMe();
      if (user?.managedCenter?.id) {
        const centerData = await centersService.getCenterById(user.managedCenter.id);
        setCenter(centerData);
        setFormData({
          name: centerData.name || "",
          address: centerData.address || "",
          phone: centerData.phone || "",
          services: centerData.services || [],
        });
      }
    } catch (error) {
      console.error("Error fetching center:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenter();
  }, []);

  const handleSave = async () => {
    try {
      if (center?.id) {
        await centersService.updateCenter(center.id, formData);
        setIsEditing(false);
        fetchCenter();
      }
    } catch (error) {
      console.error("Error updating center:", error);
    }
  };

  const handleAddService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData({
        ...formData,
        services: [...formData.services, newService.trim()],
      });
      setNewService("");
    }
  };

  const handleRemoveService = (service: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter((s) => s !== service),
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading center data...</div>;
  }

  if (!center) {
    return (
      <div className="bg-card border rounded-xl p-16 text-center shadow-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold uppercase tracking-wider text-[#1a1a1a] mb-2">No Center Found</h3>
        <p className="text-muted-foreground">You don't appear to be managing any center.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-[#1a1a1a] uppercase tracking-wider">Center Profile</h1>

      <div className="bg-white rounded-sm border p-8 shadow-sm">
        {!isEditing ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-wide mb-2">{center.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                    center.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {center.isApproved ? "APPROVED" : "PENDING"}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-bold bg-muted px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{center.rating || 0}</span>
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} className="uppercase font-bold tracking-wider text-xs">
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Address</p>
                    <p className="font-medium text-[#1a1a1a]">{center.address || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium text-[#1a1a1a]">{center.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Services Offered</p>
                <div className="flex flex-wrap gap-2">
                  {center.services?.length ? (
                    center.services.map((service: string, i: number) => (
                      <span key={i} className="bg-muted px-3 py-1 rounded text-sm font-semibold text-[#1a1a1a]">
                        {service}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No services listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-wider text-[#1a1a1a] mb-4">Edit Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Center Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-sm p-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border rounded-sm p-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded-sm p-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Services</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.services.map((service, i) => (
                    <div key={i} className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-sm">
                      <span className="text-sm font-semibold text-[#1a1a1a]">{service}</span>
                      <button onClick={() => handleRemoveService(service)} className="text-muted-foreground hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddService())}
                    placeholder="Add a service..."
                    className="flex-1 border rounded-sm p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                  />
                  <Button type="button" onClick={handleAddService} variant="outline" size="icon" className="shrink-0 rounded-sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="uppercase font-bold tracking-wider text-xs rounded-sm">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#E60000] hover:bg-[#E60000]/90 text-white uppercase font-bold tracking-wider text-xs rounded-sm">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
