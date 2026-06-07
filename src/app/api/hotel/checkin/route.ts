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
      include: { subscription: true },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    // Verify the coupon belongs to this hotel
    const hotelId = (session.user as { hotelId: string | null }).hotelId;
    if (userRole === "HOTEL_STAFF" && coupon.hotelId !== hotelId) {
      return NextResponse.json(
        { error: "This coupon does not belong to your hotel" },
        { status: 403 }
      );
    }

    if (coupon.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only confirmed bookings can be checked in" },
        { status: 400 }
      );
    }

    // Update coupon status
    const updatedCoupon = await db.coupon.update({
      where: { id: coupon.id },
      data: {
        status: "REDEEMED",
        redeemedAt: new Date(),
      },
    });

    // Deduct credit from subscription
    await db.subscription.update({
      where: { id: coupon.subscriptionId },
      data: {
        creditsUsed: { increment: 1 },
        creditsRemaining: { decrement: 1 },
      },
    });

    // Create notification for guest
    await db.notification.create({
      data: {
        userId: coupon.userId,
        channel: "IN_APP",
        message: `Welcome! You have been checked in successfully. Coupon ${coupon.code} has been redeemed.`,
        status: "PENDING",
      },
    });

    // Create commission record
    const hotelForCommission = await db.hotel.findUnique({
      where: { id: coupon.hotelId! },
    });

    if (hotelForCommission && coupon.discountAmount) {
      const commissionAmount =
        coupon.discountAmount * (hotelForCommission.commissionPercent / 100);

      await db.commissionRecord.create({
        data: {
          hotelId: coupon.hotelId!,
          couponId: coupon.id,
          amount: commissionAmount,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({ coupon: updatedCoupon });
  } catch (error) {
    console.error("Checkin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
