"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  ArrowRight,
  Hourglass,
  Calendar as CalendarIcon,
  Clock,
  User,
  AtSign,
  Hash,
  Gauge,
} from "lucide-react";
import { Field } from "@/components/Field";
import {
  PlaceAutocomplete,
  type PlaceValue,
} from "@/components/PlaceAutocomplete";
import { Toggle } from "@/components/Toggle";
import { UsFlag } from "@/components/UsFlag";
import { openPicker } from "@/lib/open-picker";

type TripType = "one-way" | "hourly";
type Kind = "location" | "airport";

const ContactSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
});

export function BookingForm() {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const [trip, setTrip] = useState<TripType>("one-way");
  const [date, setDate] = useState("2023-05-13");
  const [time, setTime] = useState("15:00");
  const [pickupKind, setPickupKind] = useState<Kind>("location");
  const [pickup, setPickup] = useState<PlaceValue | null>(null);
  const [stops, setStops] = useState<Array<PlaceValue | null>>([]);
  const [dropKind, setDropKind] = useState<Kind>("location");
  const [drop, setDrop] = useState<PlaceValue | null>(null);

  const [phone, setPhone] = useState("");
  const [phoneState, setPhoneState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "known"; firstName: string; lastName: string; email: string }
    | { status: "unknown" }
  >({ status: "idle" });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [passengers, setPassengers] = useState("");

  const [route, setRoute] = useState<{
    distanceMiles: number;
    durationText: string;
  } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

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
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setEmail(data.email);
        } else {
          setPhoneState({ status: "unknown" });
        }
      } catch {
        setPhoneState({ status: "unknown" });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [phone]);

  useEffect(() => {
    if (!pickup || !drop) {
      setRoute(null);
      setRouteError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/compute-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originPlaceId: pickup.placeId,
            destinationPlaceId: drop.placeId,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Route computation failed");
        }
        const r = await res.json();
        if (!cancelled) {
          setRoute({
            distanceMiles: r.distanceMiles,
            durationText: r.durationText,
          });
          setRouteError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setRoute(null);
          setRouteError((e as Error).message);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pickup, drop]);

  const greeting = useMemo(() => {
    if (phoneState.status === "known")
      return `Welcome back, ${phoneState.firstName}!`;
    return "Let's get you on your way!";
  }, [phoneState]);

  const tripToggleOptions = useMemo(
    () => [
      {
        value: "one-way",
        label: "One-way",
        icon: (
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${trip === "one-way" ? "bg-brand text-brand-foreground" : "border border-muted-foreground/35 text-muted-foreground"}`}
          >
            <ArrowRight className="h-3 w-3" />
          </span>
        ),
      },
      {
        value: "hourly",
        label: "Hourly",
        icon: (
          <Hourglass
            className={`h-4 w-4 ${trip === "hourly" ? "text-brand" : "text-muted-foreground"}`}
          />
        ),
      },
    ],
    [trip],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmation(null);
    const errs: Record<string, string> = {};
    if (!date) errs.date = "Required";
    if (!time) errs.time = "Required";
    if (!pickup) errs.pickup = "Select a pickup location";
    if (!drop) errs.drop = "Select a drop off location";
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    if (cleanPhone.length < 8) errs.phone = "Enter a valid phone number";
    const pax = parseInt(passengers, 10);
    if (!pax || pax < 1 || pax > 50) errs.passengers = "1-50";
    if (phoneState.status !== "known") {
      const parsed = ContactSchema.safeParse({ firstName, lastName, email });
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          errs[issue.path[0] as string] = issue.message;
        }
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripType: trip,
          pickupDate: date,
          pickupTime: time,
          pickupKind,
          pickupAddress: pickup!.address,
          stops: stops
            .filter((s): s is PlaceValue => !!s)
            .map((s) => s.address),
          dropoffKind: dropKind,
          dropoffAddress: drop!.address,
          phone: cleanPhone,
          firstName,
          lastName,
          email,
          passengers: pax,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          typeof err.error === "string" ? err.error : "Submission failed",
        );
      }
      const data = await res.json();
      setConfirmation(data.confirmationId);
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 px-4 py-5">
          <Gauge className="h-7 w-7 text-logo" />
          <span className="text-2xl font-extrabold tracking-tight text-logo-dark">
            Example<span className="text-logo">IQ</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-semibold">{greeting}</h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-7">
          <Toggle
            options={tripToggleOptions}
            value={trip}
            onChange={(v) => setTrip(v as TripType)}
          />

          <section>
            <h2 className="mb-2 text-lg font-bold">Pickup</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Field
                label=""
                icon={<CalendarIcon className="h-4 w-4" />}
                onIconClick={() => openPicker(dateInputRef.current)}
                iconAriaLabel="Open date picker"
                className="min-w-0 flex-1"
                error={errors.date}
              >
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="hide-native-date-picker-icon w-full min-w-0 max-w-full bg-transparent text-sm text-brand outline-none"
                />
              </Field>
              <Field
                label=""
                icon={<Clock className="h-4 w-4" />}
                onIconClick={() => openPicker(timeInputRef.current)}
                iconAriaLabel="Open time picker"
                className="w-full shrink-0 sm:w-36"
                error={errors.time}
              >
                <input
                  ref={timeInputRef}
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="hide-native-time-picker-icon w-full min-w-0 max-w-full bg-transparent text-sm text-brand outline-none"
                />
              </Field>
            </div>
            <div className="mt-4">
              <Toggle
                small
                options={[
                  { value: "location", label: "Location" },
                  { value: "airport", label: "Airport" },
                ]}
                value={pickupKind}
                onChange={(v) => setPickupKind(v as Kind)}
              />
            </div>
            <div className="mt-3">
              <PlaceAutocomplete
                label="Location"
                kind={pickupKind}
                value={pickup}
                onChange={setPickup}
                placeholder="Search address or place"
                error={errors.pickup}
              />
            </div>

            {stops.map((s, i) => (
              <div className="mt-3" key={i}>
                <div className="mb-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setStops(stops.filter((_, idx) => idx !== i))
                    }
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
                <PlaceAutocomplete
                  label={`Stop ${i + 1}`}
                  kind="location"
                  value={s}
                  onChange={(v) =>
                    setStops(stops.map((it, idx) => (idx === i ? v : it)))
                  }
                  placeholder="Stop address"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setStops([...stops, null])}
              className="mt-3 text-sm font-medium text-brand hover:underline"
            >
              + Add a stop
            </button>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold">Drop off</h2>
            <Toggle
              small
              options={[
                { value: "location", label: "Location" },
                { value: "airport", label: "Airport" },
              ]}
              value={dropKind}
              onChange={(v) => setDropKind(v as Kind)}
            />
            <div className="mt-3">
              <PlaceAutocomplete
                label="Location"
                kind={dropKind}
                value={drop}
                onChange={setDrop}
                placeholder="Search address or place"
                error={errors.drop}
              />
            </div>
          </section>

          {(route || routeError) && (
            <div className="rounded-md border border-brand/30 bg-brand-soft px-4 py-3 text-sm">
              {route ? (
                <span>
                  <strong>{route.distanceMiles} mi</strong> · approx{" "}
                  <strong>{route.durationText}</strong> driving
                </span>
              ) : (
                <span className="text-destructive">
                  Couldn&apos;t compute route: {routeError}
                </span>
              )}
            </div>
          )}

          <section>
            <h2 className="mb-2 text-lg font-bold">Contact Information</h2>
            <Field label="" icon={<UsFlag />} error={errors.phone}>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/[^\d+]/g, ""))
                }
                placeholder="+1 555 123 4567"
                className="w-full bg-transparent text-sm text-brand outline-none"
              />
            </Field>
            {phoneState.status === "loading" && (
              <p className="mt-2 text-xs text-muted-foreground">Checking…</p>
            )}
            {phoneState.status === "unknown" && (
              <>
                <p className="mt-2 text-xs text-muted-foreground">
                  We don&apos;t have that phone number on file. Please provide
                  additional contact information.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label="First name"
                    icon={<User className="h-4 w-4" />}
                    error={errors.firstName}
                  >
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </Field>
                  <Field
                    label="Last name"
                    icon={<User className="h-4 w-4" />}
                    error={errors.lastName}
                  >
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field
                    label="Email"
                    icon={<AtSign className="h-4 w-4" />}
                    error={errors.email}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </Field>
                </div>
              </>
            )}
            {phoneState.status === "known" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Signed in as {firstName} {lastName} ({email}).
              </p>
            )}
          </section>

          <section>
            <p className="mb-2 text-sm">
              How many passengers are expected for the trip?
            </p>
            <div className="w-1/2">
              <Field
                label="# Passengers"
                icon={<Hash className="h-4 w-4" />}
                error={errors.passengers}
              >
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </Field>
            </div>
          </section>

          {errors.submit && (
            <p className="text-sm text-destructive">{errors.submit}</p>
          )}
          {confirmation && (
            <div className="rounded-md border border-green-500/30 bg-green-50 px-4 py-3 text-sm text-green-900">
              Booking confirmed! Reference: <strong>{confirmation}</strong>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-brand py-3 text-base font-semibold text-brand-foreground shadow-sm transition hover:brightness-95 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Continue"}
          </button>
        </form>
      </main>
    </div>
  );
}
