import { Express, NextFunction, Request, Response } from "express";
import { AppError } from "../pms_api/src/utils/appError";
import { errorHandler } from "../pms_api/src/middlewares/error.middleware";

// route imports
import authRouter from "../authentication/src/routes/auth.route";
import pmsRoutes from "../pms_api/src/api";
import userRouter from "../authentication/src/routes/user.route";
import bookingRouter from "../booking_engine/src/routes/booking.routes";
import searchRouter from "../search-engine/src/routes/search";

// route imports for amadeus ota
import amadeusRouter from "../amadeus/routes/hotels.routes";
import paymentRouter from "../amadeus/routes/payment.routes";

// route imports for amadeus airline
// import authRoutes from "../amadeus airline/routes/auth.routes";
import flightRoutes from "../amadeus airline/routes/flight.routes";
import orderRoutes from "../amadeus airline/routes/order.routes";
import locationRoutes from "../amadeus airline/routes/location.routes";

export async function initializeExpressRoutes({ app }: { app: Express }) {
  app.head("/status", (_, res: Response) => res.status(200).end());

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/pms", pmsRoutes());
  app.use("/api/v1/booking", bookingRouter);
  app.use("/api/v1/payment", paymentRouter);
  app.use("/api/v1/search", searchRouter);
  // amadeus ota routes
  app.use("/api/v1/amadeus", amadeusRouter)
  // airline routes
  app.use("/api/v1/airline/locations", locationRoutes);
  app.use("/api/v1/airline/flights", flightRoutes);
  app.use("/api/v1/airline/orders", orderRoutes);


  app.all("*", (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} path on the server`, 404));
  });

  app.use(errorHandler);
}
