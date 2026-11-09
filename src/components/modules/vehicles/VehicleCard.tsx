import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/jatra";
import { Settings, Users, Fuel, Gauge, ArrowRight } from "lucide-react";
import Image from "next/image";
import { WishlistButton } from "@/components/ui/WishlistButton";

interface VehicleCardProps {
  vehicle: Vehicle;
  onRent?: (id: string) => void;
}

export function VehicleCard({ vehicle, onRent }: VehicleCardProps) {
  const isFleet = vehicle.type === 'RENTAL_FLEET';
  const defaultImage = "https://demo.xpeedstudio.com/carrental/onepage-v4/wp-content/uploads/sites/9/2020/07/image7.png"; // Zauto style demo image

  return (
    <div className="group bg-card border border-border rounded-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 relative flex flex-col h-full">
      {/* Badge */}
      <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm z-10">
        {isFleet ? 'Jatra Fleet' : 'Customer Car'}
      </div>

      {/* Wishlist Button */}
      <div className="absolute top-4 right-4 z-20">
        <WishlistButton vehicleId={vehicle.id} size="sm" />
      </div>
      
      <div className="bg-muted/40 p-8 aspect-video flex items-center justify-center relative overflow-hidden group-hover:bg-zinc-800 transition-colors duration-500">
        <img 
          src={vehicle.images?.[0] || defaultImage} 
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-auto object-contain group-hover:scale-110 group-hover:drop-shadow-[0_10px_20px_rgba(255,255,255,0.2)] transition-all duration-500"
        />
      </div>
      <div className="p-6 relative flex flex-col flex-1">
        {/* Price floating badge */}
        {isFleet && vehicle.pricePerDay && (
          <div className="absolute -top-6 right-6 bg-primary text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
            <span className="text-lg font-bold leading-none">${vehicle.pricePerDay}</span>
            <span className="text-[9px] uppercase font-bold">/Day</span>
          </div>
        )}

        <div className="mb-6 pt-2">
          <h4 className="font-extrabold text-2xl text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">{vehicle.make} {vehicle.model}</h4>
          <span className="text-xs text-muted-foreground font-bold tracking-widest uppercase">{vehicle.year} Model | {vehicle.licensePlate}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-4 border-t border-border mb-6 flex-1">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
            <Users className="w-4 h-4 text-primary" /> {vehicle.features?.includes('7-seater') ? '7' : '5'} Seats
          </div>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
            <Settings className="w-4 h-4 text-primary" /> {vehicle.features?.includes('Manual') ? 'Manual' : 'Auto'}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium line-clamp-1">
            <Fuel className="w-4 h-4 text-primary" /> {vehicle.features?.includes('Electric') ? 'Electric' : vehicle.features?.includes('Hybrid') ? 'Hybrid' : 'Petrol'}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
            <Gauge className="w-4 h-4 text-primary" /> 20K MPG
          </div>
        </div>
        
        {isFleet ? (
          <Button 
            className="w-full h-12 mt-auto bg-transparent border-2 border-border text-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-white rounded-sm font-bold uppercase tracking-widest text-[11px] transition-all duration-300 flex items-center justify-between px-6"
            onClick={() => onRent && onRent(vehicle.id)}
            disabled={vehicle.isAvailable === false}
          >
            {vehicle.isAvailable === false ? 'Currently Rented' : 'Rent This Car'} <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="w-full h-12 mt-auto bg-transparent border-2 border-border text-muted-foreground rounded-sm font-bold uppercase tracking-widest text-[11px] flex items-center justify-between px-6" disabled>
            Not for Rent
          </Button>
        )}
      </div>
    </div>
  );
}
