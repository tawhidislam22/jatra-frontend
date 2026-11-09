"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye, 
  MapPin, 
  Phone, 
  Mail,
  Star, 
  Users, 
  Car, 
  Wrench,
  X,
  ShieldCheck,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { centersService } from "@/services/centers.service";
import { adminService } from "@/services/admin.service";

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await centersService.getAllCenters({ forAdmin: "true", limit: 100 });
      const rawList = res?.data || (Array.isArray(res) ? res : []);
      setCenters(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      console.error("Failed to load centers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const handleToggleVerification = async (centerId: string, currentStatus: boolean) => {
    try {
      setActionLoading(centerId);
      await adminService.verifyCenter(centerId, !currentStatus);
      await fetchCenters();
      if (selectedCenter && selectedCenter.id === centerId) {
        setSelectedCenter({ ...selectedCenter, isApproved: !currentStatus });
      }
    } catch (err) {
      console.error("Failed to toggle verification:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCenter = async (centerId: string) => {
    if (!confirm("Are you sure you want to permanently remove this Automotive Center?")) return;
    try {
      setActionLoading(centerId);
      await adminService.deleteCenter(centerId);
      setSelectedCenter(null);
      await fetchCenters();
    } catch (err) {
      console.error("Failed to delete center:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCenters = centers.filter((c) => {
    const matchesTab = 
      filterTab === "ALL" ? true :
      filterTab === "PENDING" ? !c.isApproved :
      filterTab === "APPROVED" ? c.isApproved : true;

    const centerEmail = c.admin?.email || c.email || "";

    const matchesSearch = 
      (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.admin?.fullName || c.admin?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      centerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || c.admin?.phone || "").includes(searchQuery);

    return matchesTab && matchesSearch;
  });

  const pendingCount = centers.filter(c => !c.isApproved).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Automotive Centers Directory
            </h1>
            <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {centers.length} Total
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-medium mt-1">
            Review, verify, and moderate partner workshops and service centers across the country.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search center, email, city, or owner..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-10 focus:border-red-500"
            />
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === "ALL" ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({centers.length})
            </button>
            <button
              onClick={() => setFilterTab("PENDING")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterTab === "PENDING" ? "bg-amber-600 text-white shadow" : "text-amber-400 hover:text-white"
              }`}
            >
              Pending
              {pendingCount > 0 && (
                <span className="bg-amber-500/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterTab("APPROVED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === "APPROVED" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      {/* Centers Table */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Loading Automotive Centers...
        </div>
      ) : filteredCenters.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-16 text-center shadow-xl">
          <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Centers Found</h3>
          <p className="text-zinc-500 text-xs mt-1">No automotive centers match your current filter or search term.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Workshop Center</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Owner & Email Contact</th>
                  <th className="p-4">Mechanics</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filteredCenters.map((c) => {
                  const centerImg = c.images && c.images.length > 0 ? c.images[0] : null;
                  const centerEmail = c.admin?.email || c.email || null;

                  return (
                    <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Center Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {centerImg ? (
                            <img 
                              src={centerImg} 
                              alt={c.name} 
                              className="w-12 h-10 object-cover rounded-lg border border-zinc-800 shrink-0 bg-zinc-900" 
                            />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{c.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {c.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-xs">{c.address || "Location not set"}</span>
                        </div>
                      </td>

                      {/* Owner, Email & Phone */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-zinc-200">
                            {c.admin?.fullName || c.admin?.name || "Owner Partner"}
                          </p>
                          {centerEmail && (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Mail className="w-3 h-3 text-red-500 shrink-0" />
                              <a
                                href={`mailto:${centerEmail}`}
                                className="text-zinc-300 hover:text-red-400 hover:underline transition-colors font-mono truncate max-w-[190px]"
                                title={centerEmail}
                              >
                                {centerEmail}
                              </a>
                            </div>
                          )}
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-zinc-600 shrink-0" />
                            <span>{c.phone || c.admin?.phone || "No phone"}</span>
                          </p>
                        </div>
                      </td>

                      {/* Mechanics count */}
                      <td className="p-4">
                        <span className="bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-md text-[11px] font-bold border border-zinc-800 flex items-center gap-1.5 w-fit">
                          <Users className="w-3.5 h-3.5 text-zinc-500" />
                          {(c.mechanics || []).length} Staff
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {c.rating || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {c.isApproved ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCenter(c)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 px-2.5 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>

                          {c.isApproved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading === c.id}
                              onClick={() => handleToggleVerification(c.id, true)}
                              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg"
                            >
                              Revoke
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={actionLoading === c.id}
                              onClick={() => handleToggleVerification(c.id, false)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg px-3"
                            >
                              Approve
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={actionLoading === c.id}
                            onClick={() => handleDeleteCenter(c.id)}
                            className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 h-8 w-8 p-0 rounded-lg"
                            title="Delete Center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Center Details Modal */}
      {selectedCenter && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setSelectedCenter(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-600/20 text-red-500 border border-red-500/30 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white">{selectedCenter.name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 mt-0.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {selectedCenter.address}
                  </span>
                  {(selectedCenter.admin?.email || selectedCenter.email) && (
                    <span className="flex items-center gap-1.5 font-mono text-zinc-300">
                      <Mail className="w-3.5 h-3.5 text-red-500" /> {selectedCenter.admin?.email || selectedCenter.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedCenter.images && selectedCenter.images.length > 0 && (
              <div className="mb-6 rounded-xl overflow-hidden border border-zinc-800 h-48 bg-zinc-900">
                <img src={selectedCenter.images[0]} alt={selectedCenter.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Center Email</p>
                <p className="text-xs font-bold text-white mt-1 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <a 
                    href={`mailto:${selectedCenter.admin?.email || selectedCenter.email}`}
                    className="hover:text-red-400 hover:underline truncate"
                    title={selectedCenter.admin?.email || selectedCenter.email || "No email"}
                  >
                    {selectedCenter.admin?.email || selectedCenter.email || "Not specified"}
                  </a>
                </p>
              </div>
              <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Owner Contact</p>
                <p className="text-xs font-bold text-white mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {selectedCenter.phone || selectedCenter.admin?.phone || "Not specified"}
                </p>
              </div>
              <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Customer Rating</p>
                <p className="text-xs font-bold text-amber-400 mt-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedCenter.rating || 0} / 5.0
                </p>
              </div>
              <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Approval Status</p>
                <p className="text-xs font-bold mt-1">
                  {selectedCenter.isApproved ? (
                    <span className="text-emerald-400">Approved</span>
                  ) : (
                    <span className="text-amber-400">Pending Review</span>
                  )}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">About this Workshop</h4>
              <p className="text-xs text-zinc-300 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 leading-relaxed">
                {selectedCenter.description || "No custom description registered for this automotive center."}
              </p>
            </div>

            {/* Services Offered */}
            <div className="mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Services Provided</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedCenter.servicesOffered || selectedCenter.services || []).map((s: string, idx: number) => (
                  <span key={idx} className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => handleDeleteCenter(selectedCenter.id)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider rounded-xl"
              >
                Delete Center
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCenter(null)}
                  className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleToggleVerification(selectedCenter.id, selectedCenter.isApproved)}
                  className={`text-xs font-bold uppercase tracking-wider rounded-xl px-4 ${
                    selectedCenter.isApproved
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {selectedCenter.isApproved ? "Revoke Approval" : "Approve Workshop"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
