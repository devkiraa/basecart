"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Shield, ShieldCheck, Mail, Trash2, CheckCircle2, AlertCircle, Loader2, Key, Info } from "lucide-react";

interface UsersTeamTabProps {
  token: string | null;
  API_URL: string;
  staffLimit?: number;
}

interface StaffMember {
  userId: string;
  email: string;
  role: string;
  emailVerified: number;
  createdAt: string;
}

export function UsersTeamTab({ token, API_URL, staffLimit = 10 }: UsersTeamTabProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const fetchStaffMembers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/staff`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(Array.isArray(data) ? data : []);
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || "Failed to load team members");
      }
    } catch (err: any) {
      setActionError(err.message || "Error loading staff members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMembers();
  }, [token]);

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes("@")) {
      setActionError("Please enter a valid email address.");
      return;
    }
    setSubmittingInvite(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch(`${API_URL}/store/staff/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`User ${inviteEmail} has been added to your store team!`);
        setInviteEmail("");
        setInviteModalOpen(false);
        await fetchStaffMembers();
      } else {
        throw new Error(data.error || "Failed to invite staff member.");
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to add team member");
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleRemoveStaff = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from your store team?`)) return;
    setRemovingUserId(userId);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch(`${API_URL}/store/staff/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Staff member ${email} removed.`);
        await fetchStaffMembers();
      } else {
        throw new Error(data.error || "Failed to remove user");
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to remove staff member");
    } finally {
      setRemovingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-[#4F46E5] border border-indigo-200 uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" /> Store Owner
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            <Shield className="h-3 w-3" /> Admin
          </span>
        );
      case "support":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            Customer Support
          </span>
        );
      case "fulfillment":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
            Fulfillment Lead
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            Staff Member
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Staff & Permissions</h2>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {staff.length} / {staffLimit} Slots Used
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure your store settings and automated preferences for users and staff access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          disabled={staff.length >= staffLimit}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-98 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Action Banners */}
      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Store Team Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Active Staff</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{staff.length}</p>
          <p className="text-[11px] text-slate-500 font-medium">Team members with active store access</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Plan Limit</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{staffLimit} Seats</p>
          <p className="text-[11px] text-slate-500 font-medium">Included in your active subscription tier</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Security Policy</span>
            <Key className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">Enforced</p>
          <p className="text-[11px] text-slate-500 font-medium">Role-based access control & session encryption</p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            <span>Store Team Members ({staff.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Managed via Basecart Merchant Control</span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-xs font-semibold">Loading team members...</span>
          </div>
        ) : staff.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Users className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No additional staff members added yet.</p>
            <p className="text-[11px] text-slate-500">Click "Invite Team Member" above to grant team access to your store.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {staff.map((member) => (
              <div key={member.userId} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-sm shrink-0">
                    {member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{member.email}</span>
                      {getRoleBadge(member.role)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      Added on {new Date(member.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Account
                  </span>
                  {member.role !== "owner" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(member.userId, member.email)}
                      disabled={removingUserId === member.userId}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove staff member"
                    >
                      {removingUserId === member.userId ? (
                        <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role & Permissions Reference Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Role Permissions Reference Matrix</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">Store Owner</span>
              <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Full Admin Access</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Unrestricted control over billing, Razorpay subscription, domain configuration, payout settings, and staff member accounts.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">Store Manager / Admin</span>
              <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Catalog & Operations</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Full control over products, discount codes, order fulfillment, customers, and store theme design settings.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">Fulfillment Lead</span>
              <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Logistics & Shipments</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Access to view orders, update fulfillment tracking codes, generate invoices, and manage inventory levels.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">Customer Support</span>
              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Support & Customers</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Access to view customer profiles, process order inquiries, review customer ratings, and resend email notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">Invite Team Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleInviteStaff} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@yourcompany.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Role & Access Level</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600/30 focus:outline-none cursor-pointer"
                >
                  <option value="staff">Store Manager (Products, Orders & Catalog)</option>
                  <option value="fulfillment">Fulfillment Lead (Orders & Inventory)</option>
                  <option value="support">Customer Support (Customers & Inquiries)</option>
                  <option value="admin">Store Admin (Full Control except Billing)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="px-5 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  <span>{submittingInvite ? "Adding..." : "Add Team Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
