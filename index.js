import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // ✅ Allow all origins
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World with CORS 🚀");
});

app.get("/api", (req, res) => {
  res.json({ message: "CORS enabled for all origins" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});