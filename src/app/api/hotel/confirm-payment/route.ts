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

    if (coupon.status !== "RESERVED") {
      return NextResponse.json(
        { error: "Only reserved coupons can be confirmed" },
        { status: 400 }
      );
    }

    const updatedCoupon = await db.coupon.update({
      where: { id: coupon.id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });

    // Send booking confirmation notification (in-app + SMS)
    try {
      const { notifyBookingConfirmation } = await import("@/lib/notifications");
      const hotel = coupon.hotelId
        ? await db.hotel.findUnique({ where: { id: coupon.hotelId }, select: { name: true } })
        : null;
      await notifyBookingConfirmation(
        coupon.userId,
        coupon.code,
        hotel?.name || "your hotel",
        coupon.checkInDate
          ? new Date(coupon.checkInDate).toLocaleDateString()
          : "TBD"
      );
    } catch (notifError) {
      console.error("Failed to send booking confirmation notification:", notifError);
      // Non-blocking - confirmation is still successful
    }

    return NextResponse.json({ coupon: updatedCoupon });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
