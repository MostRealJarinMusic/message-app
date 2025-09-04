import { UserSignature } from "@common/types";
import { Request } from "express";

//Local extension
export interface SignedRequest extends Request {
  signature?: UserSignature;
}
