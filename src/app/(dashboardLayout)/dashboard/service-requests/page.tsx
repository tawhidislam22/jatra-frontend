"use client";

import { useEffect, useState } from "react";
import { serviceRequestsService } from "@/services/services.service";

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await serviceRequestsService.getRequests();
        if (response && response.data) {
          setRequests(response.data);
        } else if (Array.isArray(response)) {
          setRequests(response);
        }
      } catch (err) {
        console.error("Failed to fetch service requests:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm animate-pulse">Loading Service Requests...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Service Requests</h1>
      <div className="bg-card border rounded-xl overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No service requests found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-semibold">Service ID</th>
                <th className="p-4 font-semibold">Vehicle & Center</th>
                <th className="p-4 font-semibold">Details</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono text-xs text-muted-foreground">{req.id.substring(0, 8)}...</td>
                  <td className="p-4 font-medium text-primary">
                    {req.vehicle ? `${req.vehicle.make} ${req.vehicle.model}` : "Unknown Vehicle"}
                    <div className="text-xs font-normal text-muted-foreground mt-1">{req.center ? req.center.name : "Unknown Center"}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{req.serviceType}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(req.scheduledDate).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : req.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
