import { Express } from "express";
import express, { NextFunction, Request, Response } from "express";
// import cors from "cors";
// import morgan from "morgan";
import { AppError } from "../pms_api/src/utils/appError";
import { errorHandler } from "../pms_api/src/middlewares/error.middleware";
import { priceRouter } from "../price_pref/routes/price.routes";
import pmsRoutes from "../pms_api/src/api";
import authRouter from "../authentication/src/routes/auth.route";
import userRouter from "../authentication/src/routes/user.route";
import bookingRouter from "../booking_engine/src/routes/booking.routes";
import paymentRouter from "../payment/src/routes/payment.route";
import searchRouter from "../search-engine/src/routes/search";
import amadeusRouter from "../amadeus/routes/hotels.routes";
// import { getHotelsByCity } from "../amadeus/index";

export async function initializeExpressRoutes({ app }: { app: Express }) {
  app.head("/status", (req: Request, res: Response) => {
    res.status(200).end();
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/pms", pmsRoutes());
  app.use("/api/v1/price", priceRouter);
  app.use("/api/v1/booking", bookingRouter);
  //   app.use("/api/v1/payment", paymentRouter);
  app.use("/api/v1/search", searchRouter);
  app.use("/api/v1/amadeus", amadeusRouter)

  // app.use("/api/v1/hotels/by-city/:cityCode", getHotelsByCity);

  //   app.use("/api/v1/amenite", ameniteRouter);
  //   app.use("/api/v1/property", propertyRouter);
  //   app.use("/api/v1/upload", uploadRouter);
  //    app.use("/api/v1/room", roomRouter);

  app.all("*", (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} path on the server`, 404));
  });

  app.use(errorHandler);
}
