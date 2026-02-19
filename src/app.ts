import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/NotFound";

const app = express();
app.use(cors({origin: ['http://localhost:8080', 'https://parcel-stride.vercel.app']}));
app.use(express.json());
// app.use(cors())

app.use("/api/v1", router);

app.get("/", (req:Request, res: Response) => {
  res.status(200).json({message: "Welcome to the HR Management server!"});
});

app.use(globalErrorHandler)
app.use(notFound)

export default app;