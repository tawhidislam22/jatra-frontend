"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { wishlistService } from "@/services/wishlist.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WishlistButtonProps {
  vehicleId?: string;
  centerId?: string;
  initialWishlisted?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  onToggle?: (wishlisted: boolean) => void;
}

export function WishlistButton({
  vehicleId,
  centerId,
  initialWishlisted = false,
  className = "",
  size = "md",
  showLabel = false,
  onToggle,
}: WishlistButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to save to your wishlist.");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (loading || (!vehicleId && !centerId)) return;

    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    if (onToggle) onToggle(nextState);

    try {
      setLoading(true);
      const res = await wishlistService.toggleWishlist({
        vehicleId,
        centerId,
      });

      const serverState = res?.data?.wishlisted ?? nextState;
      setIsWishlisted(serverState);
      if (onToggle && serverState !== nextState) {
        onToggle(serverState);
      }

      if (serverState) {
        toast.success(vehicleId ? "Vehicle saved to your wishlist!" : "Workshop center saved to your wishlist!");
      } else {
        toast.info(vehicleId ? "Vehicle removed from your wishlist." : "Workshop center removed from your wishlist.");
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      toast.error("Failed to update wishlist. Please try again.");
      // Revert on error
      setIsWishlisted(!nextState);
      if (onToggle) onToggle(!nextState);
    } finally {
      setLoading(false);
    }
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonSizes = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`rounded-full transition-all duration-200 flex items-center gap-1.5 backdrop-blur-md shadow-sm group ${
        isWishlisted
          ? "bg-red-500/15 text-red-600 dark:text-red-500 border border-red-500/30 hover:bg-red-500/25"
          : "bg-background/80 hover:bg-background text-muted-foreground hover:text-red-500 border border-border/80"
      } ${buttonSizes[size]} ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-transform duration-200 group-hover:scale-110 ${
          isWishlisted ? "fill-red-500 text-red-500" : ""
        }`}
      />
      {showLabel && (
        <span className="text-xs font-bold uppercase tracking-wider pr-1">
          {isWishlisted ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
