"use client";

import { useEffect, useState } from "react";
import { CenterCard } from "@/components/modules/centers/CenterCard";
import { AutomotiveCenter } from "@/types/jatra";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { centersService } from "@/services/centers.service";

export default function CentersPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<AutomotiveCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await centersService.getAllCenters();
        if (response && response.data) {
          setCenters(response.data);
        } else {
          setCenters(response);
        }
      } catch (error) {
        console.error("Failed to fetch centers:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCenters();
  }, []);

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-32">
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
          WORKSHOPS
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
              Professional Maintenance
            </h3>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase tracking-tight">
              Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Centers</span>
            </h1>
            <p className="text-gray-400 max-w-xl font-medium text-lg leading-relaxed mt-4">
              Find top-rated workshops and certified mechanics near you. We partner with the best to keep your vehicle running smoothly.
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
          <div className="text-[#1a1a1a] font-bold uppercase tracking-widest text-sm">
            Found {centers.length} Centers
          </div>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="SEARCH LOCATION..." 
              className="bg-white border border-gray-200 text-[#1a1a1a] p-3 w-64 font-bold text-xs uppercase tracking-widest outline-none rounded-sm focus:border-primary transition-colors"
            />
            <select className="bg-white border border-gray-200 text-[#1a1a1a] p-3 font-bold text-xs uppercase tracking-widest outline-none rounded-sm">
              <option>Highest Rated</option>
              <option>Nearest</option>
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {centers.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <CenterCard 
                  center={c} 
                  onBook={(id) => router.push(`/centers/${id}`)} 
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
