"use client";

import { useEffect, useState } from "react";
import { 
  CalendarDays, 
  Clock, 
  Car, 
  User, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  Calendar as CalendarIcon
} from "lucide-react";
import { serviceRequestsService } from "@/services/services.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MechanicSchedulePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TODAY' | 'UPCOMING' | 'ALL'>('TODAY');

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const res = await serviceRequestsService.getRequests();
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setRequests(raw);
      } catch (err) {
        console.error("Failed to load schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const todayTasks = requests.filter((r) => {
    if (!r.scheduledDate) return false;
    return new Date(r.scheduledDate).toISOString().split('T')[0] === today;
  });

  const upcomingTasks = requests.filter((r) => {
    if (!r.scheduledDate) return true;
    return new Date(r.scheduledDate).toISOString().split('T')[0] > today;
  });

  const displayedTasks = 
    activeTab === 'TODAY' ? todayTasks :
    activeTab === 'UPCOMING' ? upcomingTasks : requests;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
            Mechanic Task Schedule
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Daily timeline and upcoming repair appointments
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-card p-1 rounded-lg border">
          <button
            onClick={() => setActiveTab('TODAY')}
            className={`px-4 py-1.5 rounded text-xs font-extrabold uppercase tracking-wider transition-colors ${activeTab === 'TODAY' ? 'bg-amber-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
          >
            Today ({todayTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-4 py-1.5 rounded text-xs font-extrabold uppercase tracking-wider transition-colors ${activeTab === 'UPCOMING' ? 'bg-amber-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
          >
            Upcoming ({upcomingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-1.5 rounded text-xs font-extrabold uppercase tracking-wider transition-colors ${activeTab === 'ALL' ? 'bg-amber-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
          >
            All ({requests.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-bold uppercase text-xs tracking-wider animate-pulse">
          Loading schedule...
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-foreground uppercase">No Scheduled Appointments</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {activeTab === 'TODAY' 
              ? "You have no appointments scheduled for today. Check upcoming tasks or view your full queue."
              : "No upcoming service appointments found."}
          </p>
          <Link href="/mechanic/dashboard/assigned-services">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider mt-2">
              View All Assigned Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedTasks.map((task, idx) => (
            <div key={task.id || idx} className="bg-card border rounded-xl p-5 shadow-sm hover:border-amber-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                  <CalendarIcon className="w-4 h-4 mb-0.5" />
                  <span className="text-[11px] font-black leading-none">
                    {task.scheduledDate ? new Date(task.scheduledDate).getDate() : "NOW"}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider">
                    {task.scheduledDate ? new Date(task.scheduledDate).toLocaleString('default', { month: 'short' }) : "TODAY"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : (task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')}`}>
                      {task.status}
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase">{task.serviceType || "Maintenance Service"}</h3>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {task.issueDescription || "General vehicle service and inspection"}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-amber-600" />
                      {task.vehicle ? `${task.vehicle.brand || ''} ${task.vehicle.model || ''}` : "Vehicle"}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      {task.customer?.fullName || task.customer?.name || "Customer"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link href="/mechanic/dashboard/assigned-services">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider h-9 px-4">
                    <Wrench className="w-3.5 h-3.5 mr-1.5" /> Manage Job
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
