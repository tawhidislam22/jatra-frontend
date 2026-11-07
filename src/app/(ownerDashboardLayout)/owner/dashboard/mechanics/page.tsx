"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { centersService } from "@/services/centers.service";
import { useAuth } from "@/context/AuthContext";
import { Plus, X, Building2, MapPin, Wrench } from "lucide-react";

export default function MechanicsPage() {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      let ownerCenters: any[] = [];

      if (user?.id) {
        try {
          const centerRes = await centersService.getAllCenters({ adminId: user.id });
          if (centerRes?.data?.length > 0) {
            ownerCenters = centerRes.data;
          }
        } catch (err) {
          console.error("Failed to query centers by adminId", err);
        }
      }

      if (ownerCenters.length === 0 && user?.managedCenter) {
        ownerCenters = [user.managedCenter];
      }

      setCenters(ownerCenters);

      const activeCenterId = selectedCenterId || (ownerCenters.length > 0 ? ownerCenters[0].id : null);
      if (activeCenterId) {
        setSelectedCenterId(activeCenterId);
        const centerRes = await centersService.getCenterById(activeCenterId);
        setMechanics(centerRes.data?.mechanics || []);
      }
    } catch (error) {
      console.error("Failed to load mechanics", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCenterChange = async (cId: string) => {
    setSelectedCenterId(cId);
    setLoading(true);
    try {
      const centerRes = await centersService.getCenterById(cId);
      setMechanics(centerRes.data?.mechanics || []);
    } catch (err) {
      console.error("Failed to switch center mechanics", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMechanic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenterId) {
      setModalError("Please select an automotive workshop center for this mechanic.");
      return;
    }
    setSubmitting(true);
    setModalError("");
    try {
      await centersService.addMechanic(selectedCenterId, formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      await loadData();
    } catch (error: any) {
      console.error("Failed to add mechanic", error);
      setModalError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add mechanic. Please check your inputs and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentCenter = centers.find(c => c.id === selectedCenterId) || (centers.length > 0 ? centers[0] : null);

  if (loading && centers.length === 0) {
    return <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">Loading mechanics...</div>;
  }

  return (
    <div className="p-6 relative space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-wider">Mechanics</h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Manage certified technicians and mechanics assigned to your workshops
          </p>
        </div>

        <div className="flex items-center gap-3">
          {centers.length > 1 && (
            <select
              value={selectedCenterId}
              onChange={(e) => handleCenterChange(e.target.value)}
              className="h-10 px-3 rounded-sm border border-input bg-card text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <Button 
            onClick={() => {
              setModalError("");
              setShowModal(true);
            }}
            className="bg-[#E60000] hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-sm h-10 px-4"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Mechanic
          </Button>
        </div>
      </div>

      {/* Center Banner */}
      {currentCenter && (
        <div className="bg-muted/30 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Active Workshop</span>
              <h2 className="text-sm font-bold text-foreground">{currentCenter.name}</h2>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary" /> {currentCenter.address || "Dhaka, Bangladesh"}
          </span>
        </div>
      )}

      {mechanics.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center space-y-3">
          <Wrench className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold uppercase text-foreground">No mechanics added yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto font-medium">
            Add your first mechanic to start assigning service requests and emergency calls at {currentCenter?.name || "your workshop"}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mechanics.map((mechanic) => (
            <div key={mechanic.id || mechanic._id} className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xl font-bold shrink-0">
                  {(mechanic.fullName || mechanic.name || 'M')[0].toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-sm text-foreground truncate">{mechanic.fullName || mechanic.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{mechanic.email}</p>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 shrink-0">
                  Active
                </span>
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 text-primary shrink-0" />
                  {currentCenter?.name || "Workshop Center"}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  On Duty
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Mechanic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 relative border animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-muted-foreground focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-black text-foreground uppercase tracking-wider mb-5">
              Add New Mechanic
            </h2>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded border border-red-100">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddMechanic} className="space-y-4">
              {/* Workshop Selection / Indicator */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Assigned Workshop / Center
                </Label>

                {centers.length > 1 ? (
                  <div className="space-y-1.5">
                    <select
                      value={selectedCenterId}
                      onChange={(e) => setSelectedCenterId(e.target.value)}
                      className="w-full h-10 px-3 rounded-sm border border-input bg-background text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {centers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.address}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : currentCenter ? (
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-start gap-3">
                    <div className="p-2 bg-amber-600 text-white rounded-md shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <p className="font-bold text-xs text-foreground truncate">{currentCenter.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        {currentCenter.address || "Dhaka, Bangladesh"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs font-medium">
                    No active center found. Please ensure you have created an Automotive Center.
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Full Name</Label>
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="rounded-sm h-10 text-xs font-medium"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Email</Label>
                <Input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="rounded-sm h-10 text-xs font-medium"
                  placeholder="mechanic@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Password</Label>
                <Input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="rounded-sm h-10 text-xs font-medium"
                  placeholder="Set initial password for mechanic"
                />
                <p className="text-[11px] text-muted-foreground font-medium pt-1">
                  An invitation email with this temporary password and an activation link will be delivered to the mechanic&apos;s email address.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#E60000] hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-sm h-11 mt-4"
                disabled={submitting}
              >
                {submitting ? 'Adding & Sending Email...' : 'Add Mechanic & Send Email'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
