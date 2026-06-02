import { NextResponse } from "next/server";
import { ComputeRouteInput, computeRoute } from "@/lib/booking/compute-route";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ComputeRouteInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const result = await computeRoute(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
