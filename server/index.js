import express from "express";
import "dotenv/config";
import { handleApi } from "./handler.js";
const app = express();
app.use(express.json({ limit: "20kb" }));
app.use("/api", handleApi);
const port = Number(process.env.PORT) || 3001;
app.listen(port, () =>
  console.log(`JourneyCraft API running at http://localhost:${port}`),
);
