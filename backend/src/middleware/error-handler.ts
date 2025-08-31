import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err.status) {
    console.log(err);

    res.status(err.status).json({ message: (err as Error).message });
    return;
  }

  console.error("Unexpected error: ", err);
  res.status(500).json({ error: "Internal Server Error" });
};
