"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function ThemeHero() {
  return (
    <div className="relative mb-16">
      <section id="home" className="relative bg-[#111111] pt-24 pb-32 overflow-hidden border-b-4 border-primary">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1a1a1a] transform skew-x-12 translate-x-32 z-0"></div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-primary/10 border-l-4 border-primary px-4 py-2">
                <h3 className="text-sm font-bold uppercase tracking-[3px] text-primary">
                  Premium Car Rental
                </h3>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] uppercase tracking-tight">
                Enjoy Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                  Ride
                </span> With Us
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
                Find the perfect car for your next adventure. We offer a wide range of premium vehicles at affordable prices with 24/7 support.
              </p>
              <div className="flex flex-wrap gap-6 pt-4">
                <Link href="/vehicles">
                  <Button className="h-14 px-8 bg-primary hover:bg-card text-white hover:text-black rounded-sm font-bold uppercase tracking-[2px] transition-all duration-300 flex items-center gap-3">
                    Book A Car <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative hidden lg:block z-20"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* The main car image placeholder */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px]">
                 {/* Using a placeholder gradient or dummy image if no asset is provided */}
                 <img 
                   src="https://demo.xpeedstudio.com/carrental/onepage-v4/wp-content/uploads/sites/9/2020/06/banner_car.png" 
                   alt="Featured Car" 
                   className="w-full h-auto object-contain scale-110 translate-x-8 drop-shadow-[0_20px_50px_rgba(230,0,0,0.15)] filter saturate-150" 
                 />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Widget (Overlapping bottom) */}
      <motion.div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full px-4 z-30"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <div className="bg-[#1a1a1a] shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-6 md:p-8 max-w-6xl mx-auto border-t-4 border-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
              {/* Pick Up Location */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" /> Pick-Up Location
                </label>
                <select className="w-full bg-[#111] border border-[#333] text-white p-4 font-semibold outline-none text-sm appearance-none cursor-pointer focus:border-primary transition-colors rounded-sm">
                  <option>Choose Location</option>
                  <option>New York City</option>
                  <option>Los Angeles</option>
                  <option>Chicago</option>
                </select>
              </div>
              
              {/* Drop Off Location */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" /> Drop-Off Location
                </label>
                <select className="w-full bg-[#111] border border-[#333] text-white p-4 font-semibold outline-none text-sm appearance-none cursor-pointer focus:border-primary transition-colors rounded-sm">
                  <option>Choose Location</option>
                  <option>New York City</option>
                  <option>Los Angeles</option>
                  <option>Chicago</option>
                </select>
              </div>
              
              {/* Pick Up Date */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-primary" /> Pick-Up Date
                </label>
                <Input type="date" className="bg-[#111] border border-[#333] p-4 h-[54px] rounded-sm text-white font-semibold shadow-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors" />
              </div>
              
              {/* Drop Off Date */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-primary" /> Drop-Off Date
                </label>
                <Input type="date" className="bg-[#111] border border-[#333] p-4 h-[54px] rounded-sm text-white font-semibold shadow-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors" />
              </div>
              
              {/* Search Button */}
              <div>
                <Link href="/vehicles">
                  <Button className="w-full h-[54px] bg-primary text-white hover:bg-card hover:text-black rounded-sm font-extrabold uppercase tracking-[2px] text-[13px] transition-colors duration-300">
                    Find Car
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
