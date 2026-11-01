import mongoose from "mongoose";
import { Router } from "express";
import { successResponse } from "../../shared/api.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.status(200).json(
    successResponse({
      status: "ok",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    }),
  );
});
