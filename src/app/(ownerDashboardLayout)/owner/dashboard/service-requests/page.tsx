"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Wrench, MapPin } from "lucide-react";
import { serviceRequestsService } from "@/services/services.service";
import { authService } from "@/services/auth.service";
import { centersService } from "@/services/centers.service";

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMechanics, setSelectedMechanics] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsRes, meRes] = await Promise.all([
        serviceRequestsService.getRequests(),
        authService.getMe()
      ]);
      setRequests(requestsRes.data || []);
      
      if (meRes.data?.managedCenter) {
        const centerRes = await centersService.getCenterById(meRes.data.managedCenter?.id);
        setMechanics(centerRes.data?.mechanics || []);
      }
    } catch (error) {
      console.error("Failed to load service requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMechanicSelect = (requestId: string, mechanicId: string) => {
    setSelectedMechanics(prev => ({ ...prev, [requestId]: mechanicId }));
  };

  const handleAssign = async (id: string) => {
    const mechanicId = selectedMechanics[id];
    if (!mechanicId) return;
    try {
      await serviceRequestsService.assignMechanic(id, mechanicId);
      loadData();
    } catch (error) {
      console.error("Failed to assign mechanic", error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await serviceRequestsService.updateStatus(id, { status });
      loadData();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest";
    switch (status) {
      case "PENDING":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>PENDING</span>;
      case "ACCEPTED":
        return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>ACCEPTED</span>;
      case "IN_PROGRESS":
        return <span className={`${baseClasses} bg-purple-100 text-purple-700`}>IN_PROGRESS</span>;
      case "COMPLETED":
        return <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>COMPLETED</span>;
      case "CANCELLED":
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>CANCELLED</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading service requests...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1a1a1a] uppercase tracking-wider">Service Requests</h1>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Customer</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Vehicle</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Service Type</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Scheduled Date</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Issue</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Status</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Mechanic</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
                  No service requests found.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request._id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm font-medium">{request.customer?.fullName || 'Customer'}</td>
                  <td className="p-4 text-sm">{request.vehicle?.make ? `${request.vehicle.make} ${request.vehicle.model}` : 'Vehicle'}</td>
                  <td className="p-4 text-sm">
                    {request.serviceType === 'DOORSTEP' ? (
                      <span className="flex items-center gap-1 text-[#E60000] font-bold text-xs"><MapPin className="h-3 w-3" /> DOORSTEP</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-700 font-bold text-xs"><Wrench className="h-3 w-3" /> WORKSHOP</span>
                    )}
                  </td>
                  <td className="p-4 text-sm">{new Date(request.scheduledDate).toLocaleDateString()}</td>
                  <td className="p-4 text-sm">{request.issueDescription}</td>
                  <td className="p-4">{getStatusBadge(request.status)}</td>
                  <td className="p-4 text-sm">
                    {request.mechanic?.fullName ? (
                      <span className="font-medium">{request.mechanic.fullName}</span>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 flex gap-2 items-center">
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <select 
                          className="border rounded px-2 py-1 text-xs"
                          value={selectedMechanics[request._id] || ""}
                          onChange={(e) => handleMechanicSelect(request._id, e.target.value)}
                        >
                          <option value="">Select Mechanic</option>
                          {mechanics.map(m => (
                            <option key={m._id} value={m._id}>{m.fullName || m.name}</option>
                          ))}
                        </select>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="font-bold text-xs uppercase tracking-wider"
                          onClick={() => handleAssign(request._id)}
                          disabled={!selectedMechanics[request._id]}
                        >
                          Assign
                        </Button>
                      </div>
                    )}
                    {request.status === 'ACCEPTED' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-bold text-xs uppercase tracking-wider text-purple-700 border-purple-200 hover:bg-purple-50"
                        onClick={() => handleUpdateStatus(request._id, 'IN_PROGRESS')}
                      >
                        Start Work
                      </Button>
                    )}
                    {request.status === 'IN_PROGRESS' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-bold text-xs uppercase tracking-wider text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => handleUpdateStatus(request._id, 'COMPLETED')}
                      >
                        Complete
                      </Button>
                    )}
                    {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-bold text-xs uppercase tracking-wider text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(request._id, 'CANCELLED')}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
