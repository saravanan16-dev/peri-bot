import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getResponse } from "./chatbot.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/chat", async (req, res) => {
  const userInput = req.body.message || "";
  try {
    const reply = await getResponse(userInput);
    res.json({ response: reply });
  } catch (err) {
    res.status(500).json({ response: `❌ Internal error: ${err.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
