"use client";

import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  RESERVED: {
    label: "Reserved",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  REDEEMED: {
    label: "Redeemed",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  NO_SHOW: {
    label: "No-Show",
    className: "bg-red-200 text-red-900 hover:bg-red-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-800 hover:bg-slate-100",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return (
    <Badge className={config.className} variant="secondary">
      {config.label}
    </Badge>
  );
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "TZS 0";
  return `TZS ${amount.toLocaleString("en-TZ")}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
