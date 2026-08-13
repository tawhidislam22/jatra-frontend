"use client";

import { CenterCard } from "@/components/modules/centers/CenterCard";
import { AutomotiveCenter } from "@/types/jatra";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeServices() {
  const router = useRouter();
  
  // Mock data for top workshops
  const topCenters: AutomotiveCenter[] = [
    { 
      id: "1", 
      name: "Jatra Premier Service", 
      address: "Road 11, Block E, Gulshan 1, Dhaka", 
      latitude: 23.7808, 
      longitude: 90.4196, 
      phone: "01744444444", 
      rating: 4.8, 
      isApproved: true, 
      servicesOffered: ["Engine Repair", "Oil Change", "Wheel Alignment"] 
    },
    { 
      id: "2", 
      name: "AutoCare Banani", 
      address: "Kemal Ataturk Ave, Banani, Dhaka", 
      latitude: 23.7940, 
      longitude: 90.4043, 
      phone: "01988888888", 
      rating: 4.6, 
      isApproved: true, 
      servicesOffered: ["Wash", "Battery Replacement"] 
    },
    { 
      id: "3", 
      name: "Dhanmondi Motors", 
      address: "Satmasjid Road, Dhanmondi, Dhaka", 
      latitude: 23.7461, 
      longitude: 90.3742, 
      phone: "01511111111", 
      rating: 4.9, 
      isApproved: false, 
      servicesOffered: ["Full Inspection", "Dent Paint", "Tire Rotation"] 
    },
  ];

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
