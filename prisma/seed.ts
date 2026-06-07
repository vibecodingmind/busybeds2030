import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ==========================================
  // 1. CREATE USERS
  // ==========================================

  // Admin user
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

  // Guest user 1 - John Traveler (STANDARD plan)
  const guest1PasswordHash = await bcrypt.hash("password123", 12);
  const guest1 = await prisma.user.upsert({
    where: { email: "john@busybeds.com" },
    update: {},
    create: {
      name: "John Traveler",
      email: "john@busybeds.com",
      passwordHash: guest1PasswordHash,
      role: "GUEST",
      phone: "+255 700 222 001",
    },
  });
  console.log("Guest 1 created:", guest1.email);

  // Guest user 2 - Sarah Mwangi (PREMIUM plan)
  const guest2PasswordHash = await bcrypt.hash("password123", 12);
  const guest2 = await prisma.user.upsert({
    where: { email: "sarah@busybeds.com" },
    update: {},
    create: {
      name: "Sarah Mwangi",
      email: "sarah@busybeds.com",
      passwordHash: guest2PasswordHash,
      role: "GUEST",
      phone: "+254 700 333 002",
    },
  });
  console.log("Guest 2 created:", guest2.email);

  // Guest user 3 - David Ochieng (STARTER plan)
  const guest3PasswordHash = await bcrypt.hash("password123", 12);
  const guest3 = await prisma.user.upsert({
    where: { email: "david@busybeds.com" },
    update: {},
    create: {
      name: "David Ochieng",
      email: "david@busybeds.com",
      passwordHash: guest3PasswordHash,
      role: "GUEST",
      phone: "+256 700 444 003",
    },
  });
  console.log("Guest 3 created:", guest3.email);

  // Guest user 4 - Aisha Juma (no subscription - new user)
  const guest4PasswordHash = await bcrypt.hash("password123", 12);
  const guest4 = await prisma.user.upsert({
    where: { email: "aisha@busybeds.com" },
    update: {},
    create: {
      name: "Aisha Juma",
      email: "aisha@busybeds.com",
      passwordHash: guest4PasswordHash,
      role: "GUEST",
      phone: "+255 700 555 004",
    },
  });
  console.log("Guest 4 created:", guest4.email);

  // ==========================================
  // 2. CREATE HOTELS
  // ==========================================

  // Hotel 1 - Serengeti Luxury Lodge, Arusha, Tanzania
  const hotel1 = await prisma.hotel.upsert({
    where: { id: "hotel-serengeti-lodge" },
    update: {},
    create: {
      id: "hotel-serengeti-lodge",
      name: "Serengeti Luxury Lodge",
      city: "Arusha",
      country: "Tanzania",
      description:
        "Experience the magic of the Serengeti from the comfort of our luxury lodge. Nestled at the edge of the national park, enjoy breathtaking views, world-class dining, and unparalleled safari experiences. Our lodge combines traditional Tanzanian hospitality with modern luxury, featuring spacious rooms with panoramic savannah views, an infinity pool overlooking the plains, and expert-guided safari tours that bring you face-to-face with the Big Five.",
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
              "Comfortable room with garden view, perfect for solo travelers or couples. Features a king-size bed, en-suite bathroom, and private veranda overlooking the lodge gardens.",
          },
          {
            name: "Deluxe Suite",
            rackRate: 450,
            discountRate: 292.5,
            discountPercent: 35,
            description:
              "Spacious suite with panoramic savannah views and private balcony. Includes a separate living area, mini-bar, and complimentary safari binoculars for wildlife viewing from your room.",
          },
          {
            name: "Presidential Villa",
            rackRate: 850,
            discountRate: 510,
            discountPercent: 40,
            description:
              "Ultimate luxury with private pool, butler service, and exclusive safari access. This villa offers complete privacy with a personal chef, private game drive vehicle, and outdoor shower.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });
  console.log("Hotel 1 created:", hotel1.name);

  // Hotel 2 - Dar Royal Beach Resort, Dar es Salaam, Tanzania
  const hotel2 = await prisma.hotel.upsert({
    where: { id: "hotel-dar-royal-beach" },
    update: {},
    create: {
      id: "hotel-dar-royal-beach",
      name: "Dar Royal Beach Resort",
      city: "Dar es Salaam",
      country: "Tanzania",
      description:
        "A stunning beachfront resort along the Indian Ocean coast. Perfect for both business and leisure travelers, offering pristine beaches, water sports, and exquisite dining. Located just 20 minutes from Julius Nyerere International Airport, our resort features lush tropical gardens, multiple swimming pools, a world-class spa, and direct access to a private white-sand beach that stretches for kilometers.",
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
              "Beautiful room with direct ocean views and modern amenities. Wake up to the sound of waves and enjoy stunning Indian Ocean sunrises from your private balcony.",
          },
          {
            name: "Beachfront Suite",
            rackRate: 380,
            discountRate: 247,
            discountPercent: 35,
            description:
              "Luxurious suite steps from the beach with private terrace. Features an outdoor soaking tub, rain shower, and direct beach access through your private garden.",
          },
          {
            name: "Royal Penthouse",
            rackRate: 700,
            discountRate: 420,
            discountPercent: 40,
            description:
              "Top-floor penthouse with 360-degree ocean views and private Jacuzzi. Includes a full kitchen, dining area for 8, and a rooftop terrace perfect for sunset cocktails.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });
  console.log("Hotel 2 created:", hotel2.name);

  // Hotel 3 - Kilimanjaro View Hotel, Arusha, Tanzania
  const hotel3 = await prisma.hotel.upsert({
    where: { id: "hotel-kilimanjaro-view" },
    update: {},
    create: {
      id: "hotel-kilimanjaro-view",
      name: "Kilimanjaro View Hotel",
      city: "Arusha",
      country: "Tanzania",
      description:
        "Wake up to stunning views of Mount Kilimanjaro from our charming hotel. Ideally located for both safari departures and mountain trekking expeditions. Our warm hospitality and comfortable accommodations make us the perfect base for your Tanzanian adventure. The hotel features a rooftop restaurant with panoramic mountain views, a cozy fireplace lounge, and expert trekking guides.",
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
              "Cozy room with magnificent views of Mount Kilimanjaro. Features warm decor, comfortable bedding, and a viewing window perfect for watching the sunrise over Africa's highest peak.",
          },
          {
            name: "Safari Suite",
            rackRate: 280,
            discountRate: 182,
            discountPercent: 35,
            description:
              "Spacious suite with sitting area and premium mountain views. Includes a private balcony, binoculars for wildlife spotting, and a curated minibar with local Tanzanian beverages.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });
  console.log("Hotel 3 created:", hotel3.name);

  // Hotel 4 - Maasai Mara Safari Camp, Narok, Kenya
  const hotel4 = await prisma.hotel.upsert({
    where: { id: "hotel-maasai-mara-camp" },
    update: {},
    create: {
      id: "hotel-maasai-mara-camp",
      name: "Maasai Mara Safari Camp",
      city: "Narok",
      country: "Kenya",
      description:
        "Immerse yourself in the heart of Kenya's most famous wildlife reserve. Our luxury tented camp offers an authentic safari experience without compromising on comfort. Each tent is elegantly furnished with en-suite bathrooms, private decks, and stunning views of the Mara plains. Witness the Great Migration, enjoy bush dinners under the stars, and create memories that last a lifetime with our experienced Maasai guides.",
      starRating: 5,
      photos: JSON.stringify([
        "/images/mara-camp-1.jpg",
        "/images/mara-camp-2.jpg",
        "/images/mara-camp-3.jpg",
        "/images/mara-camp-4.jpg",
      ]),
      amenities: JSON.stringify([
        "Game Drives",
        "Bush Dining",
        "Campfire",
        "Free WiFi (Lobby)",
        "Spa Tent",
        "Maasai Cultural Visits",
        "Hot Air Balloon Rides",
        "Nature Walks",
        "Sundowner Cocktails",
        "Photography Hide",
      ]),
      depositPolicy: "FIFTY_PERCENT",
      commissionPercent: 14.0,
      contactEmail: "book@maasaimaracamp.ke",
      contactPhone: "+254 20 800 0004",
      roomTypes: {
        create: [
          {
            name: "Safari Tent",
            rackRate: 350,
            discountRate: 245,
            discountPercent: 30,
            description:
              "Luxury tented accommodation with en-suite bathroom and private viewing deck overlooking the Mara plains. Fall asleep to the sounds of the African bush.",
          },
          {
            name: "Honeymoon Suite Tent",
            rackRate: 550,
            discountRate: 357.5,
            discountPercent: 35,
            description:
              "Romantic tented suite with outdoor bathtub, private campfire area, and complimentary champagne. Perfect for couples seeking an unforgettable safari honeymoon.",
          },
          {
            name: "Family Safari Lodge",
            rackRate: 750,
            discountRate: 450,
            discountPercent: 40,
            description:
              "Spacious family lodge with two bedrooms, living area, and private guide. Includes kids' safari program and flexible meal times for families.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });
  console.log("Hotel 4 created:", hotel4.name);

  // Hotel 5 - Nairobi Skyline Hotel, Nairobi, Kenya
  const hotel5 = await prisma.hotel.upsert({
    where: { id: "hotel-nairobi-skyline" },
    update: {},
    create: {
      id: "hotel-nairobi-skyline",
      name: "Nairobi Skyline Hotel",
      city: "Nairobi",
      country: "Kenya",
      description:
        "A modern urban hotel in the heart of Nairobi's Central Business District. Perfect for business travelers and city explorers, offering contemporary design, rooftop dining with panoramic city views, and easy access to Nairobi's top attractions including the National Museum, Karen Blixen Museum, and the famous Giraffe Centre. Our hotel combines Kenyan warmth with international standards of excellence.",
      starRating: 4,
      photos: JSON.stringify([
        "/images/nairobi-skyline-1.jpg",
        "/images/nairobi-skyline-2.jpg",
        "/images/nairobi-skyline-3.jpg",
      ]),
      amenities: JSON.stringify([
        "Free WiFi",
        "Rooftop Restaurant",
        "Gym",
        "Business Center",
        "Conference Rooms",
        "Valet Parking",
        "Airport Transfer",
        "Concierge",
        "Laundry",
        "Room Service",
      ]),
      depositPolicy: "CARD_HOLD",
      commissionPercent: 10.0,
      contactEmail: "stay@nairobiskyline.ke",
      contactPhone: "+254 20 333 0005",
      roomTypes: {
        create: [
          {
            name: "City View Room",
            rackRate: 180,
            discountRate: 126,
            discountPercent: 30,
            description:
              "Modern room with floor-to-ceiling windows offering stunning Nairobi skyline views. Includes ergonomic workspace and premium bedding.",
          },
          {
            name: "Executive Suite",
            rackRate: 320,
            discountRate: 208,
            discountPercent: 35,
            description:
              "Spacious executive suite with separate lounge, dining area, and access to the Executive Lounge with complimentary breakfast and evening cocktails.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });
  console.log("Hotel 5 created:", hotel5.name);

  // Hotel 6 - Lake Victoria Serenity Resort, Mwanza, Tanzania
  const hotel6 = await prisma.hotel.upsert({
    where: { id: "hotel-lake-victoria-serenity" },
    update: {},
    create: {
      id: "hotel-lake-victoria-serenity",
      name: "Lake Victoria Serenity Resort",
      city: "Mwanza",
      country: "Tanzania",
      description:
        "Nestled on the shores of Lake Victoria, Africa's largest lake, our resort offers a tranquil escape with breathtaking lake views. Enjoy fresh tilapia from the lake, sunset dhow cruises, and cultural visits to nearby fishing villages. The resort features lush tropical gardens, an infinity pool merging with the lake horizon, and some of the finest birdwatching in East Africa with over 300 species recorded on our grounds.",
      starRating: 4,
      photos: JSON.stringify([
        "/images/victoria-serenity-1.jpg",
        "/images/victoria-serenity-2.jpg",
        "/images/victoria-serenity-3.jpg",
      ]),
      amenities: JSON.stringify([
        "Lake Access",
        "Free WiFi",
        "Swimming Pool",
        "Restaurant",
        "Bar",
        "Boat Trips",
        "Bird Watching",
        "Cultural Tours",
        "Fishing",
        "Garden",
      ]),
      depositPolicy: "FIFTY_PERCENT",
      commissionPercent: 16.0,
      contactEmail: "relax@victoriaserenity.co.tz",
      contactPhone: "+255 28 250 0006",
      roomTypes: {
        create: [
          {
            name: "Lake View Room",
            rackRate: 160,
            discountRate: 112,
            discountPercent: 30,
            description:
              "Serene room with private balcony overlooking Lake Victoria. Watch fishermen return at sunset and wake to the gentle lapping of waves.",
          },
          {
            name: "Lakeside Cottage",
            rackRate: 290,
            discountRate: 188.5,
            discountPercent: 35,
            description:
              "Private cottage with direct lake access, outdoor shower, and a thatched gazebo perfect for sunset dining. Includes complimentary dhow cruise.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });
  console.log("Hotel 6 created:", hotel6.name);

  // Hotel 7 - Kampala Pearl Hotel, Kampala, Uganda
  const hotel7 = await prisma.hotel.upsert({
    where: { id: "hotel-kampala-pearl" },
    update: {},
    create: {
      id: "hotel-kampala-pearl",
      name: "Kampala Pearl Hotel",
      city: "Kampala",
      country: "Uganda",
      description:
        "Discover the Pearl of Africa from our elegant hotel in Kampala's diplomatic quarter. Surrounded by lush hills and vibrant culture, our hotel offers a refined Ugandan experience with modern amenities. Explore nearby attractions like the Kasubi Tombs, Ndere Cultural Centre, and the bustling Owino Market. Our rooftop pool and lounge offer stunning views over Kampala's seven hills, while our restaurant serves the best of Ugandan and international cuisine.",
      starRating: 5,
      photos: JSON.stringify([
        "/images/kampala-pearl-1.jpg",
        "/images/kampala-pearl-2.jpg",
        "/images/kampala-pearl-3.jpg",
        "/images/kampala-pearl-4.jpg",
      ]),
      amenities: JSON.stringify([
        "Free WiFi",
        "Rooftop Pool",
        "Restaurant",
        "Bar",
        "Gym",
        "Spa",
        "Business Center",
        "Conference Rooms",
        "Airport Shuttle",
        "Concierge",
      ]),
      depositPolicy: "FIFTY_PERCENT",
      commissionPercent: 13.0,
      contactEmail: "stay@kampalapearl.ug",
      contactPhone: "+256 41 400 0007",
      roomTypes: {
        create: [
          {
            name: "Hill View Room",
            rackRate: 220,
            discountRate: 154,
            discountPercent: 30,
            description:
              "Elegant room with panoramic views of Kampala's famous seven hills. Features Ugandan art, rain shower, and premium bedding.",
          },
          {
            name: "Pearl Suite",
            rackRate: 420,
            discountRate: 273,
            discountPercent: 35,
            description:
              "Luxurious suite with separate living room, dining area, and private balcony. Includes butler service and access to the Pearl Lounge.",
          },
          {
            name: "Presidential Suite",
            rackRate: 800,
            discountRate: 480,
            discountPercent: 40,
            description:
              "The finest accommodation in Kampala with panoramic city views, grand piano, private dining room, and 24-hour butler service. Features Ugandan marble and handcrafted furniture.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });
  console.log("Hotel 7 created:", hotel7.name);

  // Hotel 8 - Zanzibar Spice Island Resort, Zanzibar, Tanzania
  const hotel8 = await prisma.hotel.upsert({
    where: { id: "hotel-zanzibar-spice-island" },
    update: {},
    create: {
      id: "hotel-zanzibar-spice-island",
      name: "Zanzibar Spice Island Resort",
      city: "Zanzibar",
      country: "Tanzania",
      description:
        "Step into paradise at our beachfront resort on Zanzibar's pristine east coast. Famous for its turquoise waters, powder-white sand, and rich Swahili heritage, Zanzibar offers an idyllic tropical escape. Our resort blends traditional Zanzibari architecture with modern luxury, featuring intricately carved doors, open-air bathrooms, and a spice garden. Enjoy snorkeling in the coral reef, exploring Stone Town, or simply relaxing by our infinity pool as traditional dhows sail past.",
      starRating: 5,
      photos: JSON.stringify([
        "/images/zanzibar-spice-1.jpg",
        "/images/zanzibar-spice-2.jpg",
        "/images/zanzibar-spice-3.jpg",
        "/images/zanzibar-spice-4.jpg",
      ]),
      amenities: JSON.stringify([
        "Beach Access",
        "Free WiFi",
        "Infinity Pool",
        "Spa",
        "Restaurant",
        "Snorkeling",
        "Diving Center",
        "Spice Tour",
        "Stone Town Shuttle",
        "Water Sports",
      ]),
      depositPolicy: "FULL",
      commissionPercent: 11.0,
      contactEmail: "paradise@spiceisland.co.tz",
      contactPhone: "+255 24 223 0008",
      roomTypes: {
        create: [
          {
            name: "Garden Bungalow",
            rackRate: 280,
            discountRate: 196,
            discountPercent: 30,
            description:
              "Charming bungalow nestled in tropical gardens with traditional Zanzibari decor and a private outdoor shower. Short walk to the beach.",
          },
          {
            name: "Beach Villa",
            rackRate: 480,
            discountRate: 312,
            discountPercent: 35,
            description:
              "Stunning beachfront villa with private plunge pool, direct beach access, and a rooftop terrace for watching the famous Zanzibar sunset.",
          },
          {
            name: "Overwater Suite",
            rackRate: 900,
            discountRate: 540,
            discountPercent: 40,
            description:
              "Exclusive overwater suite with glass floor panels, private deck with ladder into the ocean, and complimentary sunset dhow cruise for two.",
          },
        ],
      },
    },
    include: { roomTypes: true },
  });
  console.log("Hotel 8 created:", hotel8.name);

  // ==========================================
  // 3. CREATE HOTEL STAFF
  // ==========================================

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
    create: { hotelId: hotel1.id, userId: staff1.id },
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
    create: { hotelId: hotel2.id, userId: staff2.id },
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
    create: { hotelId: hotel3.id, userId: staff3.id },
  });
  console.log("Staff 3 created:", staff3.email);

  const staff4PasswordHash = await bcrypt.hash("password123", 12);
  const staff4 = await prisma.user.upsert({
    where: { email: "staff@maasaimaracamp.ke" },
    update: {},
    create: {
      name: "Samuel Kipchoge",
      email: "staff@maasaimaracamp.ke",
      passwordHash: staff4PasswordHash,
      role: "HOTEL_STAFF",
      phone: "+254 700 111 004",
    },
  });
  await prisma.hotelStaff.upsert({
    where: { userId: staff4.id },
    update: {},
    create: { hotelId: hotel4.id, userId: staff4.id },
  });
  console.log("Staff 4 created:", staff4.email);

  const staff5PasswordHash = await bcrypt.hash("password123", 12);
  const staff5 = await prisma.user.upsert({
    where: { email: "staff@nairobiskyline.ke" },
    update: {},
    create: {
      name: "Wanjiku Nderitu",
      email: "staff@nairobiskyline.ke",
      passwordHash: staff5PasswordHash,
      role: "HOTEL_STAFF",
      phone: "+254 700 111 005",
    },
  });
  await prisma.hotelStaff.upsert({
    where: { userId: staff5.id },
    update: {},
    create: { hotelId: hotel5.id, userId: staff5.id },
  });
  console.log("Staff 5 created:", staff5.email);

  const staff6PasswordHash = await bcrypt.hash("password123", 12);
  const staff6 = await prisma.user.upsert({
    where: { email: "staff@victoriaserenity.co.tz" },
    update: {},
    create: {
      name: "Peter Odhiambo",
      email: "staff@victoriaserenity.co.tz",
      passwordHash: staff6PasswordHash,
      role: "HOTEL_STAFF",
      phone: "+255 700 111 006",
    },
  });
  await prisma.hotelStaff.upsert({
    where: { userId: staff6.id },
    update: {},
    create: { hotelId: hotel6.id, userId: staff6.id },
  });
  console.log("Staff 6 created:", staff6.email);

  const staff7PasswordHash = await bcrypt.hash("password123", 12);
  const staff7 = await prisma.user.upsert({
    where: { email: "staff@kampalapearl.ug" },
    update: {},
    create: {
      name: "Emmanuel Mugisha",
      email: "staff@kampalapearl.ug",
      passwordHash: staff7PasswordHash,
      role: "HOTEL_STAFF",
      phone: "+256 700 111 007",
    },
  });
  await prisma.hotelStaff.upsert({
    where: { userId: staff7.id },
    update: {},
    create: { hotelId: hotel7.id, userId: staff7.id },
  });
  console.log("Staff 7 created:", staff7.email);

  const staff8PasswordHash = await bcrypt.hash("password123", 12);
  const staff8 = await prisma.user.upsert({
    where: { email: "staff@spiceisland.co.tz" },
    update: {},
    create: {
      name: "Fatma Abdul",
      email: "staff@spiceisland.co.tz",
      passwordHash: staff8PasswordHash,
      role: "HOTEL_STAFF",
      phone: "+255 700 111 008",
    },
  });
  await prisma.hotelStaff.upsert({
    where: { userId: staff8.id },
    update: {},
    create: { hotelId: hotel8.id, userId: staff8.id },
  });
  console.log("Staff 8 created:", staff8.email);

  // ==========================================
  // 4. CREATE SUBSCRIPTIONS
  // ==========================================

  const now = new Date();
  const renewalDate30 = new Date(now);
  renewalDate30.setDate(renewalDate30.getDate() + 30);

  // Guest 1 - STANDARD subscription (15 coupons)
  // Use findFirst + create to handle existing subscription for this userId
  let sub1 = await prisma.subscription.findFirst({ where: { userId: guest1.id } });
  if (!sub1) {
    sub1 = await prisma.subscription.create({
      data: {
        userId: guest1.id,
        package: "STANDARD",
        creditsTotal: 15,
        creditsUsed: 4,
        creditsRemaining: 11,
        startDate: now,
        renewalDate: renewalDate30,
        status: "ACTIVE",
        paymentRef: "MPESA-255700222001-1700000000000",
      },
    });
  } else {
    // Update existing subscription to match demo data
    sub1 = await prisma.subscription.update({
      where: { id: sub1.id },
      data: {
        package: "STANDARD",
        creditsTotal: 15,
        creditsUsed: 4,
        creditsRemaining: 11,
        renewalDate: renewalDate30,
        status: "ACTIVE",
      },
    });
  }
  console.log("Subscription 1 created:", sub1.package);

  // Guest 2 - PREMIUM subscription (999 = unlimited)
  let sub2 = await prisma.subscription.findFirst({ where: { userId: guest2.id } });
  if (!sub2) {
    sub2 = await prisma.subscription.create({
      data: {
        userId: guest2.id,
        package: "PREMIUM",
        creditsTotal: 999,
        creditsUsed: 8,
        creditsRemaining: 991,
        startDate: now,
        renewalDate: renewalDate30,
        status: "ACTIVE",
        paymentRef: "MPESA-254700333002-1700000000001",
      },
    });
  }
  console.log("Subscription 2 created:", sub2.package);

  // Guest 3 - STARTER subscription (5 coupons)
  let sub3 = await prisma.subscription.findFirst({ where: { userId: guest3.id } });
  if (!sub3) {
    sub3 = await prisma.subscription.create({
      data: {
        userId: guest3.id,
        package: "STARTER",
        creditsTotal: 5,
        creditsUsed: 2,
        creditsRemaining: 3,
        startDate: now,
        renewalDate: renewalDate30,
        status: "ACTIVE",
        paymentRef: "MPESA-256700444003-1700000000002",
      },
    });
  }
  console.log("Subscription 3 created:", sub3.package);

  // ==========================================
  // 5. CREATE COUPONS WITH VARIED STATES
  // ==========================================

  // Helper for dates
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const twoWeeks = new Date(now);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // --- Guest 1 (John) coupons ---
  // Get room type IDs from hotels
  const hotel1Rooms = await prisma.roomType.findMany({ where: { hotelId: hotel1.id } });
  const hotel2Rooms = await prisma.roomType.findMany({ where: { hotelId: hotel2.id } });
  const hotel3Rooms = await prisma.roomType.findMany({ where: { hotelId: hotel3.id } });
  const hotel4Rooms = await prisma.roomType.findMany({ where: { hotelId: hotel4.id } });
  const hotel5Rooms = await prisma.roomType.findMany({ where: { hotelId: hotel5.id } });
  const hotel6Rooms = await prisma.roomType.findMany({ where: { hotelId: hotel6.id } });
  const hotel7Rooms = await prisma.roomType.findMany({ where: { hotelId: hotel7.id } });
  const hotel8Rooms = await prisma.roomType.findMany({ where: { hotelId: hotel8.id } });

  // Coupon 1 - AVAILABLE (no hotel assigned yet)
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-AV01" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-AV01",
      status: "AVAILABLE",
    },
  });

  // Coupon 2 - AVAILABLE (no hotel assigned yet)
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-AV02" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-AV02",
      status: "AVAILABLE",
    },
  });

  // Coupon 3 - RESERVED at Serengeti Lodge (active booking, payment pending)
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-RS01" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-RS01",
      status: "RESERVED",
      hotelId: hotel1.id,
      roomTypeId: hotel1Rooms[0]?.id,
      checkInDate: nextWeek,
      checkOutDate: twoWeeks,
      discountPercent: 30,
      discountAmount: 525,
      paymentDeadline: tomorrow,
      reservedAt: now,
      guestName: "John Traveler",
    },
  });

  // Coupon 4 - CONFIRMED at Dar Royal Beach
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-CF01" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-CF01",
      status: "CONFIRMED",
      hotelId: hotel2.id,
      roomTypeId: hotel2Rooms[0]?.id,
      checkInDate: nextWeek,
      checkOutDate: twoWeeks,
      discountPercent: 30,
      discountAmount: 420,
      reservedAt: twoDaysAgo,
      confirmedAt: yesterday,
      guestName: "John Traveler",
    },
  });

  // Coupon 5 - REDEEMED at Kilimanjaro View Hotel
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-RD01" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-RD01",
      status: "REDEEMED",
      hotelId: hotel3.id,
      roomTypeId: hotel3Rooms[0]?.id,
      checkInDate: lastWeek,
      checkOutDate: twoDaysAgo,
      discountPercent: 30,
      discountAmount: 315,
      reservedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      confirmedAt: lastWeek,
      redeemedAt: yesterday,
      guestName: "John Traveler",
    },
  });

  // Coupon 6 - CANCELLED
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-CN01" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-CN01",
      status: "CANCELLED",
      hotelId: hotel1.id,
      roomTypeId: hotel1Rooms[1]?.id,
      discountPercent: 35,
      cancelReason: "Change of travel plans",
      cancelledAt: twoDaysAgo,
      reservedAt: lastWeek,
      guestName: "John Traveler",
    },
  });

  // Coupon 7 - EXPIRED
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-EX01" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-EX01",
      status: "EXPIRED",
      hotelId: hotel2.id,
      roomTypeId: hotel2Rooms[1]?.id,
      discountPercent: 35,
      reservedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      guestName: "John Traveler",
    },
  });

  // Coupon 8 - AVAILABLE
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-AV03" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-AV03",
      status: "AVAILABLE",
    },
  });

  // Coupon 9 - AVAILABLE
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-AV04" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-AV04",
      status: "AVAILABLE",
    },
  });

  // Coupon 10 - AVAILABLE
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-AV05" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-AV05",
      status: "AVAILABLE",
    },
  });

  // Coupon 11 - NO_SHOW
  await prisma.coupon.upsert({
    where: { code: "BB-2026-JOHN-NS01" },
    update: {},
    create: {
      subscriptionId: sub1.id,
      userId: guest1.id,
      code: "BB-2026-JOHN-NS01",
      status: "NO_SHOW",
      hotelId: hotel3.id,
      roomTypeId: hotel3Rooms[1]?.id,
      checkInDate: lastWeek,
      checkOutDate: twoDaysAgo,
      discountPercent: 35,
      reservedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      confirmedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      guestName: "John Traveler",
    },
  });

  // Coupon 12-15 - remaining AVAILABLE
  for (let i = 6; i <= 11; i++) {
    await prisma.coupon.upsert({
      where: { code: `BB-2026-JOHN-AV${String(i).padStart(2, "0")}` },
      update: {},
      create: {
        subscriptionId: sub1.id,
        userId: guest1.id,
        code: `BB-2026-JOHN-AV${String(i).padStart(2, "0")}`,
        status: "AVAILABLE",
      },
    });
  }

  console.log("John's coupons created (15 total, varied statuses)");

  // --- Guest 2 (Sarah) coupons - PREMIUM user with more diverse bookings ---
  // RESERVED at Maasai Mara
  await prisma.coupon.upsert({
    where: { code: "BB-2026-SARA-RS01" },
    update: {},
    create: {
      subscriptionId: sub2.id,
      userId: guest2.id,
      code: "BB-2026-SARA-RS01",
      status: "RESERVED",
      hotelId: hotel4.id,
      roomTypeId: hotel4Rooms[1]?.id,
      checkInDate: nextWeek,
      checkOutDate: twoWeeks,
      discountPercent: 35,
      discountAmount: 500.5,
      paymentDeadline: tomorrow,
      reservedAt: now,
      guestName: "Sarah Mwangi",
    },
  });

  // CONFIRMED at Nairobi Skyline
  await prisma.coupon.upsert({
    where: { code: "BB-2026-SARA-CF01" },
    update: {},
    create: {
      subscriptionId: sub2.id,
      userId: guest2.id,
      code: "BB-2026-SARA-CF01",
      status: "CONFIRMED",
      hotelId: hotel5.id,
      roomTypeId: hotel5Rooms[0]?.id,
      checkInDate: nextWeek,
      checkOutDate: twoWeeks,
      discountPercent: 30,
      discountAmount: 252,
      reservedAt: twoDaysAgo,
      confirmedAt: yesterday,
      guestName: "Sarah Mwangi",
    },
  });

  // CONFIRMED at Zanzibar Spice Island
  await prisma.coupon.upsert({
    where: { code: "BB-2026-SARA-CF02" },
    update: {},
    create: {
      subscriptionId: sub2.id,
      userId: guest2.id,
      code: "BB-2026-SARA-CF02",
      status: "CONFIRMED",
      hotelId: hotel8.id,
      roomTypeId: hotel8Rooms[1]?.id,
      checkInDate: twoWeeks,
      checkOutDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      discountPercent: 35,
      discountAmount: 588,
      reservedAt: yesterday,
      confirmedAt: now,
      guestName: "Sarah Mwangi",
    },
  });

  // REDEEMED at Kampala Pearl
  await prisma.coupon.upsert({
    where: { code: "BB-2026-SARA-RD01" },
    update: {},
    create: {
      subscriptionId: sub2.id,
      userId: guest2.id,
      code: "BB-2026-SARA-RD01",
      status: "REDEEMED",
      hotelId: hotel7.id,
      roomTypeId: hotel7Rooms[0]?.id,
      checkInDate: lastWeek,
      checkOutDate: twoDaysAgo,
      discountPercent: 30,
      discountAmount: 462,
      reservedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      confirmedAt: lastWeek,
      redeemedAt: yesterday,
      guestName: "Sarah Mwangi",
    },
  });

  // REDEEMED at Serengeti Lodge
  await prisma.coupon.upsert({
    where: { code: "BB-2026-SARA-RD02" },
    update: {},
    create: {
      subscriptionId: sub2.id,
      userId: guest2.id,
      code: "BB-2026-SARA-RD02",
      status: "REDEEMED",
      hotelId: hotel1.id,
      roomTypeId: hotel1Rooms[2]?.id,
      checkInDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      checkOutDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      discountPercent: 40,
      discountAmount: 2380,
      reservedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      confirmedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      redeemedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      guestName: "Sarah Mwangi",
    },
  });

  // EXPIRED at Lake Victoria
  await prisma.coupon.upsert({
    where: { code: "BB-2026-SARA-EX01" },
    update: {},
    create: {
      subscriptionId: sub2.id,
      userId: guest2.id,
      code: "BB-2026-SARA-EX01",
      status: "EXPIRED",
      hotelId: hotel6.id,
      roomTypeId: hotel6Rooms[1]?.id,
      discountPercent: 35,
      reservedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      guestName: "Sarah Mwangi",
    },
  });

  // CANCELLED at Dar Royal
  await prisma.coupon.upsert({
    where: { code: "BB-2026-SARA-CN01" },
    update: {},
    create: {
      subscriptionId: sub2.id,
      userId: guest2.id,
      code: "BB-2026-SARA-CN01",
      status: "CANCELLED",
      hotelId: hotel2.id,
      roomTypeId: hotel2Rooms[2]?.id,
      discountPercent: 40,
      cancelReason: "Flight cancelled due to weather",
      cancelledAt: yesterday,
      reservedAt: twoDaysAgo,
      guestName: "Sarah Mwangi",
    },
  });

  // 2 more AVAILABLE
  await prisma.coupon.upsert({
    where: { code: "BB-2026-SARA-AV01" },
    update: {},
    create: {
      subscriptionId: sub2.id,
      userId: guest2.id,
      code: "BB-2026-SARA-AV01",
      status: "AVAILABLE",
    },
  });

  await prisma.coupon.upsert({
    where: { code: "BB-2026-SARA-AV02" },
    update: {},
    create: {
      subscriptionId: sub2.id,
      userId: guest2.id,
      code: "BB-2026-SARA-AV02",
      status: "AVAILABLE",
    },
  });

  console.log("Sarah's coupons created (9 total, varied statuses)");

  // --- Guest 3 (David) coupons - STARTER plan with fewer ---
  // RESERVED at Serengeti
  await prisma.coupon.upsert({
    where: { code: "BB-2026-DAVD-RS01" },
    update: {},
    create: {
      subscriptionId: sub3.id,
      userId: guest3.id,
      code: "BB-2026-DAVD-RS01",
      status: "RESERVED",
      hotelId: hotel1.id,
      roomTypeId: hotel1Rooms[0]?.id,
      checkInDate: nextWeek,
      checkOutDate: twoWeeks,
      discountPercent: 30,
      discountAmount: 525,
      paymentDeadline: tomorrow,
      reservedAt: now,
      guestName: "David Ochieng",
    },
  });

  // REDEEMED at Kampala Pearl
  await prisma.coupon.upsert({
    where: { code: "BB-2026-DAVD-RD01" },
    update: {},
    create: {
      subscriptionId: sub3.id,
      userId: guest3.id,
      code: "BB-2026-DAVD-RD01",
      status: "REDEEMED",
      hotelId: hotel7.id,
      roomTypeId: hotel7Rooms[0]?.id,
      checkInDate: lastWeek,
      checkOutDate: twoDaysAgo,
      discountPercent: 30,
      discountAmount: 462,
      reservedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      confirmedAt: lastWeek,
      redeemedAt: yesterday,
      guestName: "David Ochieng",
    },
  });

  // 3 AVAILABLE
  for (let i = 1; i <= 3; i++) {
    await prisma.coupon.upsert({
      where: { code: `BB-2026-DAVD-AV${String(i).padStart(2, "0")}` },
      update: {},
      create: {
        subscriptionId: sub3.id,
        userId: guest3.id,
        code: `BB-2026-DAVD-AV${String(i).padStart(2, "0")}`,
        status: "AVAILABLE",
      },
    });
  }

  console.log("David's coupons created (5 total, varied statuses)");

  // ==========================================
  // 6. CREATE COMMISSION RECORDS
  // ==========================================

  // Commission for John's REDEEMED coupon at Kilimanjaro View
  const johnRedeemedCoupon = await prisma.coupon.findFirst({
    where: { code: "BB-2026-JOHN-RD01" },
  });
  if (johnRedeemedCoupon) {
    await prisma.commissionRecord.upsert({
      where: { couponId: johnRedeemedCoupon.id },
      update: {},
      create: {
        hotelId: hotel3.id,
        couponId: johnRedeemedCoupon.id,
        amount: 47.25, // 15% of 315
        status: "PENDING",
      },
    });
  }

  // Commission for Sarah's REDEEMED coupon at Kampala Pearl
  const sarahRedeemedCoupon1 = await prisma.coupon.findFirst({
    where: { code: "BB-2026-SARA-RD01" },
  });
  if (sarahRedeemedCoupon1) {
    await prisma.commissionRecord.upsert({
      where: { couponId: sarahRedeemedCoupon1.id },
      update: {},
      create: {
        hotelId: hotel7.id,
        couponId: sarahRedeemedCoupon1.id,
        amount: 60.06, // 13% of 462
        status: "COLLECTED",
        collectedAt: yesterday,
      },
    });
  }

  // Commission for Sarah's REDEEMED coupon at Serengeti Lodge
  const sarahRedeemedCoupon2 = await prisma.coupon.findFirst({
    where: { code: "BB-2026-SARA-RD02" },
  });
  if (sarahRedeemedCoupon2) {
    await prisma.commissionRecord.upsert({
      where: { couponId: sarahRedeemedCoupon2.id },
      update: {},
      create: {
        hotelId: hotel1.id,
        couponId: sarahRedeemedCoupon2.id,
        amount: 357, // 15% of 2380
        status: "PENDING",
      },
    });
  }

  console.log("Commission records created");

  // ==========================================
  // 7. CREATE NOTIFICATIONS
  // ==========================================

  await prisma.notification.createMany({
    data: [
      {
        userId: guest1.id,
        channel: "SMS",
        message: "Your coupon BB-2026-JOHN-CF01 has been confirmed at Dar Royal Beach Resort. Check-in: " + nextWeek.toLocaleDateString("en-GB"),
        status: "SENT",
        sentAt: yesterday,
      },
      {
        userId: guest1.id,
        channel: "IN_APP",
        message: "Your coupon BB-2026-JOHN-RS01 has been reserved at Serengeti Luxury Lodge. Payment deadline: " + tomorrow.toLocaleDateString("en-GB"),
        status: "PENDING",
      },
      {
        userId: guest2.id,
        channel: "SMS",
        message: "Your coupon BB-2026-SARA-CF01 has been confirmed at Nairobi Skyline Hotel.",
        status: "SENT",
        sentAt: yesterday,
      },
      {
        userId: guest2.id,
        channel: "WHATSAPP",
        message: "Welcome to BusyBeds Premium! Enjoy unlimited coupon bookings across East Africa.",
        status: "SENT",
        sentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });

  console.log("Notifications created");

  console.log("\n==========================================");
  console.log("SEEDING COMPLETED SUCCESSFULLY!");
  console.log("==========================================");
  console.log("\nDemo Accounts (all passwords: password123):");
  console.log("  Admin:     admin@busybeds.com");
  console.log("  Guest 1:   john@busybeds.com (STANDARD)");
  console.log("  Guest 2:   sarah@busybeds.com (PREMIUM)");
  console.log("  Guest 3:   david@busybeds.com (STARTER)");
  console.log("  Guest 4:   aisha@busybeds.com (No subscription)");
  console.log("  Staff:     serengeti@busybeds.com");
  console.log("  Staff:     staff@darroyal.co.tz");
  console.log("  Staff:     staff@kilimanjaroview.co.tz");
  console.log("  Staff:     staff@maasaimaracamp.ke");
  console.log("  Staff:     staff@nairobiskyline.ke");
  console.log("  Staff:     staff@victoriaserenity.co.tz");
  console.log("  Staff:     staff@kampalapearl.ug");
  console.log("  Staff:     staff@spiceisland.co.tz");
  console.log("\nHotels:");
  console.log("  1. Serengeti Luxury Lodge - Arusha, Tanzania (5-star)");
  console.log("  2. Dar Royal Beach Resort - Dar es Salaam, Tanzania (5-star)");
  console.log("  3. Kilimanjaro View Hotel - Arusha, Tanzania (4-star)");
  console.log("  4. Maasai Mara Safari Camp - Narok, Kenya (5-star)");
  console.log("  5. Nairobi Skyline Hotel - Nairobi, Kenya (4-star)");
  console.log("  6. Lake Victoria Serenity Resort - Mwanza, Tanzania (4-star)");
  console.log("  7. Kampala Pearl Hotel - Kampala, Uganda (5-star)");
  console.log("  8. Zanzibar Spice Island Resort - Zanzibar, Tanzania (5-star)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
