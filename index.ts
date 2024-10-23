import { connect } from "mongoose";
import config from "./common/index";
import { app } from "./app";
import { initializeExpressRoutes } from "./common/express";

initializeExpressRoutes({ app }).then(async () => {
  try {
    const connection = await connect(process.env.MONGO_URI as string);
    console.log(
      `🏡 Database successfully running on ${connection.connection.host}`
    );

    app.listen(config.port, () => {
      console.log(`🏡 Server is running on port ${config.port}`);
    });

  } catch (err) {
    console.log(`Error: ${err}`);
  }
});