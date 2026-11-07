"use client";

import { useState, useEffect } from "react";
import { 
  Car, 
  Search, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Tag,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vehiclesService } from "@/services/vehicles.service";

export default function AdminFleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehiclesService.getAllVehicles();
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setVehicles(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter((v) => {
    const matchesType = typeFilter === "ALL" || v.type === typeFilter;
    const matchesSearch = 
      (v.make || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.licensePlate || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.center?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Vehicle Fleet Catalog
            </h1>
            <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {vehicles.length} Vehicles
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-medium mt-1">
            Global catalog of rental fleet vehicles and registered customer vehicles on the platform.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search make, model, plate..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-10 focus:border-red-500"
            />
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === "ALL" ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({vehicles.length})
            </button>
            <button
              onClick={() => setTypeFilter("RENTAL_FLEET")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === "RENTAL_FLEET" ? "bg-purple-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              Rental Fleet
            </button>
            <button
              onClick={() => setTypeFilter("CUSTOMER_OWNED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === "CUSTOMER_OWNED" ? "bg-blue-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              Customer Owned
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Loading Vehicle Fleet...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-16 text-center shadow-xl">
          <Car className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Vehicles Found</h3>
          <p className="text-zinc-500 text-xs mt-1">No vehicles matched the selected category or search filter.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Vehicle Details</th>
                  <th className="p-4">Category / Type</th>
                  <th className="p-4">License Plate</th>
                  <th className="p-4">Assigned Center / Owner</th>
                  <th className="p-4">Rate / Day</th>
                  <th className="p-4 text-right">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filtered.map((v) => {
                  const carImg = v.images && v.images.length > 0 ? v.images[0] : null;

                  return (
                    <tr key={v.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Vehicle Make & Model */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {carImg ? (
                            <img 
                              src={carImg} 
                              alt={`${v.make} ${v.model}`} 
                              className="w-12 h-10 object-cover rounded-lg border border-zinc-800 shrink-0 bg-zinc-900" 
                            />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                              <Car className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{v.make} {v.model}</p>
                            <p className="text-[11px] text-zinc-400">Year: {v.year}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="p-4">
                        {v.type === "RENTAL_FLEET" ? (
                          <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Rental Fleet
                          </span>
                        ) : (
                          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Customer Owned
                          </span>
                        )}
                      </td>

                      {/* Plate */}
                      <td className="p-4 font-mono font-bold text-zinc-300">
                        {v.licensePlate}
                      </td>

                      {/* Center / Owner */}
                      <td className="p-4">
                        <p className="text-zinc-200 font-semibold flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                          {v.center?.name || v.owner?.fullName || v.owner?.name || "Global / Private"}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold text-emerald-400">
                        {v.pricePerDay ? `$${v.pricePerDay} / day` : "N/A"}
                      </td>

                      {/* Availability */}
                      <td className="p-4 text-right">
                        {v.isAvailable !== false ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Available
                          </span>
                        ) : (
                          <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            Rented / In Use
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
