import { Request, Response, NextFunction } from "express";

const requestCounts = new Map<string, { count: number; resetTime: number }>();

const a_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
const a_REQUEST_LIMIT = 5;

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip;

  if (!ip) {
    res.status(400).send("Nie można zidentyfikować adresu IP.");
    return;
  }

  const now = Date.now();
  const userData = requestCounts.get(ip);

  if (
    userData &&
    userData.count >= a_REQUEST_LIMIT &&
    now < userData.resetTime
  ) {
    res
      .status(429)
      .send("Przekroczono limit darmowych konsultacji w tym miesiącu.");
    return;
  }

  if (!userData || now >= userData.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + a_MONTH_IN_MS,
    });
  } else {
    userData.count++;
  }

  next();
};
