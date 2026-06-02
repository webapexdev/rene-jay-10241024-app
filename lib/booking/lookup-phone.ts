import type { z } from "zod";
import { LookupPhoneInput } from "@/lib/booking/schemas";

export { LookupPhoneInput } from "@/lib/booking/schemas";

const KNOWN_PHONES: Record<
  string,
  { firstName: string; lastName: string; email: string }
> = {
  "+17744153244": {
    firstName: "Jordan",
    lastName: "Reed",
    email: "jordan@example.com",
  },
  "+15551234567": {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  },
};

export const lookupPhone = async (
  data: z.infer<typeof LookupPhoneInput>,
) => {
  const normalized = data.phone.replace(/[^\d+]/g, "");
  const match = KNOWN_PHONES[normalized];
  if (match) return { known: true as const, ...match };
  return { known: false as const };
};
