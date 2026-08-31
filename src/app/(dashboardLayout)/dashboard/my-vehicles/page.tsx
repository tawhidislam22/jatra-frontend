"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { vehiclesService } from "@/services/vehicles.service";
import { CarFront, X } from "lucide-react";
import Link from "next/link";

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [error, setError] = useState("");

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

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      await vehiclesService.registerVehicle({
        make,
        model,
        year: parseInt(year),
        licensePlate,
        type: "CUSTOMER_OWNED"
      });
      setShowAddModal(false);
      setMake("");
      setModel("");
      setYear("");
      setLicensePlate("");
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to add vehicle");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Vehicles</h1>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-[#1a1a1a] text-white">Add Vehicle</Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-card border rounded-xl p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarFront className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Vehicles Found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't added any vehicles to your account yet. Add a vehicle to easily book service requests.</p>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-[#1a1a1a] text-white">Add Your First Vehicle</Button>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-semibold">Make/Model</th>
                <th className="p-4 font-semibold">Year</th>
                <th className="p-4 font-semibold">License Plate</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-bold text-primary">{v.make} {v.model}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1a1a1a] mb-6">Add New Vehicle</h2>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-500 mb-2">Make</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-200 text-[#1a1a1a] p-3 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary rounded-sm"
                      placeholder="e.g. Toyota"
                      required
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-500 mb-2">Model</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-200 text-[#1a1a1a] p-3 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary rounded-sm"
                      placeholder="e.g. Camry"
                      required
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-500 mb-2">Year</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border border-gray-200 text-[#1a1a1a] p-3 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary rounded-sm"
                    placeholder="e.g. 2022"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-500 mb-2">License Plate</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 text-[#1a1a1a] p-3 font-semibold outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary rounded-sm uppercase"
                    placeholder="e.g. ABC-1234"
                    required
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  />
                </div>
                
                {error && <div className="text-red-500 text-sm font-bold mt-2">{error}</div>}
                
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="font-bold">Cancel</Button>
                  <Button type="submit" disabled={adding} className="bg-primary hover:bg-[#1a1a1a] text-white font-bold tracking-wide">
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
