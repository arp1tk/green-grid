import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

// GET /api/booking?equipmentId=xxx
export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const equipmentId = searchParams.get("equipmentId");

  let query: any = {};

  if (equipmentId) {
    query.equipmentId = equipmentId;
  }

  const bookings = await Booking.find(query).sort({ startDate: -1 });

  return Response.json(bookings);
}

// POST /api/booking
export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const booking = await Booking.create(body);

  return Response.json(booking);
}