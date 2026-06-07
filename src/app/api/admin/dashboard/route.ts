import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Total users
    const totalUsers = await db.user.count();
    const totalGuests = await db.user.count({ where: { role: "GUEST" } });
    const totalHotelStaff = await db.user.count({
      where: { role: "HOTEL_STAFF" },
    });

    // Active subscriptions
    const activeSubscriptions = await db.subscription.count({
      where: { status: "ACTIVE" },
    });

    const subscriptionsByPackage = await db.subscription.groupBy({
      by: ["package"],
      where: { status: "ACTIVE" },
      _count: true,
    });

    // Coupons by status
    const couponsByStatus = await db.coupon.groupBy({
      by: ["status"],
      _count: true,
    });

    // Total hotels
    const totalHotels = await db.hotel.count({ where: { isActive: true } });

    // Revenue calculation (from confirmed/redeemed coupons)
    const redeemedCoupons = await db.coupon.findMany({
      where: { status: { in: ["REDEEMED", "CONFIRMED"] } },
      include: { roomType: true },
    });

    const totalRevenue = redeemedCoupons.reduce((sum, coupon) => {
      return sum + (coupon.discountAmount || 0);
    }, 0);

    // Commission stats
    const totalCommission = await db.commissionRecord.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" },
    });

    const collectedCommission = await db.commissionRecord.aggregate({
      _sum: { amount: true },
      where: { status: "COLLECTED" },
    });

    // Recent activity
    const recentCoupons = await db.coupon.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true } },
        hotel: { select: { name: true } },
      },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalGuests,
        totalHotelStaff,
        activeSubscriptions,
        totalHotels,
        totalRevenue,
        pendingCommission: totalCommission._sum.amount || 0,
        collectedCommission: collectedCommission._sum.amount || 0,
      },
      subscriptionsByPackage: subscriptionsByPackage.map((s) => ({
        package: s.package,
        count: s._count,
      })),
      couponsByStatus: couponsByStatus.map((c) => ({
        status: c.status,
        count: c._count,
      })),
      recentActivity: recentCoupons,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
