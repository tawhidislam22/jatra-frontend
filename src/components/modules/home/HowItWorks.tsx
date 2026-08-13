import { Search, CalendarCheck, Car, Settings, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Search & Compare",
    description: "Find the perfect vehicle or service center that meets your needs and budget using our advanced filters."
  },
  {
    icon: CalendarCheck,
    title: "Book Instantly",
    description: "Reserve your rental or schedule a service appointment instantly with our seamless online booking system."
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Complete your transaction securely through our integrated payment gateway with transparent pricing."
  },
  {
    icon: Car,
    title: "Drive & Enjoy",
    description: "Pick up your rental vehicle or drop off your car for service. We handle the rest."
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/10 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">How Jatra Works</h2>
          <p className="text-lg text-muted-foreground">
            Your comprehensive automotive journey simplified into four easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-0.5 bg-border -z-10" />

          {STEPS.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-card border shadow-sm flex items-center justify-center mb-6 relative group-hover:-translate-y-2 transition-transform duration-300">
                <step.icon className="w-8 h-8 text-primary" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
