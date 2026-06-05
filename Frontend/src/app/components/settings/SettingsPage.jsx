import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Users as UsersIcon,
  ShieldAlert,
  History,
  Search,
  Plus,
  MoreVertical,
  Edit2,
  KeyRound,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Building,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

const MODULES = [
  "Dashboard",
  "Shipments",
  "Trip Tracking",
  "Invoices",
  "Expenses",
  "Vehicles",
  "Drivers",
  "Reports",
  "Settings",
  "Help & Support",
];

const ROLES = [
  { name: "Super Admin", desc: "Full system access including user management" },
  { name: "Billing Executive (Invoice Operator)", desc: "Manage billing and invoices" },
  { name: "Operations Supervisor", desc: "Manage logistics and vehicle operations" },
  { name: "Accounts Executive", desc: "Manage financial data and reporting" }
];

const BRANCHES = ["All Branches", "Mumbai Hub", "Delhi Hub", "Chennai Hub", "Kolkata Hub", "Bangalore Hub"];

export function SettingsPage() {
  const { user: currentUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Activity Log State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Activity Log Filters
  const [logDateFilter, setLogDateFilter] = useState("all"); // 'all', 'today', 'yesterday', 'custom'
  const [logCustomDate, setLogCustomDate] = useState(""); // 'YYYY-MM-DD'
  const [logActionFilter, setLogActionFilter] = useState("all"); // 'all', 'login'

  const getFilteredLogs = () => {
    return logs.filter((log) => {
      // 1. Action Filter
      if (logActionFilter === "login") {
        const isLoginAction =
          log.action === "Login" ||
          log.action === "Failed Login" ||
          log.action?.toLowerCase().includes("login");
        if (!isLoginAction) return false;
      }

      // 2. Date Filter
      if (logDateFilter === "all") return true;

      const logDate = new Date(log.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      if (logDateFilter === "today") {
        return isSameDay(logDate, today);
      }
      if (logDateFilter === "yesterday") {
        return isSameDay(logDate, yesterday);
      }
      if (logDateFilter === "custom") {
        if (!logCustomDate) return true;
        const targetDate = new Date(logCustomDate);
        return isSameDay(logDate, targetDate);
      }

      return true;
    });
  };

  // Permissions state
  const [selectedRole, setSelectedRole] = useState("Super Admin");
  const [rolePermissions, setRolePermissions] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Password reset state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Billing Executive (Invoice Operator)",
    branch: "Mumbai Hub",
  });
  const [formError, setFormError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.role === "Super Admin") {
      fetchUsers();
      fetchLogs();
    }
  }, [token, currentUser]);

  if (currentUser?.role !== "Super Admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] bg-slate-50/50">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to view the Settings page.</p>
        <Button onClick={() => window.history.back()} className="mt-6 bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-xl">
          Go Back
        </Button>
      </div>
    );
  }

  const initializePermissions = (fetchedUsers) => {
    const defaultPerms = {};
    ROLES.forEach((role) => {
      const existingUser = fetchedUsers.find(u => u.role === role.name && u.permissions?.length > 0);
      
      defaultPerms[role.name] = MODULES.map((m) => {
        if (existingUser) {
          const existingPerm = existingUser.permissions.find(p => p.module === m);
          if (existingPerm) return existingPerm;
        }
        return {
          module: m,
          view: role.name === "Super Admin",
          create: role.name === "Super Admin",
          edit: role.name === "Super Admin",
          delete: role.name === "Super Admin",
        };
      });
    });
    setRolePermissions(defaultPerms);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        initializePermissions(data.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API}/users/activity-log`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleOpenAddUser = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "Billing Executive (Invoice Operator)",
      branch: "Mumbai Hub",
    });
    setFormError("");
    setUserDialogOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setIsEditing(true);
    setEditingUserId(user._id);
    setFormData({
      username: user.username,
      email: user.email,
      password: "", // blank in edit mode
      role: user.role,
      branch: user.branch || "Mumbai Hub",
    });
    setFormError("");
    setUserDialogOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setActionLoading(true);

    const isSuperAdmin = currentUser?.role === "Super Admin";
    if (!isSuperAdmin) {
      setFormError("Only Super Admins can add or edit users.");
      setActionLoading(false);
      return;
    }

    try {
      const url = isEditing ? `${API}/users/${editingUserId}` : `${API}/users`;
      const method = isEditing ? "PUT" : "POST";
      const body = { ...formData };
      if (isEditing) delete body.password; // Don't send blank password on edit

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setUserDialogOpen(false);
        fetchUsers();
        fetchLogs();
      } else {
        setFormError(data.message || "Failed to save user");
      }
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`${API}/users/${user._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)));
        fetchLogs();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API}/users/${resetUserId}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setResetDialogOpen(false);
        setNewPassword("");
        fetchLogs();
      } else {
        setResetError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setResetError("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user._id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) return;

    try {
      const res = await fetch(`${API}/users/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        fetchLogs();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handlePermissionChange = (moduleName, field, value) => {
    if (selectedRole === "Super Admin") return; // Super admin permissions are immutable
    setRolePermissions((prev) => {
      const updated = { ...prev };
      updated[selectedRole] = updated[selectedRole].map((m) =>
        m.module === moduleName ? { ...m, [field]: value } : m
      );
      return updated;
    });
  };

  const handleSelectAllForRow = (moduleName, value) => {
    if (selectedRole === "Super Admin") return;
    setRolePermissions((prev) => {
      const updated = { ...prev };
      updated[selectedRole] = updated[selectedRole].map((m) =>
        m.module === moduleName ? { ...m, view: value, create: value, edit: value, delete: value } : m
      );
      return updated;
    });
  };

  const handleSelectAllGlobal = (value) => {
    if (selectedRole === "Super Admin") return;
    setRolePermissions((prev) => {
      const updated = { ...prev };
      updated[selectedRole] = updated[selectedRole].map((m) => ({
        ...m, view: value, create: value, edit: value, delete: value
      }));
      return updated;
    });
  };

  const handleSavePermissions = async () => {
    setSavingPermissions(true);
    // Find all users with the selected role and sync their permissions
    const usersToUpdate = users.filter((u) => u.role === selectedRole);
    const targetPerms = rolePermissions[selectedRole];

    try {
      await Promise.all(
        usersToUpdate.map((u) =>
          fetch(`${API}/users/${u._id}/permissions`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ permissions: targetPerms }),
          })
        )
      );
      fetchLogs();
      alert("Permissions updated successfully for all users with this role.");
    } catch (err) {
      console.error("Error updating permissions:", err);
      alert("Failed to update permissions.");
    } finally {
      setSavingPermissions(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllGlobalSelected = MODULES.every(mod => {
    const perm = rolePermissions[selectedRole]?.find(m => m.module === mod);
    return perm && perm.view && perm.create && perm.edit && perm.delete;
  });

  const isRowSelected = (mod) => {
    const perm = rolePermissions[selectedRole]?.find(m => m.module === mod);
    return perm && perm.view && perm.create && perm.edit && perm.delete;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">User & Role Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system access, configure roles, and monitor user activities across branches.
          </p>
        </div>
        {activeTab === "users" && currentUser?.role === "Super Admin" && (
          <Button onClick={handleOpenAddUser} className="bg-[#1d4ed8] hover:bg-blue-800 text-white gap-2 h-10 px-4 rounded-xl shadow-sm transition-all duration-200">
            <Plus className="w-4 h-4" />
            New User
          </Button>
        )}
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-medium tracking-wide border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "users"
              ? "border-[#1d4ed8] text-[#1d4ed8]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <UsersIcon className="w-4 h-4" />
          Users
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`pb-3 text-sm font-medium tracking-wide border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "permissions"
              ? "border-[#1d4ed8] text-[#1d4ed8]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 text-sm font-medium tracking-wide border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "logs"
              ? "border-[#1d4ed8] text-[#1d4ed8]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <History className="w-4 h-4" />
          Activity Log
        </button>
      </div>

      {/* ── TAB CONTENT: USERS ── */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-slate-900">System Users</h2>
              <p className="text-xs text-slate-500">Manage user accounts, statuses, and branch assignments.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl text-sm"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
              <span className="text-slate-400 text-sm">Loading users...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70 border-b border-slate-100">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-12">User</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-12">Role & Branch</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-12">Last Login</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-12">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-400 text-sm">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-slate-50/40 border-b border-slate-100/80">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm text-white font-bold text-sm uppercase">
                            {user.avatar || user.username?.slice(0, 2)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 capitalize">{user.username}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                            <Shield className="w-3.5 h-3.5 text-[#1d4ed8]" />
                            {user.role}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Building className="w-3.5 h-3.5" />
                            {user.branch || "All Branches"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.status === "Active"}
                            disabled={currentUser?.role !== "Super Admin" || user._id === currentUser?.id}
                            onCheckedChange={() => handleToggleStatus(user)}
                          />
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              user.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-slate-50 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {currentUser?.role === "Super Admin" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full">
                                <MoreVertical className="h-4 w-4 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl border border-slate-100 shadow-lg">
                              <DropdownMenuItem
                                onClick={() => handleOpenEditUser(user)}
                                className="gap-2 text-slate-700 cursor-pointer py-2 rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setResetUserId(user._id);
                                  setNewPassword("");
                                  setResetError("");
                                  setResetDialogOpen(true);
                                }}
                                className="gap-2 text-slate-700 cursor-pointer py-2 rounded-lg"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="border-slate-100" />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user)}
                                disabled={user._id === currentUser?.id}
                                className="gap-2 text-red-600 focus:text-red-700 cursor-pointer py-2 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-slate-400">Read-only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: ROLES & PERMISSIONS ── */}
      {activeTab === "permissions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Defined Roles */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Defined Roles</h3>
              <p className="text-xs text-slate-500 mt-1">Select a role to configure specific access rights.</p>
            </div>
            <div className="space-y-2">
              {ROLES.map((role) => (
                <button
                  key={role.name}
                  onClick={() => setSelectedRole(role.name)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedRole === role.name
                      ? "border-[#1d4ed8] bg-blue-50/30 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900">{role.name}</span>
                    {role.name === "Super Admin" && (
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Full Access
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{role.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel: Permissions Grid */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[500px]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
                    Permissions: {selectedRole}
                    {selectedRole === "Super Admin" && (
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                        Implicit Access
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Configure what this role can see and do in the system.</p>
                </div>
                {selectedRole !== "Super Admin" && currentUser?.role === "Super Admin" && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="selectAllGlobal"
                        checked={isAllGlobalSelected}
                        onCheckedChange={(val) => handleSelectAllGlobal(!!val)}
                      />
                      <label htmlFor="selectAllGlobal" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                        Select All
                      </label>
                    </div>
                    <Button
                      onClick={handleSavePermissions}
                      disabled={savingPermissions}
                      className="bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-xl shadow-sm px-4 py-2"
                    >
                      {savingPermissions ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>

              {selectedRole === "Super Admin" && (
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800">
                  <AlertCircle className="w-5 h-5 text-[#1d4ed8] shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">
                    Super Admin roles have implicit full access to all system modules and settings. Custom rules cannot be changed.
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase h-10 pl-0">Module</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase h-10 text-center">View</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase h-10 text-center">Create</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase h-10 text-center">Edit</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase h-10 text-center">Delete</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 uppercase h-10 text-center">Select All</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MODULES.map((mod) => {
                      const perm = rolePermissions[selectedRole]?.find((m) => m.module === mod) || {
                        module: mod,
                        view: false,
                        create: false,
                        edit: false,
                        delete: false,
                      };
                      return (
                        <TableRow key={mod} className="border-b border-slate-50 hover:bg-transparent">
                          <TableCell className="font-medium text-sm text-slate-800 py-3.5 pl-0">{mod}</TableCell>
                          <TableCell className="text-center py-3.5">
                            <Checkbox
                              checked={selectedRole === "Super Admin" || perm.view}
                              disabled={selectedRole === "Super Admin" || currentUser?.role !== "Super Admin"}
                              onCheckedChange={(val) => handlePermissionChange(mod, "view", !!val)}
                            />
                          </TableCell>
                          <TableCell className="text-center py-3.5">
                            <Checkbox
                              checked={selectedRole === "Super Admin" || perm.create}
                              disabled={selectedRole === "Super Admin" || currentUser?.role !== "Super Admin"}
                              onCheckedChange={(val) => handlePermissionChange(mod, "create", !!val)}
                            />
                          </TableCell>
                          <TableCell className="text-center py-3.5">
                            <Checkbox
                              checked={selectedRole === "Super Admin" || perm.edit}
                              disabled={selectedRole === "Super Admin" || currentUser?.role !== "Super Admin"}
                              onCheckedChange={(val) => handlePermissionChange(mod, "edit", !!val)}
                            />
                          </TableCell>
                          <TableCell className="text-center py-3.5">
                            <Checkbox
                              checked={selectedRole === "Super Admin" || perm.delete}
                              disabled={selectedRole === "Super Admin" || currentUser?.role !== "Super Admin"}
                              onCheckedChange={(val) => handlePermissionChange(mod, "delete", !!val)}
                            />
                          </TableCell>
                          <TableCell className="text-center py-3.5 border-l border-slate-50">
                            <Checkbox
                              checked={selectedRole === "Super Admin" || isRowSelected(mod)}
                              disabled={selectedRole === "Super Admin" || currentUser?.role !== "Super Admin"}
                              onCheckedChange={(val) => handleSelectAllForRow(mod, !!val)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: ACTIVITY LOG ── */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-slate-900">System Activity Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">Audit trail of user actions, logins, and system events.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Action Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Type</label>
                <select
                  value={logActionFilter}
                  onChange={(e) => setLogActionFilter(e.target.value)}
                  className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                >
                  <option value="all">All Actions</option>
                  <option value="login">User Login Only</option>
                </select>
              </div>

              {/* Date Option Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Filter</label>
                <select
                  value={logDateFilter}
                  onChange={(e) => setLogDateFilter(e.target.value)}
                  className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="custom">Day-Based (Custom)</option>
                </select>
              </div>

              {/* Custom Date Input */}
              {logDateFilter === "custom" && (
                <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Date</label>
                  <input
                    type="date"
                    value={logCustomDate}
                    onChange={(e) => setLogCustomDate(e.target.value)}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                  />
                </div>
              )}
            </div>
          </div>

          {loadingLogs ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#1d4ed8] animate-spin" />
              <span className="text-slate-400 text-sm">Loading activity logs...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70 border-b border-slate-100">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-12">Timestamp</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-12">User</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-12">Action</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider h-12">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredLogs().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-slate-400 text-sm">
                      No matching activity logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  getFilteredLogs().map((log) => (
                    <TableRow key={log._id} className="hover:bg-slate-50/40 border-b border-slate-100/80">
                      <TableCell className="text-sm text-slate-600 py-3.5">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-900 capitalize">{log.userName}</TableCell>
                      <TableCell className="py-3.5">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            log.status === "Success"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {log.status === "Success" ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Success
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Failed
                            </>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* ── DIALOG: ADD/EDIT USER ── */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-slate-100 p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {isEditing ? "Edit User Profile" : "Create New User"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              {isEditing
                ? "Modify user role, email, and branch assignments."
                : "Fill in the user credentials to create a new secure access account."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <Input
                required
                id="user-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. Priyasharma"
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <Input
                required
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="priya@tyreflow.com"
                className="h-10 rounded-xl"
              />
            </div>

            {!isEditing && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <Input
                  required
                  id="user-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="h-10 rounded-xl"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                id="user-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              >
                {ROLES.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Branch Assign
              </label>
              <Input
                required
                id="user-branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="e.g. Mumbai Hub"
                className="h-10 rounded-xl"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-100 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium">{formError}</span>
              </div>
            )}

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setUserDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-xl">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? "Save Changes" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: PASSWORD RESET ── */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-slate-100 p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Reset Account Password</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              Enter a secure, robust password for this account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <Input
                required
                id="reset-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="h-10 rounded-xl"
              />
            </div>

            {resetError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-100 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium">{resetError}</span>
              </div>
            )}

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="bg-[#1d4ed8] hover:bg-blue-800 text-white rounded-xl">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
