import { NextResponse } from "next/server";
import { BookingSchema, submitBooking } from "@/lib/booking/submit-booking";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = BookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const result = await submitBooking(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
