import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

const PACKAGE_CREDITS: Record<string, number> = {
  STARTER: 5,
  STANDARD: 15,
  PREMIUM: 999,
};

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BB-2026-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        package: subscription.package,
        creditsTotal: subscription.creditsTotal,
        creditsUsed: subscription.creditsUsed,
        creditsRemaining: subscription.creditsRemaining,
        startDate: subscription.startDate,
        renewalDate: subscription.renewalDate,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error("Subscription GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { package: packageName, paymentRef } = body;

    if (!packageName || !PACKAGE_CREDITS[packageName]) {
      return NextResponse.json(
        { error: "Invalid package. Choose STARTER, STANDARD, or PREMIUM" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const existingSub = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    if (existingSub) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 409 }
      );
    }

    const creditsTotal = PACKAGE_CREDITS[packageName];
    const now = new Date();
    const renewalDate = new Date(now);
    renewalDate.setDate(renewalDate.getDate() + 30);

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        userId: session.user.id,
        package: packageName,
        creditsTotal,
        creditsUsed: 0,
        creditsRemaining: creditsTotal,
        startDate: now,
        renewalDate,
        status: "ACTIVE",
        paymentRef: paymentRef || null,
      },
    });

    // Generate coupon credits
    const couponData = [];
    for (let i = 0; i < creditsTotal; i++) {
      let code = generateCouponCode();
      // Ensure uniqueness
      const existing = await db.coupon.findUnique({ where: { code } });
      while (existing) {
        code = generateCouponCode();
        const check = await db.coupon.findUnique({ where: { code } });
        if (!check) break;
      }
      couponData.push({
        subscriptionId: subscription.id,
        userId: session.user.id,
        code,
        status: "AVAILABLE",
      });
    }

    await db.coupon.createMany({ data: couponData });

    return NextResponse.json(
      {
        subscription: {
          id: subscription.id,
          package: subscription.package,
          creditsTotal: subscription.creditsTotal,
          creditsRemaining: subscription.creditsRemaining,
          renewalDate: subscription.renewalDate,
        },
        couponsGenerated: creditsTotal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
