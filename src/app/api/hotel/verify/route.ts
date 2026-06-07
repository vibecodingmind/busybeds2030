import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.findUnique({
      where: { code },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        hotel: { select: { name: true, city: true } },
        roomType: { select: { name: true, rackRate: true, discountRate: true } },
        subscription: { select: { package: true } },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    // Check if coupon belongs to this hotel (for hotel staff)
    if (userRole === "HOTEL_STAFF") {
      const hotelId = (session.user as { hotelId: string | null }).hotelId;
      if (coupon.hotelId && coupon.hotelId !== hotelId) {
        return NextResponse.json(
          { error: "This coupon does not belong to your hotel" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("Verify coupon error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
