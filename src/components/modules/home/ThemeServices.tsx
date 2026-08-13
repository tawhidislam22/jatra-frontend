"use client";

import { CenterCard } from "@/components/modules/centers/CenterCard";
import { AutomotiveCenter } from "@/types/jatra";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { centersService } from "@/services/centers.service";

export function ThemeServices() {
  const router = useRouter();
  
  const [topCenters, setTopCenters] = useState<AutomotiveCenter[]>([]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await centersService.getAllCenters();
        if (response && response.data) {
          setTopCenters(response.data.slice(0, 3));
        } else if (Array.isArray(response)) {
          setTopCenters(response.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch centers:", error);
      }
    };
    fetchCenters();
  }, []);

  return (
    <section className="py-24 bg-[#f4f4f4] relative overflow-hidden">
      {/* Decorative text background */}
      <motion.div 
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-20 text-[180px] font-black text-[#1a1a1a] opacity-[0.03] select-none z-0 tracking-tighter uppercase whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 0.03, x: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        WORKSHOPS
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div>
            <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px] bg-primary"></span>
              Certified Workshops
            </h3>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">
              Top Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Centers</span>
            </h2>
          </div>
          <Link href="/centers">
            <Button variant="outline" className="h-12 px-6 border-2 border-[#1a1a1a] text-[#1a1a1a] font-bold uppercase tracking-[2px] text-xs hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 rounded-sm flex items-center gap-2">
              View All Workshops <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topCenters.map((center, index) => (
            <motion.div
              key={center.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <CenterCard 
                center={center} 
                onBook={(id) => router.push(`/centers/${id}`)} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
