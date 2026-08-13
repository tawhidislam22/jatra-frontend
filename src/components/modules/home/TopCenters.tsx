import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Wrench, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { centersService } from "@/services/centers.service";
import { AutomotiveCenter } from "@/types/jatra";

export function TopCenters() {
  const [centers, setCenters] = useState<AutomotiveCenter[]>([]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await centersService.getAllCenters();
        if (response && response.data) {
          setCenters(response.data.slice(0, 3));
        } else if (Array.isArray(response)) {
          setCenters(response.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch centers:", error);
      }
    };
    fetchCenters();
  }, []);

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
          {centers.map((center) => (
            <Card key={center.id} className="overflow-hidden group hover:shadow-lg transition-all border-border/50">
              <div className="relative h-48 overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={[
                    "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1635766299863-71a7d6562095?auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1599256621730-535171e2873c?auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1619864295897-408bbbc7b80a?auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1605515298946-d062f2e9da53?auto=format&fit=crop&q=80"
                  ][center.name.length % 5]} 
                  alt={center.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="backdrop-blur-md bg-background/70 font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    {center.rating}
                  </Badge>
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-none">{center.isApproved ? "Approved" : "Standard"}</Badge>
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
                  {center.servicesOffered?.slice(0, 3).map((service, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-muted/50 font-normal">
                      <Wrench className="h-3 w-3 mr-1" />
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex gap-3">
                <Link href={`/centers/${center.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">Details</Button>
                </Link>
                <Link href={`/centers/${center.id}`} className="flex-1">
                  <Button className="w-full">Book Service</Button>
                </Link>
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
