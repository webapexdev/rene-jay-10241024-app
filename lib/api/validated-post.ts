import { NextResponse } from "next/server";
import type { z } from "zod";

export const createValidatedPostHandler = <T extends z.ZodType>(
  schema: T,
  handler: (data: z.infer<T>) => Promise<unknown>,
) => {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.flatten() },
          { status: 400 },
        );
      }
      const result = await handler(parsed.data);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 },
      );
    }
  };
};
