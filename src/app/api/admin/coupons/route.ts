import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const hotelId = searchParams.get("hotelId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (hotelId) where.hotelId = hotelId;

    const coupons = await db.coupon.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        hotel: { select: { name: true, city: true } },
        roomType: { select: { name: true } },
        subscription: { select: { package: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Admin coupons error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
