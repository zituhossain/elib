import express from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();

// Routes
app.get("/", (req, res, next) => {
  res.json({ message: "welcome to elib" });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
