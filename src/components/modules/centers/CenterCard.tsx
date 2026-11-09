import { Button } from "@/components/ui/button";
import { AutomotiveCenter } from "@/types/jatra";
import { MapPin, Star, Phone, CheckCircle2, Wrench, ArrowRight, Clock, Users } from "lucide-react";
import { WishlistButton } from "@/components/ui/WishlistButton";

interface CenterCardProps {
  center: AutomotiveCenter;
  onBook?: (id: string) => void;
}

export function CenterCard({ center, onBook }: CenterCardProps) {
  const defaultImage = (center.images && center.images.length > 0) 
    ? center.images[0] 
    : "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&q=80";

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 relative flex flex-col h-full">
      {/* Top Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
        {center.isApproved && (
          <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Certified Center
          </div>
        )}

        {/* Free Slot Availability Badge */}
        {center.freeSlotsCount && center.freeSlotsCount > 0 ? (
          <div className="bg-black/85 backdrop-blur-md text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-emerald-400 shrink-0" />
            <span>{center.freeSlotsCount} Free Slots Open</span>
            {center.nextFreeSlot && (
              <span className="text-white/80 font-normal">({center.nextFreeSlot})</span>
            )}
          </div>
        ) : null}
      </div>

      {/* Top Right Wishlist Button */}
      <div className="absolute top-4 right-4 z-20">
        <WishlistButton centerId={center.id} size="sm" />
      </div>
      
      {/* Cover Image */}
      <div className="bg-muted/40 relative h-56 overflow-hidden group-hover:bg-zinc-800 transition-colors duration-500">
        <img 
          src={defaultImage} 
          alt={center.name} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-75 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
      </div>

      <div className="p-6 relative flex flex-col flex-1">
        {/* Rating Floating Circle */}
        <div className="absolute -top-7 right-6 bg-primary text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300 border-2 border-background">
          <span className="text-base font-black leading-none flex items-center">
            <Star className="w-3.5 h-3.5 fill-white mr-0.5" />
            {center.rating?.toFixed(1) || "5.0"}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-tighter opacity-80 mt-0.5">Rating</span>
        </div>

        {/* Center Details */}
        <div className="mb-5 pt-1">
          <h4 className="font-black text-xl text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">
            {center.name}
          </h4>
          <span className="text-xs text-muted-foreground font-semibold flex items-start mt-2">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary shrink-0 mt-0.5" /> 
            <span className="line-clamp-2 leading-snug">{center.address}</span>
          </span>
          {center.phone && (
            <span className="text-xs text-muted-foreground font-semibold flex items-center mt-1.5">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-primary shrink-0" /> {center.phone}
            </span>
          )}
        </div>

        {/* Mechanic Capacity & Live Slot Strip */}
        <div className="p-3 rounded-lg bg-muted/40 border mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3 text-primary" /> Active Mechanics
            </span>
            <span className="font-extrabold text-foreground">
              {center.totalMechanicsCount || center.mechanics?.length || 1} on duty
            </span>
          </div>

          {center.freeSlotsCount && center.freeSlotsCount > 0 ? (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Next Available Slot
              </span>
              <span className="font-black text-foreground font-mono">
                {center.nextFreeSlot || "Immediate"}
              </span>
            </div>
          ) : null}
        </div>
        
        {/* Services Badges */}
        <div className="flex-1 mb-5">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <Wrench className="w-3 h-3 text-primary" /> Supported Services
          </h5>
          {center.customServices && center.customServices.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {center.customServices.slice(0, 4).map((s, i) => (
                <span key={i} className="text-[10px] bg-muted text-foreground px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 border border-border/50">
                  <span>{s.name}</span>
                  <span className="text-amber-500 font-black">${s.price}</span>
                </span>
              ))}
              {center.customServices.length > 4 && (
                <span className="text-[10px] bg-muted/70 text-muted-foreground px-2 py-0.5 rounded font-bold uppercase">
                  +{center.customServices.length - 4} more
                </span>
              )}
            </div>
          ) : center.servicesOffered && center.servicesOffered.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {center.servicesOffered.slice(0, 4).map((service, i) => (
                <span key={i} className="text-[10px] bg-muted text-foreground px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-border/50">
                  {service}
                </span>
              ))}
              {center.servicesOffered.length > 4 && (
                <span className="text-[10px] bg-muted/70 text-muted-foreground px-2 py-0.5 rounded font-bold uppercase">
                  +{center.servicesOffered.length - 4} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Workshop Diagnostics & Repair</span>
          )}
        </div>
        
        {/* CTA Button */}
        <Button 
          className="w-full h-11 mt-auto bg-primary text-white hover:bg-zinc-800 rounded-lg font-black uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-between px-5 shadow-sm"
          onClick={() => onBook && onBook(center.id)}
        >
          <span>Book Available Slot</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
