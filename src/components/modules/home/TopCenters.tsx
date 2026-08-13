import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Wrench, Clock } from "lucide-react";
import Link from "next/link";

const MOCK_CENTERS = [
  {
    id: "1",
    name: "Jatra Premier Service",
    address: "Road 11, Block E, Gulshan 1, Dhaka",
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&q=80",
    services: ["Engine Repair", "Oil Change", "Emergency Towing"],
    status: "Open Now"
  },
  {
    id: "2",
    name: "AutoCare Banani",
    address: "Kemal Ataturk Ave, Banani, Dhaka",
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1635766299863-71a7d6562095?auto=format&fit=crop&q=80",
    services: ["Wheel Alignment", "Wash", "Doorstep Service"],
    status: "Closing in 2h"
  },
  {
    id: "3",
    name: "Dhanmondi Motors",
    address: "Satmasjid Road, Dhanmondi, Dhaka",
    rating: 4.9,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1599256621730-535171e2873c?auto=format&fit=crop&q=80",
    services: ["Full Inspection", "Battery Replacement", "Emergency Towing"],
    status: "Open Now"
  }
];

export function TopCenters() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Top Service Centers</h2>
            <p className="text-muted-foreground">Trusted automotive centers for your vehicle's maintenance and repair.</p>
          </div>
          <Link href="/centers">
            <Button variant="outline" className="hidden sm:flex">View All</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_CENTERS.map((center) => (
            <Card key={center.id} className="overflow-hidden group hover:shadow-lg transition-all border-border/50">
              <div className="relative h-48 overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={center.image} 
                  alt={center.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="backdrop-blur-md bg-background/70 font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    {center.rating} ({center.reviews})
                  </Badge>
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-none">{center.status}</Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <h3 className="text-xl font-bold">{center.name}</h3>
                <p className="text-sm text-muted-foreground flex items-start mt-1">
                  <MapPin className="h-4 w-4 mr-1 shrink-0 mt-0.5" /> 
                  <span className="line-clamp-1">{center.address}</span>
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-2 mt-2">
                  {center.services.slice(0, 3).map((service, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-muted/50 font-normal">
                      <Wrench className="h-3 w-3 mr-1" />
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex gap-3">
                <Button variant="outline" className="flex-1">Details</Button>
                <Button className="flex-1">Book Service</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/centers">
            <Button variant="outline" className="w-full">View All Centers</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
