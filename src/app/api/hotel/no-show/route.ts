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
    const { couponId } = body;

    if (!couponId) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.findUnique({
      where: { id: couponId },
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
        { error: "Only confirmed bookings can be marked as no-show" },
        { status: 400 }
      );
    }

    // Update coupon status to NO_SHOW
    const updatedCoupon = await db.coupon.update({
      where: { id: couponId },
      data: {
        status: "NO_SHOW",
        redeemedAt: new Date(),
      },
    });

    // Still deduct credit from subscription
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
        message: `You have been marked as no-show for coupon ${coupon.code}. One credit has been deducted.`,
        status: "PENDING",
      },
    });

    // Create commission record for no-show too
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
    console.error("No-show error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
