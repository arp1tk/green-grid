import { connectDB } from "@/lib/db";
import Equipment from "@/models/Equipment";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  let query: any = {};

  // Partial/substring matching on name and description
  if (search) {
    const searchRegex = { $regex: search, $options: "i" }; 
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (status) {
    query.status = status;
  }

  const equipment = await Equipment.find(query).sort({ createdAt: -1 });

  return Response.json(equipment);
}

// 🔹 POST /api/equipment (create)
export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const equipment = await Equipment.create(body);

  return Response.json(equipment);
}