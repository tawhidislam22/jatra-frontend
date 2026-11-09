import Link from "next/link";
import { CarFront, MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-24" id="contact">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="text-primary">
                <CarFront className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-3xl tracking-tighter text-white leading-none uppercase">
                  Jatra
                </span>
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                  Car Rental
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground leading-loose text-[15px]">
              We provide premium vehicle rentals and trusted workshop services. From polished cars to reliable mechanics, mobility is made simple.
            </p>
            <div className="flex space-x-3">
              {/* Social placeholders */}
              <div className="h-12 w-12 bg-[#1a1a1a] flex items-center justify-center hover:bg-primary text-white transition-colors cursor-pointer rounded-sm">
                <span className="font-bold text-sm uppercase">fb</span>
              </div>
              <div className="h-12 w-12 bg-[#1a1a1a] flex items-center justify-center hover:bg-primary text-white transition-colors cursor-pointer rounded-sm">
                <span className="font-bold text-sm uppercase">tw</span>
              </div>
              <div className="h-12 w-12 bg-[#1a1a1a] flex items-center justify-center hover:bg-primary text-white transition-colors cursor-pointer rounded-sm">
                <span className="font-bold text-sm uppercase">ig</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-extrabold text-xl mb-8 text-white uppercase tracking-wider relative inline-block after:content-[''] after:absolute after:-bottom-3 after:left-0 after:w-12 after:h-1 after:bg-primary">Quick Links</h3>
            <ul className="space-y-4 text-[15px] text-muted-foreground font-medium">
              <li><Link href="/" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-2 transition-transform" /> Home</Link></li>
              <li><Link href="/vehicles" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-2 transition-transform" /> Vehicles</Link></li>
              <li><Link href="/centers" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-2 transition-transform" /> Workshops</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-2 transition-transform" /> About Us</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-2 transition-transform" /> Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-extrabold text-xl mb-8 text-white uppercase tracking-wider relative inline-block after:content-[''] after:absolute after:-bottom-3 after:left-0 after:w-12 after:h-1 after:bg-primary">Contact Info</h3>
            <ul className="space-y-6 text-[15px] text-muted-foreground">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center shrink-0 rounded-sm">
                  <MapPin className="text-primary h-5 w-5" />
                </div>
                <span className="pt-2">Department of CSE, CUET<br/>Chattogram-4349, Bangladesh</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center shrink-0 rounded-sm">
                  <Phone className="text-primary h-5 w-5" />
                </div>
                <span>+880 123 456 7890</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center shrink-0 rounded-sm">
                  <Mail className="text-primary h-5 w-5" />
                </div>
                <span>support@jatra.com</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-extrabold text-xl mb-8 text-white uppercase tracking-wider relative inline-block after:content-[''] after:absolute after:-bottom-3 after:left-0 after:w-12 after:h-1 after:bg-primary">Newsletter</h3>
            <p className="text-muted-foreground text-[15px] mb-6 leading-loose">Subscribe to our newsletter for latest updates and offers.</p>
            <form className="space-y-4">
              <Input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-[#1a1a1a] border-none text-white placeholder:text-muted-foreground h-14 focus-visible:ring-1 focus-visible:ring-primary rounded-sm uppercase tracking-wider text-xs font-bold px-6" 
              />
              <Button className="w-full h-14 bg-primary text-white hover:bg-card hover:text-black rounded-sm font-bold uppercase tracking-[2px] transition-colors duration-300">
                Subscribe Now
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-[#0a0a0a] py-8 text-center text-[13px] font-medium text-muted-foreground uppercase tracking-widest">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} <span className="text-primary font-bold">Jatra</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
