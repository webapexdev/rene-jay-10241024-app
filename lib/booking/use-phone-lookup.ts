"use client";

import { useEffect, useState } from "react";

export type PhoneLookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "known"; firstName: string; lastName: string; email: string }
  | { status: "unknown" };

type KnownContact = {
  firstName: string;
  lastName: string;
  email: string;
};

export const usePhoneLookup = (
  phone: string,
  onKnownContact: (contact: KnownContact) => void,
) => {
  const [phoneState, setPhoneState] = useState<PhoneLookupState>({
    status: "idle",
  });

  useEffect(() => {
    const digits = phone.replace(/[^\d+]/g, "");
    if (digits.length < 8) {
      setPhoneState({ status: "idle" });
      return;
    }
    setPhoneState({ status: "loading" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/lookup-phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: digits }),
        });
        if (!res.ok) throw new Error("Lookup failed");
        const data = await res.json();
        if (data.known) {
          setPhoneState({
            status: "known",
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          });
          onKnownContact({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          });
        } else {
          setPhoneState({ status: "unknown" });
        }
      } catch {
        setPhoneState({ status: "unknown" });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [phone, onKnownContact]);

  return { phoneState };
};
