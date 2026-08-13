"use client";

import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-32">
      {/* Zauto Style Header */}
      <div 
        className="py-24 mb-16 relative overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3166&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 -translate-y-1/2 text-[150px] font-black text-white/5 select-none z-0 tracking-tighter uppercase whitespace-nowrap"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          SUPPORT
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
              Get In Touch
            </h3>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase tracking-tight">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Us</span>
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div 
            className="lg:col-span-1 space-y-12"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-3xl font-extrabold text-[#1a1a1a] uppercase tracking-tight mb-6">
                Contact Info
              </h2>
              <p className="text-gray-500 font-medium leading-loose text-sm mb-8">
                Have a question or need assistance? Our support team is ready to help you with your vehicle rental and service needs.
              </p>
              
              <ul className="space-y-8">
                <li className="flex items-start gap-4 group">
                  <div className="w-14 h-14 bg-white border border-gray-200 group-hover:border-primary group-hover:bg-primary transition-colors flex items-center justify-center shrink-0 rounded-sm shadow-sm">
                    <MapPin className="text-primary group-hover:text-white transition-colors h-6 w-6" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-[#1a1a1a] uppercase tracking-wider text-sm mb-1">Our Location</h4>
                    <span className="text-gray-500 font-medium text-sm leading-relaxed">Department of CSE, CUET<br/>Chattogram-4349, Bangladesh</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="w-14 h-14 bg-white border border-gray-200 group-hover:border-primary group-hover:bg-primary transition-colors flex items-center justify-center shrink-0 rounded-sm shadow-sm">
                    <Phone className="text-primary group-hover:text-white transition-colors h-6 w-6" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-[#1a1a1a] uppercase tracking-wider text-sm mb-1">Call Us</h4>
                    <span className="text-gray-500 font-medium text-sm">+880 123 456 7890</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="w-14 h-14 bg-white border border-gray-200 group-hover:border-primary group-hover:bg-primary transition-colors flex items-center justify-center shrink-0 rounded-sm shadow-sm">
                    <Mail className="text-primary group-hover:text-white transition-colors h-6 w-6" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-[#1a1a1a] uppercase tracking-wider text-sm mb-1">Email Us</h4>
                    <span className="text-gray-500 font-medium text-sm">support@jatra.com</span>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-sm shadow-xl p-8 md:p-12 border-t-4 border-primary">
              <h3 className="text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-tight mb-8">
                Send a Message
              </h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">
                      Your Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                      placeholder="JOHN DOE"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                      placeholder="JOHN@EXAMPLE.COM"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">
                    Subject
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm focus:border-primary transition-colors rounded-sm"
                    placeholder="HOW CAN WE HELP?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">
                    Message
                  </label>
                  <textarea 
                    className="w-full bg-[#f9f9f9] border border-gray-200 text-[#1a1a1a] p-4 font-semibold outline-none text-sm min-h-[150px] resize-none focus:border-primary transition-colors rounded-sm"
                    placeholder="WRITE YOUR MESSAGE HERE..."
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-14 px-10 bg-primary hover:bg-[#1a1a1a] text-white rounded-sm font-bold uppercase tracking-[2px] transition-colors duration-300 flex items-center gap-3 text-[13px] mt-4"
                >
                  Send Message <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
