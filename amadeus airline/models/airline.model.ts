import mongoose from 'mongoose';

const GeoCodeSchema = new mongoose.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
});

const AddressSchema = new mongoose.Schema({
    cityName: { type: String, required: true },
    cityCode: { type: String, required: true },
    countryName: { type: String, required: true },
    countryCode: { type: String, required: true },
    stateCode: { type: String },
    regionCode: { type: String }
});

const AnalyticsSchema = new mongoose.Schema({
    travelers: {
        score: { type: Number }
    }
});

const LocationSchema = new mongoose.Schema({
    type: { type: String, required: true },
    subType: { type: String, required: true },
    name: { type: String, required: true },
    detailedName: { type: String },
    id: { type: String, required: true, unique: true },
    timeZoneOffset: { type: String },
    iataCode: { type: String },
    geoCode: GeoCodeSchema,
    address: AddressSchema,
    analytics: AnalyticsSchema,
    self: {
        href: { type: String, required: true },
        methods: [{ type: String }]
    }
});

export default mongoose.model('Airline', LocationSchema);
