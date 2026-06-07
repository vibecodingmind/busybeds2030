import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const starRating = searchParams.get("starRating");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { isActive: true };

    if (city) {
      where.city = { contains: city };
    }

    if (starRating) {
      where.starRating = parseInt(starRating);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const hotels = await db.hotel.findMany({
      where,
      include: {
        roomTypes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON fields for each hotel
    const hotelsParsed = hotels.map((hotel) => ({
      ...hotel,
      photos: JSON.parse(hotel.photos),
      amenities: JSON.parse(hotel.amenities),
    }));

    return NextResponse.json({ hotels: hotelsParsed });
  } catch (error) {
    console.error("Hotels list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
