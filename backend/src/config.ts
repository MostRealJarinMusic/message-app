import dotenv from "dotenv";
dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET || "supersecret",
  port: Number(process.env.PORT) || 3000,
};
