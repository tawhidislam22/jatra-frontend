"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { emergencyService } from "@/services/emergency.service";
import { authService } from "@/services/auth.service";
import { centersService } from "@/services/centers.service";

export default function EmergenciesPage() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMechanics, setSelectedMechanics] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [emergenciesRes, meRes] = await Promise.all([
        emergencyService.getEmergencies(),
        authService.getMe()
      ]);
      setEmergencies(emergenciesRes.data || []);
      
      if (meRes.data?.managedCenter) {
        const centerRes = await centersService.getCenterById(meRes.data.managedCenter?.id);
        setMechanics(centerRes.data?.mechanics || []);
      }
    } catch (error) {
      console.error("Failed to load emergencies", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMechanicSelect = (id: string, mechanicId: string) => {
    setSelectedMechanics(prev => ({ ...prev, [id]: mechanicId }));
  };

  const handleAssign = async (id: string) => {
    const mechanicId = selectedMechanics[id];
    if (!mechanicId) return;
    try {
      await emergencyService.assignMechanic(id, mechanicId);
      loadData();
    } catch (error) {
      console.error("Failed to assign mechanic", error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await emergencyService.updateStatus(id, { status });
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
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading emergencies...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1a1a1a] uppercase tracking-wider">Emergency Assistance</h1>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Customer</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Location</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Issue</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Status</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Mechanic</th>
              <th className="p-4 font-semibold text-[#1a1a1a] uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {emergencies.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
                  No emergency requests found.
                </td>
              </tr>
            ) : (
              emergencies.map((em) => (
                <tr key={em._id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm font-medium">{em.customer?.fullName || 'Customer'}</td>
                  <td className="p-4 text-sm">
                    {em.location?.coordinates ? 
                      `${em.location.coordinates[1].toFixed(4)}, ${em.location.coordinates[0].toFixed(4)}` : 
                      'Unknown'}
                  </td>
                  <td className="p-4 text-sm">{em.issueDescription}</td>
                  <td className="p-4">{getStatusBadge(em.status)}</td>
                  <td className="p-4 text-sm">
                    {em.mechanic?.fullName ? (
                      <span className="font-medium">{em.mechanic.fullName}</span>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 flex gap-2 items-center">
                    {em.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <select 
                          className="border rounded px-2 py-1 text-xs"
                          value={selectedMechanics[em._id] || ""}
                          onChange={(e) => handleMechanicSelect(em._id, e.target.value)}
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
                          onClick={() => handleAssign(em._id)}
                          disabled={!selectedMechanics[em._id]}
                        >
                          Assign
                        </Button>
                      </div>
                    )}
                    {em.status === 'ACCEPTED' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-bold text-xs uppercase tracking-wider text-purple-700 border-purple-200 hover:bg-purple-50"
                        onClick={() => handleUpdateStatus(em._id, 'IN_PROGRESS')}
                      >
                        Start Work
                      </Button>
                    )}
                    {em.status === 'IN_PROGRESS' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-bold text-xs uppercase tracking-wider text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => handleUpdateStatus(em._id, 'COMPLETED')}
                      >
                        Complete
                      </Button>
                    )}
                    {em.status !== 'COMPLETED' && em.status !== 'CANCELLED' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-bold text-xs uppercase tracking-wider text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(em._id, 'CANCELLED')}
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
