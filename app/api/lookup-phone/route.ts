import { NextResponse } from "next/server";
import { LookupPhoneInput, lookupPhone } from "@/lib/booking/lookup-phone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LookupPhoneInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const result = await lookupPhone(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
