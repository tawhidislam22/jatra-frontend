"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  Calendar, 
  UserCheck, 
  UserX,
  X,
  Building2,
  Car,
  Wrench,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (searchQuery.trim()) params.searchTerm = searchQuery.trim();

      const res = await adminService.getAllUsers(params);
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setUsers(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      await adminService.updateUserRole(userId, newRole);
      await fetchUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      setActionLoading(userId);
      const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      await adminService.updateUserStatus(userId, newStatus);
      await fetchUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      setActionLoading(userId);
      await adminService.deleteUser(userId);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const res = await adminService.getUserById(userId);
      setSelectedUser(res?.data || res);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Users & Roles Management
            </h1>
            <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {users.length} Users
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-medium mt-1">
            Manage permissions, change user roles, and control access privileges across all platform accounts.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, phone..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white rounded-xl h-10 focus:border-red-500"
            />
          </form>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
            {["ALL", "CUSTOMER", "OWNER", "MECHANIC", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  roleFilter === r ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Loading Users Directory...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-16 text-center shadow-xl">
          <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Users Found</h3>
          <p className="text-zinc-500 text-xs mt-1">No registered users matched the selected role or search term.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Center / Affiliation</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {users.map((u) => {
                  const roleBadgeClass = 
                    u.role === "ADMIN" ? "bg-red-500/20 text-red-400 border-red-500/30 font-black" :
                    u.role === "OWNER" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                    u.role === "MECHANIC" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-blue-500/20 text-blue-400 border-blue-500/30";

                  const centerAffiliation = 
                    u.managedCenters && u.managedCenters.length > 0 ? u.managedCenters[0].name :
                    u.employedAtCenter ? u.employedAtCenter.name : "None (Individual)";

                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white shrink-0">
                            {(u.fullName || u.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{u.fullName || u.name || "No name"}</p>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {u.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4">
                        <div>
                          <p className="text-zinc-200 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-zinc-500 shrink-0" /> {u.email}
                          </p>
                          {u.phone && (
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-zinc-600 shrink-0" /> {u.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="p-4">
                        <select
                          value={u.role}
                          disabled={actionLoading === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`border rounded-lg px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer bg-zinc-900 transition-colors ${roleBadgeClass}`}
                        >
                          <option value="CUSTOMER" className="bg-zinc-900 text-white">CUSTOMER</option>
                          <option value="OWNER" className="bg-zinc-900 text-white">OWNER</option>
                          <option value="MECHANIC" className="bg-zinc-900 text-white">MECHANIC</option>
                          <option value="ADMIN" className="bg-zinc-900 text-white">ADMIN</option>
                        </select>
                      </td>

                      {/* Affiliation */}
                      <td className="p-4 text-zinc-400 text-xs">
                        <span className="truncate max-w-[180px] block" title={centerAffiliation}>
                          {centerAffiliation}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {u.status === "ACTIVE" ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            Blocked
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewUser(u.id)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 px-2.5 rounded-lg"
                            title="Inspect Profile"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading === u.id}
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            className={`text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg px-2.5 ${
                              u.status === "ACTIVE"
                                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Block" : "Unblock"}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={actionLoading === u.id}
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 h-8 w-8 p-0 rounded-lg"
                            title="Delete User"
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

      {/* User Details Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-black text-lg">
                {(selectedUser.fullName || selectedUser.name || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white">
                  {selectedUser.fullName || selectedUser.name}
                </h2>
                <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" /> {selectedUser.email}
                  {selectedUser.phone && <span>• {selectedUser.phone}</span>}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Role</p>
                <p className="text-xs font-bold text-white mt-1">{selectedUser.role}</p>
              </div>
              <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Status</p>
                <p className={`text-xs font-bold mt-1 ${selectedUser.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedUser.status}
                </p>
              </div>
              <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Vehicles</p>
                <p className="text-xs font-bold text-white mt-1">{(selectedUser.ownedVehicles || []).length} Cars</p>
              </div>
              <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Bookings</p>
                <p className="text-xs font-bold text-white mt-1">{(selectedUser.rentalBookings || []).length} Bookings</p>
              </div>
            </div>

            {/* Managed Centers if OWNER */}
            {selectedUser.managedCenters && selectedUser.managedCenters.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> Managed Automotive Centers
                </h4>
                <div className="space-y-2">
                  {selectedUser.managedCenters.map((c: any) => (
                    <div key={c.id} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-white">{c.name}</p>
                        <p className="text-[10px] text-zinc-500">{c.address}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {c.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Employed Center if MECHANIC */}
            {selectedUser.employedAtCenter && (
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" /> Employed at Workshop
                </h4>
                <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                  <p className="font-bold text-xs text-white">{selectedUser.employedAtCenter.name}</p>
                  <p className="text-[10px] text-zinc-500">{selectedUser.employedAtCenter.address}</p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider rounded-xl"
              >
                Delete Account
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedUser(null)}
                  className="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleStatusToggle(selectedUser.id, selectedUser.status)}
                  className={`text-xs font-bold uppercase tracking-wider rounded-xl px-4 ${
                    selectedUser.status === "ACTIVE"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {selectedUser.status === "ACTIVE" ? "Block Account" : "Unblock Account"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
