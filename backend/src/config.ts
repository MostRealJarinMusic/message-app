import dotenv from "dotenv";
dotenv.config();

export const config = {
  accessJwtSecret: process.env.ACCESS_JWT_SECRET || "supersecret",
  refreshJwtSecret: process.env.REFRESH_JWT_SECRET || "reallysecret",
  port: Number(process.env.PORT) || 3000,
};
