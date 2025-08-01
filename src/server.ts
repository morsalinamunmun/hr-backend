import mongoose from "mongoose";

import { Server } from "http";
import app from "./app";
import { promise } from "zod";
import { hasUncaughtExceptionCaptureCallback } from "process";
import { envVars } from "./app/config/env";

const uri = "mongodb+srv://morsalinamunmun:glSVrWxooBKqO4b6@cluster0.ddlqajr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to MongoDB");
    
    server = app.listen(envVars.PORT, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
startServer();

// process.on("unhandledRejection", (error) => {
//   console.error("Unhandled Rejection:", error);
//   if (server) {
//     server.close(() => {
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// }
// );

// process.on("uncaughtException", (error) => {
//   console.error("Uncaught Exception:", error);
//   if (server) {
//     server.close(() => {
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// });
