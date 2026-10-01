import express from "express";
import authRoutes from "./auth/routes";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/auth", authRoutes);

export default app;
