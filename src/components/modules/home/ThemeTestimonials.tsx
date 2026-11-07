import { Star, Quote } from "lucide-react";

export function ThemeTestimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Tawhid Islam",
      role: "Customer",
      content: "The booking process was incredibly smooth. I rented a Camry for the weekend, and it was in pristine condition. The emergency feature also gives great peace of mind.",
      rating: 5,
    },
    {
      id: 2,
      name: "Srabon Islam",
      role: "Mechanic Partner",
      content: "As a service center owner, Jatra has brought us a consistent flow of customers. The dashboard is intuitive and makes managing service requests very easy.",
      rating: 5,
    },
    {
      id: 3,
      name: "Mufajjal Hosen",
      role: "Frequent Traveler",
      content: "Excellent service and very reliable vehicles. The UI is fantastic and saving 15% by prepaying is a game-changer.",
      rating: 4,
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-card relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center gap-2">
              <span className="w-8 h-[2px] bg-primary"></span>
              Client Testimonials
            </h3>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground uppercase tracking-tight">
              What They <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a1a1a] to-gray-400">Say</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-lg font-medium text-sm leading-loose">
            Discover the positive impact we&apos;ve made on our clients by reading through their experiences. Our clients have experienced our premium service and results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-card border-2 border-[#f4f4f4] p-10 rounded-sm relative hover:border-primary group transition-colors duration-300 shadow-sm hover:shadow-xl">
              <Quote className="absolute top-8 right-8 w-16 h-16 text-[#f4f4f4] group-hover:text-primary/10 transition-colors duration-300" />
              <div className="flex gap-1 mb-8 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < t.rating ? "fill-primary text-primary" : "fill-gray-200 text-gray-200"}`} 
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-10 italic leading-loose text-sm relative z-10 font-medium">
                &quot;{t.content}&quot;
              </p>
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 bg-[#1a1a1a] group-hover:bg-primary transition-colors text-white rounded-sm flex items-center justify-center font-black text-xl uppercase">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-lg uppercase tracking-wider">{t.name}</h4>
                  <span className="text-xs text-primary font-bold uppercase tracking-[2px]">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
