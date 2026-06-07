import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { hotelId, roomTypeId, checkInDate, checkOutDate } = body;

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

    // Calculate payment deadline based on check-in date
    let paymentDeadline = null;
    if (checkInDate) {
      const checkIn = new Date(checkInDate);
      const now = new Date();
      const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilCheckIn <= 24) {
        // Same day or next day: 1 hour
        paymentDeadline = new Date(now.getTime() + 60 * 60 * 1000);
      } else if (hoursUntilCheckIn <= 72) {
        // 2-3 days: 2 hours
        paymentDeadline = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      } else if (hoursUntilCheckIn <= 168) {
        // 4-7 days: 6 hours
        paymentDeadline = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      } else {
        // 7+ days: 24 hours
        paymentDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    // Generate QR code data URL
    const qrData = JSON.stringify({
      code: coupon.code,
      hotel: hotel.name,
      guest: session.user.name,
      discount: discountPercent ? `${discountPercent}%` : "Negotiated",
    });
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Assign coupon to hotel inquiry
    const updatedCoupon = await db.coupon.update({
      where: { id: coupon.id },
      data: {
        hotelId,
        roomTypeId: roomTypeId || null,
        checkInDate: checkInDate ? new Date(checkInDate) : null,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        discountPercent,
        discountAmount,
        paymentDeadline,
        qrCodeUrl,
        reservedAt: new Date(),
        status: "RESERVED",
        guestName: session.user.name,
      },
      include: {
        hotel: { select: { name: true, city: true } },
        roomType: { select: { name: true, rackRate: true, discountRate: true } },
      },
    });

    // Decrement subscription credits
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        creditsUsed: { increment: 1 },
        creditsRemaining: { decrement: 1 },
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

