import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function calculatePaymentDeadline(checkInDate: Date): Date {
  const now = new Date();
  const hoursUntilCheckIn =
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  let deadlineHours: number;
  if (hoursUntilCheckIn <= 24) {
    deadlineHours = 1;
  } else if (hoursUntilCheckIn <= 72) {
    deadlineHours = 2;
  } else if (hoursUntilCheckIn <= 168) {
    deadlineHours = 6;
  } else {
    deadlineHours = 24;
  }

  const deadline = new Date(now);
  deadline.setHours(deadline.getHours() + deadlineHours);
  return deadline;
}

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
    const { code, checkInDate, checkOutDate, roomTypeId, guestName } = body;

    if (!code || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "Code, check-in date, and check-out date are required" },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.findUnique({
      where: { code },
      include: {
        subscription: true,
      },
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

    if (coupon.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: `Coupon is already ${coupon.status}` },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const paymentDeadline = calculatePaymentDeadline(checkIn);

    const updatedCoupon = await db.coupon.update({
      where: { id: coupon.id },
      data: {
        status: "RESERVED",
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomTypeId: roomTypeId || coupon.roomTypeId,
        guestName: guestName || null,
        reservedAt: new Date(),
        paymentDeadline,
      },
    });

    // Create notification for guest (in-app + SMS)
    try {
      const { notifyUser } = await import("@/lib/notifications");
      const guestUser = await db.user.findUnique({
        where: { id: coupon.userId },
        select: { phone: true },
      });
      const notificationMessage = `Your coupon ${code} has been reserved! Check-in: ${checkIn.toLocaleDateString()}. Please complete payment before ${paymentDeadline.toLocaleString()}.`;
      await notifyUser(coupon.userId, "IN_APP", notificationMessage);
      if (guestUser?.phone) {
        await notifyUser(coupon.userId, "SMS", notificationMessage, guestUser.phone);
      }
    } catch (notifError) {
      console.error("Failed to send reservation notification:", notifError);
      // Non-blocking - reservation is still successful
    }

    return NextResponse.json({
      coupon: updatedCoupon,
      paymentDeadline,
    });
  } catch (error) {
    console.error("Reserve coupon error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
