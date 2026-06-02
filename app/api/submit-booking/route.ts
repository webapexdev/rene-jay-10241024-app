import { createValidatedPostHandler } from "@/lib/api/validated-post";
import { BookingSchema, submitBooking } from "@/lib/booking/submit-booking";

export const POST = createValidatedPostHandler(BookingSchema, submitBooking);
