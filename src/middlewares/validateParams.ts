import { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function positiveInteger(value: unknown, max: number): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, "Expected a positive integer");
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number > max) {
    throw new HttpError(400, `Value must be at most ${max}`);
  }
  return number;
}

export function validateId(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    positiveInteger(req.params.id, 2147483647);
    next();
  } catch (error) {
    next(error);
  }
}

export function parsePagination(query: Request["query"]): {
  page: number;
  limit: number;
} {
  const page =
    query.page === undefined ? 1 : positiveInteger(query.page, 21474836);
  const limit =
    query.limit === undefined ? 10 : positiveInteger(query.limit, 100);
  return { page, limit };
}
