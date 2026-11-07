"use client";

import { Check, Trophy, Shield, Users, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="bg-muted/40 min-h-screen">
      {/* Zauto Style Header */}
      <div 
        className="py-32 mb-20 relative overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3166&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 -translate-y-1/2 text-[180px] md:text-[250px] font-black text-white/5 select-none z-0 tracking-tighter uppercase whitespace-nowrap"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          COMPANY
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
              Our Story
            </h3>
            <h1 className="text-5xl md:text-8xl font-extrabold text-white uppercase tracking-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Us</span>
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div 
            className="relative group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* The main about image */}
            <div className="bg-[#1a1a1a] rounded-sm overflow-hidden shadow-2xl relative z-10 border-l-8 border-primary group-hover:border-[#1a1a1a] transition-colors duration-500 h-[600px]">
              <img 
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3166&auto=format&fit=crop" 
                alt="About Jatra" 
                className="w-full h-full object-cover object-center opacity-70 mix-blend-screen scale-110 group-hover:scale-100 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-80"></div>
            </div>
            
            {/* Floating Experience Badge */}
            <motion.div 
              className="absolute bottom-10 -right-10 bg-primary p-10 shadow-2xl z-20 hidden md:flex flex-col items-center justify-center transform rounded-sm"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -16 }}
            >
              <span className="text-7xl font-black text-white leading-none">15</span>
              <span className="text-white text-xs font-bold uppercase tracking-[4px] mt-3">Years of Excellence</span>
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
                Who We Are
              </h3>
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight uppercase tracking-tight">
                Redefining the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Driving Experience</span>
              </h2>
            </div>
            
            <p className="text-muted-foreground leading-loose font-medium text-[15px]">
              Jatra is the leading premium platform for vehicle rentals, professional maintenance, and on-demand emergency assistance. We integrate all your automotive needs into a single seamless experience designed for luxury, performance, and ultimate peace of mind.
            </p>
            <p className="text-muted-foreground leading-loose font-medium text-[15px]">
              Whether you are looking to rent a luxury sedan for the weekend or need immediate roadside assistance, our extensive network of certified partners and state-of-the-art digital infrastructure guarantees a frictionless experience.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 py-8 border-t border-b border-border">
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
                  <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center shrink-0 shadow-md">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                  </div>
                  <span className="font-bold text-foreground text-[13px] uppercase tracking-wide">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div 
          className="bg-[#1a1a1a] rounded-sm shadow-2xl p-16 relative overflow-hidden mb-32 border-b-4 border-primary"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10 text-center">
            {[
              { icon: Trophy, value: "50+", label: "Awards Won" },
              { icon: Shield, value: "15k", label: "Safe Journeys" },
              { icon: Users, value: "12k", label: "Happy Clients" },
              { icon: Clock, value: "24/7", label: "Customer Support" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
                viewport={{ once: true }}
              >
                <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-5xl font-black text-white mb-2 uppercase">{stat.value}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[3px]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
           <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center justify-center gap-2 mb-4">
              <span className="w-8 h-[2px] bg-primary"></span>
              The Minds Behind Jatra
            </h3>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground uppercase tracking-tight mb-6">
              Our Leadership <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a1a1a] to-gray-400">Team</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-sm leading-loose">
              Meet the brilliant minds from the Department of CSE, CUET, who engineered this platform to bridge the gap between technology and modern automotive services.
            </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Mufajjal Hosen Nayeem", id: "2204088", role: "Co-Founder & System Architect" },
            { name: "Tawhid Islam Ome", id: "2204076", role: "Co-Founder & Lead Engineer" },
            { name: "Srabon Islam", id: "2204096", role: "Co-Founder & Product Designer" }
          ].map((member, i) => (
            <motion.div 
              key={i} 
              className="bg-card border border-border rounded-sm overflow-hidden group hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="h-64 bg-muted/40 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/90 transition-colors duration-500 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-4">
                    <span className="w-10 h-10 bg-card text-primary flex items-center justify-center rounded-sm font-bold cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors">IN</span>
                    <span className="w-10 h-10 bg-card text-primary flex items-center justify-center rounded-sm font-bold cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors">FB</span>
                  </div>
                </div>
                {/* Placeholder avatar */}
                <Users className="w-24 h-24 text-gray-200 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-8 text-center border-t border-border">
                <h4 className="font-extrabold text-xl text-foreground uppercase tracking-wider mb-2">{member.name}</h4>
                <div className="text-primary font-bold text-[11px] uppercase tracking-[2px] mb-1">{member.role}</div>
                <div className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">ID: {member.id}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
