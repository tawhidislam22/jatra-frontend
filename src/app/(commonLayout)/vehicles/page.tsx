"use client";

import { useEffect, useState } from "react";
import { VehicleCard } from "@/components/modules/vehicles/VehicleCard";
import { Vehicle } from "@/types/jatra";
import { motion } from "framer-motion";
import { vehiclesService } from "@/services/vehicles.service";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehiclesService.getAllVehicles();
        if (response && response.data) {
          setVehicles(response.data);
        } else {
          setVehicles(response); // Fallback if the response isn't wrapped in {data: ...}
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Zauto Style Header */}
      <div 
        className="py-24 mb-16 relative overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3166&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0" />
        {/* Decorative background text */}
        <motion.div 
          className="absolute top-1/2 left-0 -translate-y-1/2 text-[150px] font-black text-white/5 select-none z-0 tracking-tighter uppercase whitespace-nowrap"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          VEHICLES
        </motion.div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center gap-2">
              <span className="w-8 h-[2px] bg-primary"></span>
              Checkout our Fleet
            </h3>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase tracking-tight">
              Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Vehicles</span>
            </h1>
            <p className="text-gray-400 max-w-xl font-medium text-lg leading-relaxed mt-4">
              Find the perfect car for your next journey. Browse our premium fleet of vehicles available for rent.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div 
          className="mb-12 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="text-gray-500 font-bold uppercase tracking-widest text-sm">
            Showing {vehicles.length} Vehicles
          </div>
          {/* Placeholder for future filters */}
          <div className="flex gap-4">
            <select className="bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-3 font-bold text-xs uppercase tracking-widest outline-none rounded-sm">
              <option>Sort By Price</option>
              <option>Low to High</option>
              <option>High to Low</option>
            </select>
            <select className="bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-3 font-bold text-xs uppercase tracking-widest outline-none rounded-sm">
              <option>All Types</option>
              <option>Sedan</option>
              <option>Luxury</option>
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-gray-100 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {vehicles.map((v, index) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <VehicleCard vehicle={v} onRent={(id) => window.location.href = `/vehicles/${id}`} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
