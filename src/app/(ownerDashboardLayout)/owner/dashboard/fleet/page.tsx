"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { centersService } from "@/services/centers.service";
import { vehiclesService } from "@/services/vehicles.service";
import { Car, Plus, X } from "lucide-react";

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    pricePerDay: "",
    features: "",
    image: null as File | null
  });

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const user = await authService.getMe();
      if (user?.data?.managedCenter?.id) {
        const center = await centersService.getCenterById(user.data.managedCenter.id);
        setVehicles(center.data?.rentalFleet || []);
      }
    } catch (error) {
      console.error("Error fetching fleet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payloadData = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        licensePlate: formData.licensePlate,
        pricePerDay: parseFloat(formData.pricePerDay),
        type: 'RENTAL_FLEET',
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean)
      };
      
      const payload = new FormData();
      payload.append('data', JSON.stringify(payloadData));
      if (formData.image) {
        payload.append('image', formData.image);
      }

      await vehiclesService.registerVehicle(payload);
      setShowAddModal(false);
      setFormData({ make: "", model: "", year: "", licensePlate: "", pricePerDay: "", features: "", image: null });
      fetchFleet();
    } catch (error) {
      console.error("Error registering vehicle:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      await vehiclesService.updateVehicle(id, { 
        isAvailable: !isAvailable 
      });
      fetchFleet();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#1a1a1a] uppercase tracking-wider mb-6">Fleet Vehicles</h1>
        <Button onClick={() => setShowAddModal(true)} className="bg-[#E60000] hover:bg-[#E60000]/90 text-white font-bold uppercase tracking-wider text-xs rounded-sm gap-2">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading fleet...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-card border rounded-xl p-16 text-center shadow-sm">
          <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold uppercase tracking-wider text-[#1a1a1a] mb-2">No Vehicles Found</h3>
          <p className="text-muted-foreground mb-6">Your rental fleet is empty. Add a vehicle to get started.</p>
          <Button onClick={() => setShowAddModal(true)} className="font-bold uppercase tracking-wider text-xs rounded-sm">
            Add First Vehicle
          </Button>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Make/Model</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Year</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">License Plate</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Price/Day</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest">Status</th>
                  <th className="p-4 font-semibold text-[#1a1a1a] text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors border-t">
                    <td className="p-4 font-semibold text-[#1a1a1a]">{v.make} {v.model}</td>
                    <td className="p-4 text-muted-foreground">{v.year}</td>
                    <td className="p-4 font-mono text-sm">{v.licensePlate}</td>
                    <td className="p-4 font-semibold text-[#1a1a1a]">${v.pricePerDay}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        v.isAvailable !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {v.isAvailable !== false ? 'AVAILABLE' : 'UNAVAILABLE'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-bold text-[10px] uppercase tracking-wider rounded-sm"
                        onClick={() => toggleAvailability(v.id, v.isAvailable !== false)}
                      >
                        Toggle Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-extrabold uppercase tracking-wider text-[#1a1a1a]">Add Vehicle</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-[#1a1a1a]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Make</label>
                  <input required type="text" value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} className="w-full border rounded-sm p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Model</label>
                  <input required type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full border rounded-sm p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Year</label>
                  <input required type="number" min="1900" max="2100" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full border rounded-sm p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">License Plate</label>
                  <input required type="text" value={formData.licensePlate} onChange={(e) => setFormData({...formData, licensePlate: e.target.value})} className="w-full border rounded-sm p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Price Per Day ($)</label>
                <input required type="number" step="0.01" min="0" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} className="w-full border rounded-sm p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Features (comma separated)</label>
                <input type="text" placeholder="AC, Bluetooth, GPS" value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} className="w-full border rounded-sm p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Vehicle Image (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFormData({...formData, image: e.target.files[0]});
                  }
                }} className="w-full border rounded-sm p-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="uppercase font-bold tracking-wider text-xs rounded-sm">Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-[#E60000] hover:bg-[#E60000]/90 text-white uppercase font-bold tracking-wider text-xs rounded-sm">
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
