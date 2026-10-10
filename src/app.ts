import express from "express";
import authRoutes from "./auth/routes";
import workspaceRoutes from "./workspace/routes";
import channelRoutes from "./channel/routes";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/auth", authRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/workspaces", channelRoutes);

export default app;
