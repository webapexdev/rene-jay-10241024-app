import type { z } from "zod";
import { BookingSchema } from "@/lib/booking/schemas";

export { BookingSchema } from "@/lib/booking/schemas";

export const submitBooking = async (
  data: z.infer<typeof BookingSchema>,
) => {
  await new Promise((r) => setTimeout(r, 400));
  return {
    ok: true,
    confirmationId: `BK-${Date.now().toString(36).toUpperCase()}`,
    received: data,
  };
};
