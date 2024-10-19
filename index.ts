import { connect } from "mongoose";
import config from "./common/index";
import { app } from "./app";
import elasticClient from "./search-engine/src/service/elasticsearch";
import { createPropertyIndexAndDoc } from "./search-engine/src/sync_controllers/syncData";
import { Room } from "./pms_api/src/model/room.model";
import { initializeExpressRoutes } from "./common/express";
// import elasticClient from "./service/elastic_search";
// import exressLoader from "../server/pms_api/src/loaders/express"

// async function checkElasticClient() {
//   try {
//     // Check if Elasticsearch is reachable
//     // console.log("connecting to elastic search")
//     const health = await elasticClient().cluster.health();
//     console.log(
//       `Elasticsearch connection successful clusterHealth: ${health?.status}`
//     );
//   } catch (error: any) {
//     // res.status(500).json({ message: 'Error connecting to Elasticsearch', error: error.message });
//     console.log({
//       message: "Error connecting to Elasticsearch",
//       error: error.message,
//     });
//   }
// }

initializeExpressRoutes({ app }).then(async () => {
  try {
    const connection = await connect(process.env.MONGO_URI as string);
    console.log(
      `🏡 Database successfully running on ${connection.connection.host}`
    );

    // handlerUserCreateEvent();
    app.listen(config.port, () => {
      console.log(`🏡 Server is running on port ${config.port}`);
    });

    // call these functions only when database connection successful
    // console.log("Checking elastic health status");
    // checkElasticClient();
    // console.log("Checking elastic health status completed");
    // createPropertyIndexAndDoc();
    // console.log("Property indexing is done")
  } catch (err) {
    console.log(`Error: ${err}`);
  }
});

// (async () => {
//   const changeStream = Room.watch();
//   changeStream.on("change", (next) => {
//     console.log(">>>>>>>>>>>>>>>>>>>>>>>>", "change");

//     createPropertyIndexAndDoc();
//     // close();
//   });

//   async function close() {
//     await changeStream.close();
//   }
// })();

// export const connectDB = async () => {
//     console.log("port",config.port)
//     try {
//         const connection = await connect(MONGO_URI as string);
//         console.log(
//             `🏡 Pms database successfully running on ${connection.connection.host}`
//         );
//         app.listen(config.port, () => {
//             console.log(`🏡 Pms server is running on port http://localhost:${config.port}`)
//         })
//     } catch (error) {
//         console.error("Database connection failed: ", error);
//         process.exit(1)
//     }
// }

// connectDB()
