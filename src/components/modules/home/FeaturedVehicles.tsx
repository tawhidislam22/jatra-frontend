import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Settings, Fuel } from "lucide-react";
import Link from "next/link";

const MOCK_VEHICLES = [
  {
    id: "1",
    make: "Toyota",
    model: "Corolla Cross",
    year: 2023,
    type: "SUV",
    price: 5000,
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80",
    features: ["5 Seats", "Automatic", "Petrol"],
    location: "Gulshan, Dhaka"
  },
  {
    id: "2",
    make: "Honda",
    model: "Civic",
    year: 2022,
    type: "Sedan",
    price: 4500,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80",
    features: ["5 Seats", "Automatic", "Hybrid"],
    location: "Banani, Dhaka"
  },
  {
    id: "3",
    make: "Hyundai",
    model: "Tucson",
    year: 2024,
    type: "SUV",
    price: 6000,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80",
    features: ["5 Seats", "Automatic", "Diesel"],
    location: "Dhanmondi, Dhaka"
  }
];

export function FeaturedVehicles() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Rentals</h2>
            <p className="text-muted-foreground">Discover our most popular vehicles available for rent today.</p>
          </div>
          <Link href="/vehicles">
            <Button variant="outline" className="hidden sm:flex">View All</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_VEHICLES.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden group hover:shadow-lg transition-all border-border/50">
              <div className="relative h-48 overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={vehicle.image} 
                  alt={`${vehicle.make} ${vehicle.model}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="backdrop-blur-md bg-background/70">{vehicle.type}</Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" /> {vehicle.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">৳{vehicle.price}</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{vehicle.features[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span>{vehicle.features[1]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="h-4 w-4" />
                    <span>{vehicle.features[2]}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button className="w-full">Book Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/vehicles">
            <Button variant="outline" className="w-full">View All Vehicles</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
