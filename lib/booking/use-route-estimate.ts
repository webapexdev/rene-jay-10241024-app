"use client";

import { useEffect, useState } from "react";
import type { PlaceValue } from "@/lib/booking/types";

export type RouteEstimate = {
  distanceMiles: number;
  durationText: string;
};

export const useRouteEstimate = (
  pickup: PlaceValue | null,
  drop: PlaceValue | null,
) => {
  const [route, setRoute] = useState<RouteEstimate | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

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

  return { route, routeError };
};
