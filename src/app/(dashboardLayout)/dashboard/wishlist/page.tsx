import { Heart, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Wishlist</h2>
          <p className="text-muted-foreground">Manage your saved vehicles and favorite service centers.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search wishlist..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md outline-none focus:border-primary"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
          <Heart className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          You haven't saved any vehicles or service centers yet. Browse our collections and click the heart icon to save them here.
        </p>
        <Button>Explore Vehicles</Button>
      </div>
    </div>
  );
}
