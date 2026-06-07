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
    if (userRole !== "HOTEL_STAFF" && userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Hotel staff access required" },
        { status: 403 }
      );
    }

    const hotelId = (session.user as { hotelId: string | null }).hotelId;

    if (!hotelId) {
      return NextResponse.json(
        { error: "No hotel assigned to your account" },
        { status: 400 }
      );
    }

    const coupons = await db.coupon.findMany({
      where: { hotelId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        roomType: { select: { name: true, rackRate: true, discountRate: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings: coupons });
  } catch (error) {
    console.error("Bookings list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
