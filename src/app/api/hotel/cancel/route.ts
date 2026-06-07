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

    const body = await request.json();
    const { couponId, cancelReason } = body;

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

    // Verify ownership or hotel access
    const isOwner = coupon.userId === session.user.id;
    const isHotelStaff =
      (userRole === "HOTEL_STAFF" || userRole === "ADMIN") &&
      coupon.hotelId ===
        (session.user as { hotelId: string | null }).hotelId;
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isHotelStaff && !isAdmin) {
      return NextResponse.json(
        { error: "Not authorized to cancel this coupon" },
        { status: 403 }
      );
    }

    if (
      coupon.status !== "AVAILABLE" &&
      coupon.status !== "RESERVED" &&
      coupon.status !== "CONFIRMED"
    ) {
      return NextResponse.json(
        { error: `Cannot cancel a coupon with status ${coupon.status}` },
        { status: 400 }
      );
    }

    // Determine if credit should be returned
    let returnCredit = false;
    let bonusCredit = false;

    if (coupon.checkInDate) {
      const hoursUntilCheckIn =
        (new Date(coupon.checkInDate).getTime() - Date.now()) /
        (1000 * 60 * 60);

      if (hoursUntilCheckIn >= 48) {
        returnCredit = true;
      }
    } else {
      // No check-in date set (AVAILABLE status) - return credit
      returnCredit = true;
    }

    // If hotel cancels, add bonus credit
    if (isHotelStaff) {
      bonusCredit = true;
    }

    // Update coupon
    const updatedCoupon = await db.coupon.update({
      where: { id: couponId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: cancelReason || null,
      },
    });

    // Handle credit return
    if (returnCredit || bonusCredit) {
      const creditAdjust = (returnCredit ? 1 : 0) + (bonusCredit ? 1 : 0);
      await db.subscription.update({
        where: { id: coupon.subscriptionId },
        data: {
          creditsRemaining: { increment: creditAdjust },
        },
      });
    }

    // Create notification
    const message = bonusCredit
      ? `Your booking with coupon ${coupon.code} has been cancelled by the hotel. You have received a bonus credit.`
      : returnCredit
        ? `Your booking with coupon ${coupon.code} has been cancelled. Your credit has been returned.`
        : `Your booking with coupon ${coupon.code} has been cancelled within 48 hours of check-in. No credit will be returned.`;

    await db.notification.create({
      data: {
        userId: coupon.userId,
        channel: "IN_APP",
        message,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      coupon: updatedCoupon,
      creditReturned: returnCredit,
      bonusCredit,
    });
  } catch (error) {
    console.error("Cancel coupon error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
