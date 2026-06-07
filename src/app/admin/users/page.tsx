"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search, Users, Eye } from "lucide-react";

interface SubscriptionData {
  id: string;
  package: string;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  status: string;
  startDate: string;
  renewalDate: string;
}

interface HotelStaffData {
  id: string;
  hotel: { name: string };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  subscription: SubscriptionData | null;
  hotelStaff: HotelStaffData | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !search ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "ACTIVE" && user.subscription?.status === "ACTIVE") ||
      (statusFilter === "EXPIRED" && user.subscription?.status === "EXPIRED") ||
      (statusFilter === "NONE" && !user.subscription) ||
      (statusFilter === "SUSPENDED" && !user.isActive);

    return matchesSearch && matchesStatus;
  });

  function getRoleBadge(role: string) {
    const config: Record<string, { label: string; className: string }> = {
      GUEST: {
        label: "Guest",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100 backdrop-blur-sm",
      },
      HOTEL_STAFF: {
        label: "Hotel Staff",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-100 backdrop-blur-sm",
      },
      ADMIN: {
        label: "Admin",
        className: "bg-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C]/20 backdrop-blur-sm",
      },
    };
    const c = config[role] || { label: role, className: "" };
    return (
      <Badge className={c.className} variant="secondary">
        {c.label}
      </Badge>
    );
  }

  function getSubscriptionBadge(sub: SubscriptionData | null) {
    if (!sub)
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-100 backdrop-blur-sm">
          No Plan
        </Badge>
      );
    const className =
      sub.status === "ACTIVE"
        ? "bg-green-100 text-green-800 hover:bg-green-100 backdrop-blur-sm"
        : "bg-red-100 text-red-800 hover:bg-red-100 backdrop-blur-sm";
    return (
      <Badge className={className} variant="secondary">
        {sub.package} ({sub.status})
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628]">
          Users Management
        </h2>
        <p className="text-base text-gray-500 mt-1">{users.length} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="glass-white pl-10 focus:border-[#C9A84C]/50 focus:bg-white/10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="glass-pill w-full sm:w-48 focus:border-[#C9A84C]/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active Subscription</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="NONE">No Plan</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="glass-card rounded-2xl">
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead className="hidden md:table-cell">Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-white/5">
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#0A1628]">{user.name}</p>
                          {user.hotelStaff && (
                            <p className="text-xs text-gray-500">
                              {user.hotelStaff.hotel.name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {user.phone || "—"}
                      </TableCell>
                      <TableCell>{getSubscriptionBadge(user.subscription)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {user.subscription
                          ? `${user.subscription.creditsRemaining}/${user.subscription.creditsTotal}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getRoleBadge(user.role)}
                          {!user.isActive && (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800 hover:bg-red-100 text-xs backdrop-blur-sm"
                            >
                              Suspended
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="glass-card-dark max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              User Details
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-white/60">Name</Label>
                  <p className="font-medium text-white">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-white/60">Email</Label>
                  <p className="font-medium text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-white/60">Phone</Label>
                  <p className="font-medium text-white">
                    {selectedUser.phone || "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-white/60">Role</Label>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
              </div>

              {selectedUser.hotelStaff && (
                <div>
                  <Label className="text-xs text-white/60">Assigned Hotel</Label>
                  <p className="font-medium text-white">
                    {selectedUser.hotelStaff.hotel.name}
                  </p>
                </div>
              )}

              {selectedUser.subscription && (
                <div className="glass-white rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-[#0A1628]">Subscription</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Package:</span>{" "}
                      <span className="font-medium">
                        {selectedUser.subscription.package}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>{" "}
                      <span className="font-medium">
                        {selectedUser.subscription.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Credits Used:</span>{" "}
                      <span className="font-medium">
                        {selectedUser.subscription.creditsUsed}/
                        {selectedUser.subscription.creditsTotal}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Remaining:</span>{" "}
                      <span className="font-medium">
                        {selectedUser.subscription.creditsRemaining}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!selectedUser.isActive && (
                <div className="glass-red rounded-lg p-3">
                  <p className="text-sm font-medium text-red-700">
                    This account is suspended
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {!selectedUser.isActive ? (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      toast.success("Account reactivated (demo)");
                      setDetailsOpen(false);
                    }}
                  >
                    Reactivate Account
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      toast.success("Account suspended (demo)");
                      setDetailsOpen(false);
                    }}
                  >
                    Suspend Account
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
