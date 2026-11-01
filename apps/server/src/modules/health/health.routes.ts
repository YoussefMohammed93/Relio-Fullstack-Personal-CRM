import mongoose from "mongoose";
import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    data: {
      status: "ok",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
  });
});
