"use client";

import { useState, useEffect } from "react";
import { 
  Star, 
  Search, 
  Trash2, 
  Building2, 
  User, 
  Calendar, 
  ShieldAlert, 
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllReviews();
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setReviews(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete and remove this review from the platform?")) return;
    try {
      setDeletingId(id);
      await adminService.deleteReview(id);
      await fetchReviews();
    } catch (err) {
      console.error("Failed to delete review:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchesSearch = 
      (r.customer?.fullName || r.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.center?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Review Moderation & Feedback
            </h1>
            <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {reviews.length} Reviews
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-medium mt-1">
            Moderate customer reviews, inspect workshop feedback, and remove fraudulent or abusive ratings.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search review, center, customer..."
            className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-10 focus:border-red-500"
          />
        </div>
      </div>

      {/* Reviews Feed */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Loading Reviews Feed...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-16 text-center shadow-xl">
          <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Reviews Found</h3>
          <p className="text-zinc-500 text-xs mt-1">No customer reviews match your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((r) => (
            <div key={r.id} className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white shrink-0">
                      {(r.customer?.fullName || r.customer?.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {r.customer?.fullName || r.customer?.name || "Verified Customer"}
                      </p>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-zinc-600" />
                        Reviewed: <strong className="text-zinc-400">{r.center?.name || "Automotive Center"}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{r.rating} / 5</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 font-medium leading-relaxed bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/60">
                  &ldquo;{r.comment || "No written review comment provided."}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-600" />
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent"}
                </span>

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={deletingId === r.id}
                  onClick={() => handleDeleteReview(r.id)}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold rounded-lg h-8 px-2.5"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  {deletingId === r.id ? "Deleting..." : "Delete Review"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
