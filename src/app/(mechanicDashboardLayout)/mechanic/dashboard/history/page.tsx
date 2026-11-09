"use client";

import { useEffect, useState } from "react";
import { 
  History, 
  Calendar, 
  Car, 
  User, 
  Search, 
  Wrench, 
  ShieldCheck
} from "lucide-react";
import { serviceRequestsService } from "@/services/services.service";
import { Input } from "@/components/ui/input";

export default function MechanicHistoryPage() {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const servicesRes = await serviceRequestsService.getRequests();
        const rawServices = servicesRes?.data || (Array.isArray(servicesRes) ? servicesRes : []);

        const completedServices = rawServices
          .filter((s: any) => s.status === "COMPLETED")
          .map((s: any) => ({ ...s, jobType: "SERVICE" }));

        const sorted = completedServices.sort(
          (a: any, b: any) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
        );

        setHistoryItems(sorted);
      } catch (err) {
        console.error("Failed to load repair history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredHistory = historyItems.filter((item) => {
    const text = `${item.serviceType || ''} ${item.issueDescription || ''} ${item.customer?.fullName || item.customer?.name || ''} ${item.vehicle?.model || ''}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            Repair & Service History
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Log of all completed workshop maintenance and repair jobs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-sm flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Total Finished: {historyItems.length}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          type="text"
          placeholder="Search by customer, vehicle, or issue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card text-xs font-semibold rounded-sm border-border"
        />
      </div>

      {/* History Items */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-bold uppercase text-xs tracking-wider animate-pulse">
          Loading history log...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center space-y-3">
          <History className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-foreground uppercase">No History Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {searchQuery 
              ? "No finished jobs match your search filter."
              : "Completed service requests will be logged here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item, idx) => (
            <div key={item.id || idx} className="bg-card border rounded-xl p-5 shadow-sm space-y-3 hover:border-emerald-400 transition-all">
              <div className="flex items-start justify-between gap-3 border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded flex items-center gap-1 bg-emerald-100 text-emerald-800">
                    <Wrench className="w-3 h-3" /> Service Request
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
                    COMPLETED
                  </span>
                </div>

                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground uppercase">
                  {item.serviceType || item.issueDescription || "Completed Automotive Repair"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {item.issueDescription || "Repair completed and verified."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 border-t text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Car className="w-3.5 h-3.5 text-amber-600" />
                  {item.vehicle ? `${item.vehicle.brand || item.vehicle.make || ''} ${item.vehicle.model || ''} (${item.vehicle.licensePlate || 'N/A'})` : "Vehicle on file"}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  {item.customer?.fullName || item.customer?.name || "Customer"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
