import { createValidatedPostHandler } from "@/lib/api/validated-post";
import { LookupPhoneInput, lookupPhone } from "@/lib/booking/lookup-phone";

export const POST = createValidatedPostHandler(LookupPhoneInput, lookupPhone);
