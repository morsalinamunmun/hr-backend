import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/NotFound";

const app = express();

// app.use(cors({
//   origin: ["http://localhost:8080", "https://hr.tramessy.com/"], 
//   credentials: true,
//   // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   // allowedHeaders: ["Content-Type", "Authorization"]
// }));
// const allowedOrigins = [
//   "http://localhost:8080",
//   "https://hr.tramessy.com"
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true); // postman/server allow
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error("CORS not allowed"), false);
//   },
//   credentials: true
// }));
app.use(cors({
  origin: true, // 🔥 allow all dynamically
  credentials: true
}));
// 🔥 MUST: manual OPTIONS handler
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
// app.options("*", cors());
// app.use(cors({origin: ['http://localhost:8080', 'https://parcel-stride.vercel.app']}));
app.use(express.json());
// app.use(cors())
// app.options("*", cors());
app.use("/api/v1", router);
// app.get("/test", (req, res) => {
//   res.json({ message: "Live server running latest code!" });
// });
app.get("/", (req:Request, res: Response) => {
  res.status(200).json({message: "Welcome to the HR Management server!"});
});

app.use(globalErrorHandler)
app.use(notFound)

export default app;