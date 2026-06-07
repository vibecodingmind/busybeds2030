import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();

    // Find all RESERVED coupons where paymentDeadline has passed
    const expiredCoupons = await db.coupon.findMany({
      where: {
        status: "RESERVED",
        paymentDeadline: { lt: now },
      },
    });

    let expiredCount = 0;

    for (const coupon of expiredCoupons) {
      // Update coupon status to EXPIRED
      await db.coupon.update({
        where: { id: coupon.id },
        data: {
          status: "EXPIRED",
          cancelReason: "Payment deadline expired",
        },
      });

      // Create notification for guest
      await db.notification.create({
        data: {
          userId: coupon.userId,
          channel: "IN_APP",
          message: `Your booking with coupon ${coupon.code} has expired due to missed payment deadline.`,
          status: "PENDING",
        },
      });

      expiredCount++;
    }

    return NextResponse.json({
      message: `${expiredCount} expired coupons processed`,
      expiredCount,
    });
  } catch (error) {
    console.error("Expire coupons error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
