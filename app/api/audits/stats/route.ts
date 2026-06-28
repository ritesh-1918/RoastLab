import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserStats } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = await getUserStats(user.id);
  return NextResponse.json(stats);
}
