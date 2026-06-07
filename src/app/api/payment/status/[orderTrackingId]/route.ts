import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/pesapal";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderTrackingId: string }> }
) {
  try {
    const { orderTrackingId } = await params;

    if (!orderTrackingId) {
      return NextResponse.json(
        { error: "Order tracking ID is required" },
        { status: 400 }
      );
    }

    // Check the PaymentOrder first
    const paymentOrder = await db.paymentOrder.findFirst({
      where: { orderTrackingId },
    });

    if (paymentOrder?.status === "COMPLETED") {
      // Check for the associated subscription
      const subscription = await db.subscription.findFirst({
        where: { userId: paymentOrder.userId, status: "ACTIVE" },
      });

      return NextResponse.json({
        status: "COMPLETED",
        subscriptionId: subscription?.id,
        package: subscription?.package || paymentOrder.packageName,
      });
    }

    if (paymentOrder?.status === "FAILED") {
      return NextResponse.json({ status: "FAILED" });
    }

    // Simulated payment - auto-complete for development
    if (orderTrackingId.startsWith("SIM-") && paymentOrder) {
      return NextResponse.json({
        status: "PENDING",
        simulated: true,
        message: "Simulated payment. Use the confirm-simulated endpoint to complete.",
        paymentOrderId: paymentOrder.id,
      });
    }

    // Query PesaPal for the transaction status
    let transactionStatus;
    try {
      transactionStatus = await getTransactionStatus(orderTrackingId);
    } catch {
      return NextResponse.json({
        status: "PENDING",
        message: "Unable to verify payment status at this time. Please check again later.",
      });
    }

    return NextResponse.json({
      status: transactionStatus.payment_status,
      confirmationCode: transactionStatus.confirmation_code,
      merchantReference: transactionStatus.merchant_reference,
      amount: transactionStatus.amount,
      paymentMethod: transactionStatus.payment_method,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
