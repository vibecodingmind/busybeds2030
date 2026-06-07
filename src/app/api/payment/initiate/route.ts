import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitOrder, PACKAGE_PRICES, PACKAGE_CREDITS } from "@/lib/pesapal";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { packageName, phoneNumber } = body;

    if (!packageName || !PACKAGE_PRICES[packageName]) {
      return NextResponse.json(
        { error: "Invalid package. Choose STARTER, STANDARD, or PREMIUM" },
        { status: 400 }
      );
    }

    if (!phoneNumber || phoneNumber.length < 9) {
      return NextResponse.json(
        { error: "A valid phone number is required for payment" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const existingSub = await db.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
    });

    if (existingSub) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 409 }
      );
    }

    const amount = PACKAGE_PRICES[packageName];
    const merchantReference = `BB-${packageName}-${uuidv4()}`;

    // Create a PaymentOrder record to track this payment
    const paymentOrder = await db.paymentOrder.create({
      data: {
        userId: session.user.id,
        packageName,
        amount,
        merchantRef: merchantReference,
        status: "PENDING",
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3008";
    const callbackUrl = `${baseUrl}/api/payment/ipn`;

    try {
      const orderResponse = await submitOrder({
        amount,
        currency: "TZS",
        description: `BusyBeds ${packageName} Subscription - ${PACKAGE_CREDITS[packageName]} coupons/month`,
        merchantReference,
        phoneNumber,
        email: session.user.email || "",
        firstName: session.user.name || "Customer",
        lastName: "",
        callbackUrl,
      });

      // Update the PaymentOrder with the PesaPal tracking ID
      await db.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: { orderTrackingId: orderResponse.order_tracking_id },
      });

      return NextResponse.json({
        orderTrackingId: orderResponse.order_tracking_id,
        merchantReference,
        redirectUrl: orderResponse.redirect_url,
        amount,
        packageName,
      });
    } catch (pesapalError) {
      // If PesaPal is not configured (sandbox/credentials missing),
      // fall back to simulated payment for development
      console.warn("PesaPal submission failed, using simulated payment:", pesapalError);

      return NextResponse.json({
        orderTrackingId: `SIM-${paymentOrder.id}`,
        merchantReference,
        redirectUrl: null,
        simulated: true,
        amount,
        packageName,
        message: "Payment is in simulation mode. PesaPal is not configured.",
      });
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
