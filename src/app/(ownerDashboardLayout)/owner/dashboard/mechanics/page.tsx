"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { centersService } from "@/services/centers.service";
import { Plus, X } from "lucide-react";

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const meRes = await authService.getMe();
      if (meRes.data?.managedCenter) {
        setCenterId(meRes.data.managedCenter);
        const centerRes = await centersService.getCenterById(meRes.data.managedCenter);
        setMechanics(centerRes.data?.mechanics || []);
      }
    } catch (error) {
      console.error("Failed to load mechanics", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMechanic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerId) return;
    setSubmitting(true);
    try {
      await centersService.addMechanic(centerId, formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      loadData();
    } catch (error) {
      console.error("Failed to add mechanic", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading mechanics...</div>;
  }

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1a1a1a] uppercase tracking-wider">Mechanics</h1>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-[#E60000] hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Mechanic
        </Button>
      </div>

      {mechanics.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
            No mechanics added yet. Add your first mechanic to start assigning service requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mechanics.map((mechanic) => (
            <div key={mechanic._id} className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                {(mechanic.name || mechanic.fullName || 'M')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1a1a1a]">{mechanic.name || mechanic.fullName}</h3>
                <p className="text-sm text-gray-500">{mechanic.email}</p>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                Active
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-[#1a1a1a] uppercase tracking-wider mb-6">Add New Mechanic</h2>
            
            <form onSubmit={handleAddMechanic} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">Full Name</Label>
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="rounded-sm"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">Email</Label>
                <Input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="rounded-sm"
                  placeholder="mechanic@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">Password</Label>
                <Input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="rounded-sm"
                  placeholder="••••••••"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#E60000] hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-sm mt-6"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Mechanic'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
