"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function ThemeAbout() {
  return (
    <section id="about" className="py-24 bg-[#f4f4f4] relative overflow-hidden">
      {/* Decorative text background */}
      <motion.div 
        className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-20 text-[200px] font-black text-white opacity-40 select-none z-0 tracking-tighter uppercase whitespace-nowrap"
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 0.4, x: -20 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        Jatra
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            className="relative group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* The main about image */}
            <div className="bg-[#1a1a1a] rounded-sm overflow-hidden shadow-2xl relative z-10 border-l-8 border-primary group-hover:border-[#1a1a1a] transition-colors duration-500">
              <img 
                src="https://demo.xpeedstudio.com/carrental/onepage-v4/wp-content/uploads/sites/9/2020/06/banner_image.png" 
                alt="About Jatra" 
                className="w-full h-full object-cover object-top opacity-60 mix-blend-screen scale-110 group-hover:scale-100 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-80"></div>
            </div>
            
            {/* Floating Experience Badge */}
            <motion.div 
              className="absolute -bottom-10 -right-10 bg-primary p-8 shadow-2xl z-20 hidden md:flex flex-col items-center justify-center transform rounded-sm"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -16 }}
            >
              <span className="text-6xl font-black text-white leading-none">15</span>
              <span className="text-white text-xs font-bold uppercase tracking-[3px] mt-2">Years Exp.</span>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center gap-2">
                <span className="w-8 h-[2px] bg-primary"></span>
                About Our Company
              </h3>
              <h2 className="text-4xl md:text-6xl font-extrabold text-[#1a1a1a] leading-tight uppercase tracking-tight">
                Start your engine <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">and explore</span>
              </h2>
            </div>
            
            <p className="text-gray-500 leading-loose font-medium text-[15px]">
              Jatra is your premium platform for vehicle rentals, professional maintenance, and on-demand emergency assistance. We integrate all automotive needs into a single seamless experience designed for luxury and performance.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 py-6 border-t border-b border-gray-200">
              {[
                "24/7 Roadside Assistance",
                "Wide Range of Vehicles",
                "Certified Mechanics",
                "Affordable Pricing",
                "Flexible Booking Options",
                "Verified Service Centers"
              ].map((feature, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + (i * 0.1) }}
                  viewport={{ once: true }}
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                  </div>
                  <span className="font-bold text-[#1a1a1a] text-[13px] uppercase tracking-wide">{feature}</span>
                </motion.div>
              ))}
            </div>
            
            <Link href="/about">
              <Button className="h-14 px-10 bg-[#1a1a1a] hover:bg-primary text-white rounded-sm font-bold uppercase tracking-[2px] transition-colors duration-300 flex items-center gap-3 text-xs">
                Learn More About Us <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
