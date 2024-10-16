import express, { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { AppError } from "./utils/appError";
import { errorHandler } from "./utils/errorHandler";
import userRouter from "./routes/user.route";

config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

const PORT = process.env.PORT;
const DB = process.env.MONGO_URI;

app.use("/api/v1/user", userRouter);

app.all("*", (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} path on the server`, 404));
});

app.use(errorHandler);

export { app, PORT, DB };
