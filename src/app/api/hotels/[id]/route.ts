import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hotel = await db.hotel.findUnique({
      where: { id, isActive: true },
      include: {
        roomTypes: true,
      },
    });

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const isSubscribed =
      session?.user?.id &&
      (await db.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: "ACTIVE",
        },
      }));

    const parsedHotel = {
      ...hotel,
      photos: JSON.parse(hotel.photos),
      amenities: JSON.parse(hotel.amenities),
      // Only include contact details for subscribed users
      contactEmail: isSubscribed ? hotel.contactEmail : null,
      contactPhone: isSubscribed ? hotel.contactPhone : null,
    };

    return NextResponse.json({ hotel: parsedHotel });
  } catch (error) {
    console.error("Hotel detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
