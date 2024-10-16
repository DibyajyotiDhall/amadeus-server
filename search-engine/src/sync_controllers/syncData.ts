import { PropertyInfo } from "../../../pms_api/src/model/property.info.model";
import elasticClient from "../service/elasticsearch";

export async function createPropertyIndexAndDoc() {
    const location = await PropertyInfo.find()
    .populate({ path: "property_category" })
    .populate({ path: "property_type" })
    .populate({ path: "property_address" })
    .populate({ path: "property_amenities" })
    .populate({ path: "room_Aminity" })
    .populate({ path: "property_room" })
    .populate({ path: "rate_plan" })
    .lean();

    // console.log(location)

    const client = elasticClient();
    try {
      const bulkOperations = [];
      for (const element of location) {
        const { _id, ...rest } = element;
        const restData: any & { property_room?: Array<any> | string } = rest;
        // if (_id) {
        //   const room = await Room.find({ propertyInfo_id: _id }).lean();
        //   restData.property_room = room;
        // }
        // console.log("rest", restData);
        bulkOperations.push(
          { index: { _index: 'property_data', _id: _id } },
          restData
        );
      }

      if (bulkOperations.length > 0) {
        const result = await client.bulk({ body: bulkOperations });
      }
      console.log("Data ingest successfully... %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", bulkOperations.length)
    } catch (error) {
      console.log("Error while indexing Property to elasticsearch", error);
    }
}

// { message: 'Error connecting to Elasticsearch', error: '' }

// const location =  await Location.find().populate({path:'propertyId'}).populate({
//   path: 'propertyId',
//   populate: {
//     path: 'property_aminite',
//     model: 'PropertyAminite'
//   }
// }).lean();
// console.log(location);

// const location =  await PropertyAddress.find().populate({
//   path: 'property_id',
// }).lean();