import { UserSignature } from "@common/types";
import { Request } from "express-serve-static-core";

//Local extension
export interface SignedRequest extends Request {
  signature: UserSignature;
}
