"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { authService } from "@/services/auth.service";
import api from "@/services/api";

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const userRes = await authService.getMe();
        const user = userRes?.data;
        if (user?.data?.managedCenter?.id) {
          const res = await api.get(`/reviews/center/${user.data.managedCenter.id}`);
          if (res?.data?.data) {
            setReviews(res.data.data);
          } else if (Array.isArray(res?.data)) {
            setReviews(res.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
      />
    ));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customer Reviews</h1>

      {loading ? (
        <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">
          Loading Reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-card border rounded-xl p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Your center hasn&apos;t received any reviews yet. Reviews will appear here once customers rate your services.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shrink-0">
                    {review.customer?.fullName?.charAt(0)?.toUpperCase() || review.customer?.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1a1a]">
                      {review.customer?.fullName || review.customer?.name || "Customer"}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium shrink-0">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
              <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
