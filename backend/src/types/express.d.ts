import { UserSignature } from "../../../common/types";

declare module "express" {
  interface Request {
    signature?: UserSignature;
  }
}
