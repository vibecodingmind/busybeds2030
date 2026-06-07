import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Admin user
  const adminPasswordHash = await bcrypt.hash("password123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@busybeds.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@busybeds.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      phone: "+255 700 000 001",
    },
  });

  console.log("Admin user created:", admin.email);

  // Create Hotel 1 - Arusha
  const hotel1 = await prisma.hotel.create({
    data: {
      name: "Serengeti Luxury Lodge",
      city: "Arusha",
      country: "Tanzania",
      description:
        "Experience the magic of the Serengeti from the comfort of our luxury lodge. Nestled at the edge of the national park, enjoy breathtaking views, world-class dining, and unparalleled safari experiences. Our lodge combines traditional Tanzanian hospitality with modern luxury.",
      starRating: 5,
      photos: JSON.stringify([
        "/images/serengeti-1.jpg",
        "/images/serengeti-2.jpg",
        "/images/serengeti-3.jpg",
        "/images/serengeti-4.jpg",
      ]),
      amenities: JSON.stringify([
        "Free WiFi",
        "Swimming Pool",
        "Spa & Wellness",
        "Restaurant",
        "Bar",
        "Safari Tours",
        "Airport Shuttle",
        "Room Service",
        "Fitness Center",
        "Conference Room",
      ]),
      depositPolicy: "FIFTY_PERCENT",
      commissionPercent: 15.0,
      contactEmail: "info@serengetilodge.co.tz",
      contactPhone: "+255 27 250 0001",
      roomTypes: {
        create: [
          {
            name: "Standard Room",
            rackRate: 250,
            discountRate: 175,
            discountPercent: 30,
            description:
              "Comfortable room with garden view, perfect for solo travelers or couples.",
          },
          {
            name: "Deluxe Suite",
            rackRate: 450,
            discountRate: 292.5,
            discountPercent: 35,
            description:
              "Spacious suite with panoramic savannah views and private balcony.",
          },
          {
            name: "Presidential Villa",
            rackRate: 850,
            discountRate: 510,
            discountPercent: 40,
            description:
              "Ultimate luxury with private pool, butler service, and exclusive safari access.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });

  console.log("Hotel 1 created:", hotel1.name);

  // Create Hotel 2 - Dar es Salaam
  const hotel2 = await prisma.hotel.create({
    data: {
      name: "Dar Royal Beach Resort",
      city: "Dar es Salaam",
      country: "Tanzania",
      description:
        "A stunning beachfront resort along the Indian Ocean coast. Perfect for both business and leisure travelers, offering pristine beaches, water sports, and exquisite dining. Located just 20 minutes from Julius Nyerere International Airport.",
      starRating: 5,
      photos: JSON.stringify([
        "/images/dar-royal-1.jpg",
        "/images/dar-royal-2.jpg",
        "/images/dar-royal-3.jpg",
      ]),
      amenities: JSON.stringify([
        "Beach Access",
        "Free WiFi",
        "Swimming Pool",
        "Spa",
        "Restaurant",
        "Water Sports",
        "Business Center",
        "Gym",
        "Kids Club",
        "Valet Parking",
      ]),
      depositPolicy: "FIFTY_PERCENT",
      commissionPercent: 12.0,
      contactEmail: "reservations@darroyal.co.tz",
      contactPhone: "+255 22 211 0002",
      roomTypes: {
        create: [
          {
            name: "Ocean View Room",
            rackRate: 200,
            discountRate: 140,
            discountPercent: 30,
            description:
              "Beautiful room with direct ocean views and modern amenities.",
          },
          {
            name: "Beachfront Suite",
            rackRate: 380,
            discountRate: 247,
            discountPercent: 35,
            description:
              "Luxurious suite steps from the beach with private terrace.",
          },
          {
            name: "Royal Penthouse",
            rackRate: 700,
            discountRate: 420,
            discountPercent: 40,
            description:
              "Top-floor penthouse with 360° ocean views and private Jacuzzi.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });

  console.log("Hotel 2 created:", hotel2.name);

  // Create Hotel 3 - Arusha (Mid-range)
  const hotel3 = await prisma.hotel.create({
    data: {
      name: "Kilimanjaro View Hotel",
      city: "Arusha",
      country: "Tanzania",
      description:
        "Wake up to stunning views of Mount Kilimanjaro from our charming hotel. Ideally located for both safari departures and mountain trekking expeditions. Our warm hospitality and comfortable accommodations make us the perfect base for your Tanzanian adventure.",
      starRating: 4,
      photos: JSON.stringify([
        "/images/kili-view-1.jpg",
        "/images/kili-view-2.jpg",
        "/images/kili-view-3.jpg",
      ]),
      amenities: JSON.stringify([
        "Free WiFi",
        "Restaurant",
        "Bar",
        "Garden",
        "Airport Shuttle",
        "Tour Desk",
        "Laundry",
        "Parking",
      ]),
      depositPolicy: "FIFTY_PERCENT",
      commissionPercent: 18.0,
      contactEmail: "stay@kilimanjaroview.co.tz",
      contactPhone: "+255 27 250 0003",
      roomTypes: {
        create: [
          {
            name: "Kili View Room",
            rackRate: 150,
            discountRate: 105,
            discountPercent: 30,
            description:
              "Cozy room with magnificent views of Mount Kilimanjaro.",
          },
          {
            name: "Safari Suite",
            rackRate: 280,
            discountRate: 182,
            discountPercent: 35,
            description:
              "Spacious suite with sitting area and premium mountain views.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });

  console.log("Hotel 3 created:", hotel3.name);

  // Create Hotel Staff accounts
  const staff1PasswordHash = await bcrypt.hash("password123", 12);
  const staff1 = await prisma.user.upsert({
    where: { email: "serengeti@busybeds.com" },
    update: {},
    create: {
      name: "Joseph Mwangi",
      email: "serengeti@busybeds.com",
      passwordHash: staff1PasswordHash,
      role: "HOTEL_STAFF",
      phone: "+255 700 111 001",
    },
  });

  await prisma.hotelStaff.upsert({
    where: { userId: staff1.id },
    update: {},
    create: {
      hotelId: hotel1.id,
      userId: staff1.id,
    },
  });

  console.log("Staff 1 created:", staff1.email);

  const staff2PasswordHash = await bcrypt.hash("password123", 12);
  const staff2 = await prisma.user.upsert({
    where: { email: "staff@darroyal.co.tz" },
    update: {},
    create: {
      name: "Amina Hassan",
      email: "staff@darroyal.co.tz",
      passwordHash: staff2PasswordHash,
      role: "HOTEL_STAFF",
      phone: "+255 700 111 002",
    },
  });

  await prisma.hotelStaff.upsert({
    where: { userId: staff2.id },
    update: {},
    create: {
      hotelId: hotel2.id,
      userId: staff2.id,
    },
  });

  console.log("Staff 2 created:", staff2.email);

  const staff3PasswordHash = await bcrypt.hash("password123", 12);
  const staff3 = await prisma.user.upsert({
    where: { email: "staff@kilimanjaroview.co.tz" },
    update: {},
    create: {
      name: "Grace Mbise",
      email: "staff@kilimanjaroview.co.tz",
      passwordHash: staff3PasswordHash,
      role: "HOTEL_STAFF",
      phone: "+255 700 111 003",
    },
  });

  await prisma.hotelStaff.upsert({
    where: { userId: staff3.id },
    update: {},
    create: {
      hotelId: hotel3.id,
      userId: staff3.id,
    },
  });

  console.log("Staff 3 created:", staff3.email);

  // Create a sample guest user with subscription
  const guestPasswordHash = await bcrypt.hash("password123", 12);
  const guest = await prisma.user.upsert({
    where: { email: "john@busybeds.com" },
    update: {},
    create: {
      name: "John Traveler",
      email: "john@busybeds.com",
      passwordHash: guestPasswordHash,
      role: "GUEST",
      phone: "+255 700 222 001",
    },
  });

  console.log("Sample guest created:", guest.email);

  // Create subscription for guest
  const now = new Date();
  const renewalDate = new Date(now);
  renewalDate.setDate(renewalDate.getDate() + 30);

  const subscription = await prisma.subscription.create({
    data: {
      userId: guest.id,
      package: "STANDARD",
      creditsTotal: 15,
      creditsUsed: 0,
      creditsRemaining: 15,
      startDate: now,
      renewalDate,
      status: "ACTIVE",
    },
  });

  console.log("Sample subscription created:", subscription.package);

  // Generate coupon codes for the subscription
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const couponCodes = [
    "BB-2026-AK7NP",
    "BB-2026-BM3RJ",
    "BB-2026-CW5TX",
    "BB-2026-DQ9HF",
    "BB-2026-EY2LZ",
    "BB-2026-FG8VS",
    "BB-2026-HJ4KD",
    "BB-2026-KM6PB",
    "BB-2026-LN1YC",
    "BB-2026-PR7WQ",
    "BB-2026-ST3GA",
    "BB-2026-TV9EF",
    "BB-2026-UW5NB",
    "BB-2026-VX2RC",
    "BB-2026-XZ8DH",
  ];

  for (let i = 0; i < 15; i++) {
    await prisma.coupon.create({
      data: {
        subscriptionId: subscription.id,
        userId: guest.id,
        code: couponCodes[i],
        status: "AVAILABLE",
      },
    });
  }

  console.log("15 sample coupons generated");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
