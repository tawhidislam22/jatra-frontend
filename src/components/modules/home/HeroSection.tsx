import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Car, Settings, ShieldAlert } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50 animate-pulse" />
      <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl opacity-50 animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          The Smart Way to <span className="text-primary">Drive</span> and <span className="text-primary">Service</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Jatra is your premium platform for vehicle rentals, professional maintenance, and on-demand emergency assistance.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/vehicles">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full group transition-all">
              Rent a Vehicle
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/centers">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
              Find a Service Center
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow group">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Premium Rentals</h3>
            <p className="text-muted-foreground text-sm">Access a diverse fleet of well-maintained vehicles for any occasion.</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow group">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Expert Servicing</h3>
            <p className="text-muted-foreground text-sm">Book appointments with certified automotive centers instantly.</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow group">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold mb-2">24/7 Emergency</h3>
            <p className="text-muted-foreground text-sm">Immediate on-road assistance whenever you need it most.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
