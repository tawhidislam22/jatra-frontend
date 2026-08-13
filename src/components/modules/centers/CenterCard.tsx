import { Button } from "@/components/ui/button";
import { AutomotiveCenter } from "@/types/jatra";
import { MapPin, Star, Phone, CheckCircle2, Wrench, ArrowRight } from "lucide-react";
import Image from "next/image";

interface CenterCardProps {
  center: AutomotiveCenter;
  onBook?: (id: string) => void;
}

export function CenterCard({ center, onBook }: CenterCardProps) {
  // Use image from database, with fallback
  const defaultImage = (center.images && center.images.length > 0) ? center.images[0] : "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&q=80";
  return (
    <div className="group bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 relative flex flex-col h-full">
      {/* Verified Badge */}
      {center.isApproved && (
        <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm z-10 flex items-center gap-1 shadow-sm">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </div>
      )}
      
      <div className="bg-[#f9f9f9] relative h-56 overflow-hidden group-hover:bg-[#1a1a1a] transition-colors duration-500">
        <img 
          src={defaultImage} 
          alt={center.name} 
          className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-60 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-6 relative flex flex-col flex-1">
        {/* Rating floating badge */}
        <div className="absolute -top-6 right-6 bg-primary text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
          <span className="text-lg font-bold leading-none flex items-center"><Star className="w-4 h-4 fill-white mr-0.5" />{center.rating?.toFixed(1) || "New"}</span>
        </div>

        <div className="mb-6 pt-2">
          <h4 className="font-extrabold text-2xl text-[#1a1a1a] mb-1 group-hover:text-primary transition-colors line-clamp-1">{center.name}</h4>
          <span className="text-xs text-gray-500 font-bold tracking-widest uppercase flex items-start mt-2">
            <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" /> <span className="line-clamp-2 leading-tight">{center.address}</span>
          </span>
          {center.phone && (
            <span className="text-xs text-gray-500 font-bold tracking-widest uppercase flex items-center mt-2">
              <Phone className="w-3.5 h-3.5 mr-1 text-primary shrink-0" /> {center.phone}
            </span>
          )}
        </div>
        
        <div className="flex-1 mb-6">
          <h5 className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mb-3 flex items-center gap-2">
            <Wrench className="w-3 h-3 text-primary" /> Services Offered
          </h5>
          {center.servicesOffered && center.servicesOffered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {center.servicesOffered.slice(0, 4).map((service, i) => (
                <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-sm font-bold uppercase tracking-wider">
                  {service}
                </span>
              ))}
              {center.servicesOffered.length > 4 && (
                <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-sm font-bold uppercase tracking-wider">
                  +{center.servicesOffered.length - 4} more
                </span>
              )}
            </div>
          ) : (
             <span className="text-sm text-gray-400 italic">No services listed</span>
          )}
        </div>
        
        <Button 
          className="w-full h-12 mt-auto bg-transparent border-2 border-gray-200 text-[#1a1a1a] group-hover:border-primary group-hover:bg-primary group-hover:text-white rounded-sm font-bold uppercase tracking-widest text-[11px] transition-all duration-300 flex items-center justify-between px-6"
          onClick={() => onBook && onBook(center.id)}
        >
          Book Service <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
