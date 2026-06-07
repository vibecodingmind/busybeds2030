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

    const body = await request.json();
    const { hotelId, roomTypeId } = body;

    if (!hotelId) {
      return NextResponse.json(
        { error: "Hotel ID is required" },
        { status: 400 }
      );
    }

    // Check user has active subscription with remaining credits
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        creditsRemaining: { gt: 0 },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription with remaining credits" },
        { status: 400 }
      );
    }

    // Find an available coupon
    const coupon = await db.coupon.findFirst({
      where: {
        userId: session.user.id,
        subscriptionId: subscription.id,
        status: "AVAILABLE",
        hotelId: null,
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "No available coupons. Purchase more credits." },
        { status: 400 }
      );
    }

    // Verify hotel exists
    const hotel = await db.hotel.findUnique({
      where: { id: hotelId, isActive: true },
    });

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Get discount info from room type if provided
    let discountPercent = null;
    let discountAmount = null;

    if (roomTypeId) {
      const roomType = await db.roomType.findUnique({
        where: { id: roomTypeId, hotelId },
      });
      if (roomType) {
        discountPercent = roomType.discountPercent;
        discountAmount = roomType.rackRate - roomType.discountRate;
      }
    }

    // Assign coupon to hotel inquiry
    const updatedCoupon = await db.coupon.update({
      where: { id: coupon.id },
      data: {
        hotelId,
        roomTypeId: roomTypeId || null,
        discountPercent,
        discountAmount,
      },
      include: {
        hotel: { select: { name: true, city: true } },
        roomType: { select: { name: true, rackRate: true, discountRate: true } },
      },
    });

    return NextResponse.json({ coupon: updatedCoupon });
  } catch (error) {
    console.error("Coupon use error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
