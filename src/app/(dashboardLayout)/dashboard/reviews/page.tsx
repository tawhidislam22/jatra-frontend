"use client";

import { useEffect, useState } from "react";
import { Star, Calendar, MessageSquare, AlertCircle } from "lucide-react";
import { reviewsService } from "@/services/reviews.service";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  center?: {
    name: string;
  };
  rentalBooking?: {
    vehicle?: {
      make: string;
      model: string;
    }
  };
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewsService.getMyReviews();
        if (response?.data) {
          setReviews(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">My Reviews</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage and view the feedback you've shared.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    {review.center?.name 
                      ? review.center.name 
                      : review.rentalBooking?.vehicle 
                        ? `${review.rentalBooking.vehicle.make} ${review.rentalBooking.vehicle.model}`
                        : "Unknown Subject"
                    }
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground font-medium gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  {review.center ? "Center Review" : "Vehicle Review"}
                </div>
              </div>

              {review.comment && (
                <div className="flex gap-3 bg-muted/30 p-4 rounded-xl border border-muted/50 mt-4">
                  <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-foreground leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed text-center px-4">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No reviews yet</h3>
          <p className="text-muted-foreground font-medium max-w-md">
            You haven't left any reviews for vehicles or automotive centers. Once you share your feedback, it will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
