import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      city,
      country,
      description,
      starRating,
      photos,
      amenities,
      depositPolicy,
      commissionPercent,
      contactEmail,
      contactPhone,
      roomTypes,
    } = body;

    if (!name || !city || !description || !starRating) {
      return NextResponse.json(
        { error: "Name, city, description, and starRating are required" },
        { status: 400 }
      );
    }

    const hotel = await db.hotel.create({
      data: {
        name,
        city,
        country: country || "Tanzania",
        description,
        starRating: parseInt(String(starRating)),
        photos: JSON.stringify(photos || []),
        amenities: JSON.stringify(amenities || []),
        depositPolicy: depositPolicy || "FIFTY_PERCENT",
        commissionPercent: commissionPercent || 15.0,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        roomTypes: {
          create: (roomTypes || []).map(
            (rt: {
              name: string;
              rackRate: number;
              discountRate: number;
              discountPercent: number;
              description?: string;
            }) => ({
              name: rt.name,
              rackRate: parseFloat(String(rt.rackRate)),
              discountRate: parseFloat(String(rt.discountRate)),
              discountPercent: parseFloat(String(rt.discountPercent)),
              description: rt.description || null,
            })
          ),
        },
      },
      include: { roomTypes: true },
    });

    return NextResponse.json({ hotel }, { status: 201 });
  } catch (error) {
    console.error("Create hotel error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
