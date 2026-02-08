import { Data } from "effect";

export class DatabaseError extends Data.TaggedError("DatabaseContextError")<{
  readonly message: string;
  readonly cause?: unknown;
  readonly service: string;
}> {}
