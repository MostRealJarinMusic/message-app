import { UserSignature } from "../common/types";
import * as express from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      signature?: UserSignature;
    }
  }
}
