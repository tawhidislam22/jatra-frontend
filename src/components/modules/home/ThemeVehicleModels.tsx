"use client";

import { Button } from "@/components/ui/button";
import { Settings, Users, Fuel, Gauge, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { vehiclesService } from "@/services/vehicles.service";

export function ThemeVehicleModels() {
  const router = useRouter();
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehiclesService.getAllVehicles();
        if (response && response.data) {
          setVehicles(response.data.slice(0, 4));
        } else if (Array.isArray(response)) {
          setVehicles(response.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <section id="vehicle_models" className="pt-48 pb-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="space-y-4">
            <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center gap-2">
              <span className="w-8 h-[2px] bg-primary"></span>
              Checkout our Fleet
            </h3>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground uppercase tracking-tight">
              Vehicle <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a1a1a] to-gray-400">Models</span>
            </h2>
          </div>
          <Button 
            variant="outline" 
            className="h-12 px-8 border-2 border-[#1a1a1a] text-foreground hover:bg-primary hover:border-primary hover:text-white rounded-sm font-bold uppercase tracking-widest transition-all duration-300"
            onClick={() => router.push('/vehicles')}
          >
            View All Cars
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {vehicles.map((car: any, index: number) => (
            <motion.div 
              key={car.id} 
              className="group bg-card border border-border rounded-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 relative"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Badge */}
              <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm z-10">
                {car.type}
              </div>
              
              <div className="bg-muted/40 p-8 aspect-video flex items-center justify-center relative overflow-hidden group-hover:bg-zinc-800 transition-colors duration-500">
                <img 
                  src={car.images && car.images.length > 0 ? car.images[0] : ""} 
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-auto object-contain group-hover:scale-110 group-hover:drop-shadow-[0_10px_20px_rgba(255,255,255,0.2)] transition-all duration-500"
                />
              </div>
              <div className="p-6 relative">
                {/* Price floating badge */}
                <div className="absolute -top-6 right-6 bg-primary text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                  <span className="text-lg font-bold leading-none">${car.pricePerDay}</span>
                  <span className="text-[9px] uppercase font-bold">/Day</span>
                </div>

                <div className="mb-6 pt-2">
                  <h4 className="font-extrabold text-2xl text-foreground mb-1 group-hover:text-primary transition-colors">{car.make} {car.model}</h4>
                  <span className="text-xs text-muted-foreground font-bold tracking-widest uppercase">{car.year} Model</span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-4 border-t border-border mb-6">
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
                    <Users className="w-4 h-4 text-primary" /> {car.features?.find((f: string) => f.includes('Seat')) || '5'} Seats
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
                    <Settings className="w-4 h-4 text-primary" /> {car.features?.includes('Automatic') ? 'Auto' : 'Manual'}
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
                    <Fuel className="w-4 h-4 text-primary" /> {car.features?.includes('Petrol') ? 'Petrol' : car.features?.includes('Diesel') ? 'Diesel' : 'Petrol'}
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
                    <Gauge className="w-4 h-4 text-primary" /> 20K MPG
                  </div>
                </div>
                
                <Button 
                  className="w-full h-12 bg-transparent border-2 border-border text-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-white rounded-sm font-bold uppercase tracking-widest text-[11px] transition-all duration-300 flex items-center justify-between px-6"
                  onClick={() => router.push(`/vehicles/${car.id}`)}
                >
                  Rent This Car <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
