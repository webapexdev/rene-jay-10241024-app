import { z } from "zod";

export const tripTypeSchema = z.enum(["one-way", "hourly"]);
export const placeKindSchema = z.enum(["location", "airport"]);

const phoneDigits = z
  .string()
  .min(7)
  .max(20)
  .regex(/^[+0-9 ()-]+$/);

export const LookupPhoneInput = z.object({
  phone: phoneDigits,
});

export const ComputeRouteInput = z.object({
  originPlaceId: z.string().min(1).max(255),
  destinationPlaceId: z.string().min(1).max(255),
});

const bookingFirstName = z.string().min(1).max(100);
const bookingLastName = z.string().min(1).max(100);
const bookingEmail = z.string().email().max(255);

export const BookingSchema = z.object({
  tripType: tripTypeSchema,
  pickupDate: z.string().min(1).max(20),
  pickupTime: z.string().min(1).max(20),
  pickupKind: placeKindSchema,
  pickupAddress: z.string().min(1).max(500),
  stops: z.array(z.string().min(1).max(500)).max(5),
  dropoffKind: placeKindSchema,
  dropoffAddress: z.string().min(1).max(500),
  phone: z.string().min(7).max(20),
  firstName: bookingFirstName,
  lastName: bookingLastName,
  email: bookingEmail,
  passengers: z.number().int().min(1).max(50),
});

/** Client-side contact fields (trim + friendly error messages). */
export const ContactSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
});
