import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Equipment from "@/models/Equipment";

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

  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return Response.json({ message: "Invalid booking payload." }, { status: 400 });
  }

  const { equipmentId, userName, startDate, endDate } = body as {
    equipmentId?: string;
    userName?: string;
    startDate?: string;
    endDate?: string;
  };

  if (!equipmentId || !userName || !startDate || !endDate) {
    return Response.json(
      { message: "Equipment, name, start date, and end date are required." },
      { status: 400 }
    );
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
    return Response.json({ message: "Booking dates are invalid." }, { status: 400 });
  }

  if (parsedEndDate < parsedStartDate) {
    return Response.json(
      { message: "End date must be on or after the start date." },
      { status: 400 }
    );
  }

  const equipment = await Equipment.findById(equipmentId);

  if (!equipment) {
    return Response.json({ message: "Equipment not found." }, { status: 404 });
  }

  const conflictingBooking = await Booking.findOne({
    equipmentId,
    startDate: { $lte: parsedEndDate },
    endDate: { $gte: parsedStartDate },
  }).sort({ startDate: -1 });

  if (conflictingBooking) {
    return Response.json(
      {
        message: `This equipment is already booked from ${new Date(
          conflictingBooking.startDate
        ).toLocaleDateString()} to ${new Date(conflictingBooking.endDate).toLocaleDateString()}. Choose another date range.`,
        conflict: {
          startDate: conflictingBooking.startDate,
          endDate: conflictingBooking.endDate,
          userName: conflictingBooking.userName,
        },
      },
      { status: 409 }
    );
  }

  const booking = await Booking.create({
    equipmentId,
    userName: userName.trim(),
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    status: "active",
  });

  await Equipment.findByIdAndUpdate(equipmentId, {
    status: "in_use",
  });

  return Response.json(booking);
}