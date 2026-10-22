import { Request, Response, NextFunction } from "express";
import { QueryFailedError } from "typeorm";
import { HttpError } from "./validateParams";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  const bodyError = err as Error & { type?: string };
  if (bodyError.type === "entity.parse.failed") {
    res.status(400).json({ message: "Invalid JSON body" });
    return;
  }
  if (bodyError.type === "entity.too.large") {
    res.status(413).json({ message: "Request body is too large" });
    return;
  }
  if (err instanceof QueryFailedError) {
    const code = (err.driverError as { code?: string }).code;
    if (code === "23505") {
      res.status(409).json({ message: "Email already registered" });
      return;
    }
    if (code === "23503") {
      res.status(422).json({ message: "Referenced situation or category does not exist" });
      return;
    }
  }
  console.error(err.message);
  res.status(500).json({ message: "Internal server error" });
}
