import { z } from "zod";

export const BookingSchema = z.object({
  tripType: z.enum(["one-way", "hourly"]),
  pickupDate: z.string().min(1).max(20),
  pickupTime: z.string().min(1).max(20),
  pickupKind: z.enum(["location", "airport"]),
  pickupAddress: z.string().min(1).max(500),
  stops: z.array(z.string().min(1).max(500)).max(5),
  dropoffKind: z.enum(["location", "airport"]),
  dropoffAddress: z.string().min(1).max(500),
  phone: z.string().min(7).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  passengers: z.number().int().min(1).max(50),
});

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
