import Link from "next/link";
import { Car } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3166&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />
      
      {/* Brand Header */}
      <div className="relative z-10 mb-8 mt-8 flex flex-col items-center">
        <Link href="/" className="flex gap-2 items-center mb-4 group">
          <div className="bg-primary p-3 rounded-sm text-white group-hover:bg-white group-hover:text-primary transition-colors duration-300 shadow-[0_0_15px_rgba(230,0,0,0.5)]">
            <Car className="h-8 w-8" />
          </div>
          <span className="font-black text-4xl tracking-tighter text-white uppercase">JATRA</span>
        </Link>
      </div>
      
      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
