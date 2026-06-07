import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus, registerIPN, PACKAGE_CREDITS, PACKAGE_PRICES } from "@/lib/pesapal";
import { db } from "@/lib/db";

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BB-2026-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * GET /api/payment/ipn
 * Register the IPN URL with PesaPal and return the ipn_id
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3008";
    const ipnUrl = `${baseUrl}/api/payment/ipn`;

    const result = await registerIPN(ipnUrl);

    return NextResponse.json({
      ipn_id: result.ipn_id,
      url: result.url,
      created_date: result.created_date,
    });
  } catch (error) {
    console.error("IPN registration error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/payment/ipn
 * Handle IPN callback from PesaPal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      OrderTrackingId,
      OrderMerchantReference,
      Status,
    } = body;

    console.log("PesaPal IPN received:", { OrderTrackingId, OrderMerchantReference, Status });

    if (!OrderTrackingId && !OrderMerchantReference) {
      return NextResponse.json({ error: "Missing order identifiers" }, { status: 400 });
    }

    // Find the PaymentOrder by merchantRef or orderTrackingId
    let paymentOrder = await db.paymentOrder.findFirst({
      where: OrderMerchantReference
        ? { merchantRef: OrderMerchantReference }
        : { orderTrackingId: OrderTrackingId },
      include: { user: true },
    });

    if (!paymentOrder) {
      console.error("PaymentOrder not found for:", { OrderTrackingId, OrderMerchantReference });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already processed
    if (paymentOrder.status === "COMPLETED") {
      return NextResponse.json({ status: "already_processed" });
    }

    // Verify the payment by calling PesaPal's GetTransactionStatus API
    let paymentStatus = Status;
    let confirmationCode = "";

    if (OrderTrackingId && !OrderTrackingId.startsWith("SIM-")) {
      try {
        const transactionStatus = await getTransactionStatus(OrderTrackingId);
        paymentStatus = transactionStatus.payment_status;
        confirmationCode = transactionStatus.confirmation_code || "";
      } catch (err) {
        console.error("Failed to verify transaction status:", err);
        // Continue with the IPN status as fallback
      }
    }

    if (paymentStatus === "COMPLETED") {
      const { userId, packageName } = paymentOrder;
      const creditsTotal = PACKAGE_CREDITS[packageName];

      if (!creditsTotal) {
        console.error("Invalid package:", packageName);
        return NextResponse.json({ error: "Invalid package" }, { status: 400 });
      }

      // Check if subscription already exists for this user
      const existingSub = await db.subscription.findFirst({
        where: { userId, status: "ACTIVE" },
      });

      if (existingSub) {
        // Update payment order status but don't create duplicate subscription
        await db.paymentOrder.update({
          where: { id: paymentOrder.id },
          data: { status: "COMPLETED", paymentRef: confirmationCode || OrderTrackingId },
        });
        return NextResponse.json({ status: "already_has_subscription" });
      }

      const now = new Date();
      const renewalDate = new Date(now);
      renewalDate.setDate(renewalDate.getDate() + 30);

      // Create subscription
      const subscription = await db.subscription.create({
        data: {
          userId,
          package: packageName,
          creditsTotal,
          creditsUsed: 0,
          creditsRemaining: creditsTotal,
          startDate: now,
          renewalDate,
          status: "ACTIVE",
          paymentRef: confirmationCode || OrderTrackingId,
        },
      });

      // Generate coupons
      const couponData: Array<{ subscriptionId: string; userId: string; code: string; status: string }> = [];
      for (let i = 0; i < creditsTotal; i++) {
        let code = generateCouponCode();
        const existing = await db.coupon.findUnique({ where: { code } });
        while (existing) {
          code = generateCouponCode();
          const check = await db.coupon.findUnique({ where: { code } });
          if (!check) break;
        }
        couponData.push({
          subscriptionId: subscription.id,
          userId,
          code,
          status: "AVAILABLE",
        });
      }

      if (couponData.length > 0) {
        await db.coupon.createMany({ data: couponData });
      }

      // Update payment order status
      await db.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: { status: "COMPLETED", paymentRef: confirmationCode || OrderTrackingId },
      });

      // Send notification
      try {
        const { notifyPaymentConfirmation } = await import("@/lib/notifications");
        await notifyPaymentConfirmation(userId, packageName, PACKAGE_PRICES[packageName] || 0);
      } catch (smsErr) {
        console.error("Failed to send payment confirmation:", smsErr);
      }

      console.log(`Subscription created for user ${userId}, package ${packageName}, ${creditsTotal} coupons`);
      return NextResponse.json({ status: "COMPLETED", subscriptionId: subscription.id });

    } else if (paymentStatus === "FAILED") {
      await db.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: { status: "FAILED" },
      });

      // Notify user of failed payment
      try {
        const { notifyUser } = await import("@/lib/notifications");
        await notifyUser(paymentOrder.userId, "IN_APP", "Your payment has failed. Please try again.");
      } catch {}

      return NextResponse.json({ status: "FAILED" });

    } else {
      // PENDING or other status
      return NextResponse.json({ status: paymentStatus });
    }
  } catch (error) {
    console.error("IPN handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
