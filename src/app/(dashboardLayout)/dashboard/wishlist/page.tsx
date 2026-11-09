"use client";

import { useEffect, useState, useMemo } from "react";
import { wishlistService } from "@/services/wishlist.service";
import { WishlistData, WishlistVehicleItem, WishlistCenterItem } from "@/types/jatra";
import { 
  Heart, 
  Search, 
  Car, 
  Wrench, 
  Trash2, 
  ArrowRight, 
  Star, 
  MapPin, 
  Phone, 
  Building2, 
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

type TabType = "all" | "vehicles" | "centers";

export default function WishlistPage() {
  const [data, setData] = useState<WishlistData>({ total: 0, vehicles: [], centers: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistService.getMyWishlist();
      setData(res);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (wishlistId: string) => {
    try {
      setRemovingId(wishlistId);
      // Optimistic update
      setData((prev) => ({
        total: Math.max(0, prev.total - 1),
        vehicles: prev.vehicles.filter((v) => v.wishlistId !== wishlistId),
        centers: prev.centers.filter((c) => c.wishlistId !== wishlistId),
      }));

      await wishlistService.removeWishlistItem(wishlistId);
      toast.success("Item removed from your wishlist.");
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error("Failed to remove item. Please try again.");
      // Re-fetch on error
      fetchWishlist();
    } finally {
      setRemovingId(null);
    }
  };

  // Filter items by search query
  const filteredVehicles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return data.vehicles;
    return data.vehicles.filter((item) => {
      const v = item.vehicle;
      const make = (v.make || "").toLowerCase();
      const model = (v.model || "").toLowerCase();
      const plate = (v.licensePlate || "").toLowerCase();
      const centerName = (v.center?.name || "").toLowerCase();
      return make.includes(q) || model.includes(q) || plate.includes(q) || centerName.includes(q);
    });
  }, [data.vehicles, searchQuery]);

  const filteredCenters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return data.centers;
    return data.centers.filter((item) => {
      const c = item.center;
      const name = (c.name || "").toLowerCase();
      const address = (c.address || "").toLowerCase();
      const services = (c.servicesOffered || []).join(" ").toLowerCase();
      return name.includes(q) || address.includes(q) || services.includes(q);
    });
  }, [data.centers, searchQuery]);

  const totalFilteredCount = 
    activeTab === "all" ? filteredVehicles.length + filteredCenters.length
    : activeTab === "vehicles" ? filteredVehicles.length
    : filteredCenters.length;

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">
        Loading Your Wishlist...
      </div>
    );
  }

  const isCompletelyEmpty = data.vehicles.length === 0 && data.centers.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
              My Wishlist
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              {data.total} Saved
            </span>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm font-medium mt-1">
            Browse and manage your saved rental fleet cars and favorite automotive service centers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchWishlist}
          className="text-xs font-bold uppercase tracking-wider rounded-xl gap-2 self-start sm:self-auto h-9"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {isCompletelyEmpty ? (
        <div className="bg-card border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm space-y-4">
          <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20">
            <Heart className="h-8 w-8 fill-red-500 text-red-500" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">
            Your Wishlist Is Empty
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            You haven&apos;t saved any vehicles or workshop centers yet. Tap the heart icon on any car or automotive center to save them here for quick booking.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/vehicles">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs rounded-xl h-10 px-5 gap-1.5 shadow-sm">
                <Car className="w-4 h-4" />
                <span>Explore Rental Cars</span>
              </Button>
            </Link>
            <Link href="/centers">
              <Button variant="outline" className="font-bold uppercase tracking-wider text-xs rounded-xl h-10 px-5 gap-1.5">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Find Service Centers</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls: Search & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border w-fit">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "all"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({data.total})
              </button>
              <button
                onClick={() => setActiveTab("vehicles")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === "vehicles"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Cars ({data.vehicles.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("centers")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === "centers"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Workshops ({data.centers.length})</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search saved items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border rounded-xl text-xs outline-none focus:border-primary transition-colors text-foreground"
              />
            </div>
          </div>

          {/* Results Count Banner */}
          {searchQuery && (
            <p className="text-xs text-muted-foreground font-medium">
              Found {totalFilteredCount} matching item{totalFilteredCount !== 1 ? "s" : ""}
            </p>
          )}

          {/* Section: Vehicles */}
          {(activeTab === "all" || activeTab === "vehicles") && filteredVehicles.length > 0 && (
            <div className="space-y-4">
              {activeTab === "all" && (
                <div className="flex items-center gap-2 pt-2">
                  <Car className="w-4 h-4 text-primary" />
                  <h2 className="text-base font-black uppercase tracking-wider text-foreground">
                    Saved Rental Fleet ({filteredVehicles.length})
                  </h2>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVehicles.map(({ wishlistId, vehicle }) => {
                  const defaultCarImg = "https://demo.xpeedstudio.com/carrental/onepage-v4/wp-content/uploads/sites/9/2020/07/image7.png";
                  const img = vehicle.images?.[0] || defaultCarImg;

                  return (
                    <div
                      key={wishlistId}
                      className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="bg-muted/40 aspect-video relative flex items-center justify-center p-6 overflow-hidden">
                          <img
                            src={img}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          {vehicle.pricePerDay != null && (
                            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-black px-2.5 py-1 rounded-lg shadow-md font-mono">
                              ${Number(vehicle.pricePerDay || 0).toFixed(2)}/day
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border">
                            {vehicle.year} Model
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="font-black text-lg text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                              {vehicle.make} {vehicle.model}
                            </h3>
                            <p className="font-mono text-xs text-muted-foreground uppercase">
                              Plate: {vehicle.licensePlate}
                            </p>
                          </div>

                          {/* Branch Info */}
                          {vehicle.center && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
                              <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate">{vehicle.center.name} &bull; {vehicle.center.address}</span>
                            </div>
                          )}

                          {/* Features */}
                          {vehicle.features && vehicle.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {vehicle.features.slice(0, 3).map((f, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-bold uppercase bg-muted/60 px-2 py-0.5 rounded text-muted-foreground"
                                >
                                  {f}
                                </span>
                              ))}
                              {vehicle.features.length > 3 && (
                                <span className="text-[10px] font-bold text-muted-foreground">
                                  +{vehicle.features.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-5 pt-0 border-t mt-4 flex items-center justify-between gap-2">
                        <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
                          <Button
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs rounded-xl h-9 gap-1"
                          >
                            <span>Rent Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={removingId === wishlistId}
                          onClick={() => handleRemove(wishlistId)}
                          className="h-9 px-3 rounded-xl text-red-600 border-red-200 hover:bg-red-500/10 text-xs font-bold"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Centers */}
          {(activeTab === "all" || activeTab === "centers") && filteredCenters.length > 0 && (
            <div className="space-y-4">
              {activeTab === "all" && (
                <div className="flex items-center gap-2 pt-4">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <h2 className="text-base font-black uppercase tracking-wider text-foreground">
                    Saved Service Centers ({filteredCenters.length})
                  </h2>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCenters.map(({ wishlistId, center }) => {
                  const defaultCenterImg = "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&q=80";
                  const img = center.images?.[0] || defaultCenterImg;

                  return (
                    <div
                      key={wishlistId}
                      className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <img
                            src={img}
                            alt={center.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
                          
                          <div className="absolute top-3 right-3 bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-black" />
                            <span>{center.rating != null ? Number(center.rating).toFixed(1) : "5.0"}</span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <h3 className="font-black text-lg uppercase tracking-tight drop-shadow truncate">
                              {center.name}
                            </h3>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground font-medium">
                            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{center.address}</span>
                          </div>

                          {center.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                              <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>{center.phone}</span>
                            </div>
                          )}

                          {/* Services Offered */}
                          {center.servicesOffered && center.servicesOffered.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {center.servicesOffered.slice(0, 3).map((s, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded"
                                >
                                  {s}
                                </span>
                              ))}
                              {center.servicesOffered.length > 3 && (
                                <span className="text-[10px] font-bold text-muted-foreground">
                                  +{center.servicesOffered.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-5 pt-0 border-t mt-4 flex items-center justify-between gap-2">
                        <Link href={`/centers/${center.id}`} className="flex-1">
                          <Button
                            size="sm"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider text-xs rounded-xl h-9 gap-1 shadow-sm"
                          >
                            <span>Book Service</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={removingId === wishlistId}
                          onClick={() => handleRemove(wishlistId)}
                          className="h-9 px-3 rounded-xl text-red-600 border-red-200 hover:bg-red-500/10 text-xs font-bold"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No results for current filter */}
          {totalFilteredCount === 0 && (
            <div className="bg-card border rounded-2xl p-12 text-center space-y-2">
              <Search className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider">
                No Saved Items Match &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="text-xs text-muted-foreground">
                Try searching with a different keyword or switch tabs.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
