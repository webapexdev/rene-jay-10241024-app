import { createValidatedPostHandler } from "@/lib/api/validated-post";
import { ComputeRouteInput, computeRoute } from "@/lib/booking/compute-route";

export const POST = createValidatedPostHandler(ComputeRouteInput, computeRoute);
