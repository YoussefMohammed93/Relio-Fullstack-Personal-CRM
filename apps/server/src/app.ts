import crypto from "node:crypto";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { usersRouter } from "./modules/auth/users.routes.js";
import { requireAuthentication } from "./modules/auth/auth.middleware.js";
import { createCompanyLogoRouter } from "./modules/uploads/company-logo.routes.js";

const corsOrigins = env.CLIENT_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      message: "Too many requests. Please try again later.",
    },
  },
});

export const app = express();

app.disable("x-powered-by");
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(helmet());
app.use(
  cors({
    origin:
      corsOrigins.length > 1 ? corsOrigins : (corsOrigins[0] ?? env.CLIENT_ORIGIN),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use((request, response, next) => {
  response.setHeader("X-Request-Id", crypto.randomUUID());
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api", apiLimiter);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/uploads/company-logo", createCompanyLogoRouter(requireAuthentication));
app.use(notFoundHandler);
app.use(errorHandler);
