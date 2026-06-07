"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, formatCurrency, formatDateTime } from "@/components/shared";
import {
  Users,
  CreditCard,
  Ticket,
  DollarSign,
  AlertTriangle,
  UserX,
  Building2,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DashboardData {
  stats: {
    totalUsers: number;
    totalGuests: number;
    totalHotelStaff: number;
    activeSubscriptions: number;
    totalHotels: number;
    totalRevenue: number;
    pendingCommission: number;
    collectedCommission: number;
  };
  subscriptionsByPackage: { package: string; count: number }[];
  couponsByStatus: { status: string; count: number }[];
  recentActivity: {
    id: string;
    code: string;
    status: string;
    updatedAt: string;
    user: { name: string } | null;
    hotel: { name: string } | null;
  }[];
}

const statusLabels: Record<string, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  CONFIRMED: "Confirmed",
  REDEEMED: "Redeemed",
  EXPIRED: "Expired",
  NO_SHOW: "No-Show",
  CANCELLED: "Cancelled",
};

export default function AdminOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const { stats, couponsByStatus, recentActivity } = data;

  // Count coupons by specific statuses
  const reservedCount = couponsByStatus.find((c) => c.status === "RESERVED")?.count || 0;
  const confirmedCount = couponsByStatus.find((c) => c.status === "CONFIRMED")?.count || 0;
  const redeemedCount = couponsByStatus.find((c) => c.status === "REDEEMED")?.count || 0;
  const expiredCount = couponsByStatus.find((c) => c.status === "EXPIRED")?.count || 0;
  const noShowCount = couponsByStatus.find((c) => c.status === "NO_SHOW")?.count || 0;

  // Chart data for coupons by status
  const couponChartData = couponsByStatus.map((c) => ({
    name: statusLabels[c.status] || c.status,
    count: c.count,
  }));

  // Mock revenue trend data
  const revenueData = [
    { month: "Jan", revenue: 1200000 },
    { month: "Feb", revenue: 1800000 },
    { month: "Mar", revenue: 2200000 },
    { month: "Apr", revenue: 1900000 },
    { month: "May", revenue: 2800000 },
    { month: "Jun", revenue: stats.totalRevenue || 3200000 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628]">
          Admin Dashboard
        </h2>
        <p className="text-base text-gray-500 mt-1">
          Platform overview and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              Active Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0A1628]">
              {stats.activeSubscriptions}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-orange-500" />
              Reserved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{reservedCount}</p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-green-500" />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#C9A84C]" />
              Redeemed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#C9A84C]">{redeemedCount}</p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Expired Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <UserX className="w-3.5 h-3.5 text-red-700" />
              No-Shows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-800">{noShowCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card rounded-2xl border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Total Users</p>
                <p className="text-xl font-bold text-[#0A1628]">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl border-l-4 border-l-[#C9A84C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#C9A84C]" />
              <div>
                <p className="text-xs text-gray-500">Active Hotels</p>
                <p className="text-xl font-bold text-[#0A1628]">{stats.totalHotels}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-[#0A1628]">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Pending Commission</p>
                <p className="text-xl font-bold text-[#0A1628]">
                  {formatCurrency(stats.pendingCommission)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0A1628]">
              Coupons by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {couponChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={couponChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0A1628" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No coupon data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0A1628]">
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    `${(value / 1000000).toFixed(1)}M`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C9A84C"
                  strokeWidth={3}
                  dot={{ fill: "#C9A84C", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      {data.subscriptionsByPackage.length > 0 && (
        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0A1628]">
              Subscriptions by Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 flex-wrap">
              {data.subscriptionsByPackage.map((pkg) => (
                <div key={pkg.package} className="glass-white rounded-lg p-4 text-center min-w-[100px]">
                  <p className="text-3xl font-bold text-[#0A1628]">{pkg.count}</p>
                  <p className="text-sm text-gray-500">{pkg.package}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0A1628]">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="glass-white flex items-center justify-between rounded-lg py-2 px-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={activity.status} />
                    <div>
                      <p className="text-sm font-medium text-[#0A1628]">
                        <span className="font-mono">{activity.code}</span>
                        {activity.user?.name && ` — ${activity.user.name}`}
                      </p>
                      {activity.hotel?.name && (
                        <p className="text-xs text-gray-500">
                          {activity.hotel.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDateTime(activity.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
