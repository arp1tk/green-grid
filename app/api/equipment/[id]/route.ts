import { connectDB } from "@/lib/db";
import Equipment from "@/models/Equipment";


export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const equipment = await Equipment.findById(params.id);

  if (!equipment) {
    return new Response("Equipment not found", { status: 404 });
  }

  return Response.json(equipment);
}