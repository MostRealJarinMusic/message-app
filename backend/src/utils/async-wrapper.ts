import { NextFunction, Request, Response } from "express";
import { SignedRequest } from "../types/types";

export const asyncHandler = (
  fn: (req: SignedRequest, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: SignedRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
