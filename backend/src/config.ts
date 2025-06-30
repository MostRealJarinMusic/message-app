import dotenv from "dotenv";
dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET || "supersecret",
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
};
