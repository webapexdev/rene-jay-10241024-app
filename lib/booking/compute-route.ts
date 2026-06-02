import type { z } from "zod";
import { ComputeRouteInput } from "@/lib/booking/schemas";

export { ComputeRouteInput } from "@/lib/booking/schemas";

const GOOGLE_ROUTES_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

const formatDuration = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m} min`;
};

const parseRouteResponse = (json: {
  routes?: { distanceMeters: number; duration: string }[];
}) => {
  const r = json.routes?.[0];
  if (!r) throw new Error("No route found");
  const seconds = parseInt(r.duration.replace("s", ""), 10) || 0;
  return {
    distanceMeters: r.distanceMeters,
    distanceMiles: +(r.distanceMeters / 1609.344).toFixed(1),
    durationSeconds: seconds,
    durationText: formatDuration(seconds),
  };
};

export const computeRoute = async (
  data: z.infer<typeof ComputeRouteInput>,
) => {
  const serverKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!serverKey) {
    throw new Error(
      "Missing GOOGLE_MAPS_API_KEY (set in Vercel env vars for deployment)",
    );
  }

  const res = await fetch(GOOGLE_ROUTES_URL, {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": serverKey,
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      origin: { placeId: data.originPlaceId },
      destination: { placeId: data.destinationPlaceId },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Routes API ${res.status}: ${text}`);
  }
  return parseRouteResponse(await res.json());
};
