import axios from 'axios';
import { getAccessToken } from '../utils/amadeus.auth';
import { convertToIata } from "../utils/getIataCode";
import Hotel from '../models/hotel.model';

export const getHotelsByCity = async (req, res) => {
    const { cityCode } = req.params;
    try {
        const accessToken = await getAccessToken(); // Get the access token
        const actualCityCode = await convertToIata(cityCode);

        // Make the GET request to fetch hotels by city
        const response = await axios.get(
            `https://api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${actualCityCode}&radius=5&radiusUnit=KM&hotelSource=ALL`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Add access token to Authorization header
                },
            }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching hotels:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch hotels' });
    }
};

export const getHotelById = async (req, res) => {
    const { id } = req.params;
    try {
        const accessToken = await getAccessToken(); // Get the access token

        // Make the GET request to fetch hotels by ID
        const response = await axios.get(
            `https://api.amadeus.com/v1/reference-data/locations/hotels/by-hotels?hotelIds=${id}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Add access token to Authorization header
                },
            }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching hotels:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch hotels' });
    }
}

export const getMultiHotelOffer = async (req, res) => {
    const { hotelId, adults, checkIn } = req.query;  // hotel id

    console.log(hotelId, adults, checkIn)
    try {
        const accessToken = await getAccessToken(); // Get the access token

        // Make the GET request to fetch hotels offer
        const response = await axios.get(
            `https://api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelId}&adults=${adults}&checkInDate=${checkIn}&roomQuantity=1&paymentPolicy=NONE&bestRateOnly=true`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Add access token to Authorization header
                },
            }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching hotels:', error.response?.data || error.message);
        return res.status(500).json({ error: error.response?.data?.errors[0]?.title || 'Failed to fetch hotels' });
    }
}

export const createHotelOrder = async (req, res) => {
    const data = req.body;

    try {
        const accessToken = await getAccessToken(); // Get the access token

        // Make the POST request to create hotel order
        const response = await axios.post(
            'https://api.amadeus.com/v2/booking/hotel-orders',
            data,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Add access token to Authorization header
                },
            }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching hotels:', error.response?.data || error.message);
        return res.status(500).json({ error: error.response?.data?.errors || 'Failed to fetch hotels' });
    }
}




// For testing 
// controllers/hotelController.js

export const getAndSaveHotelById = async (req, res) => {
    const { cityCode } = req.params;

    try {
        // Step 1: Get the access token and convert city code to IATA format
        const accessToken = await getAccessToken();
        const actualCityCode = await convertToIata(cityCode);

        // Step 2: Fetch hotel data from the API
        const response = await axios.get(
            `https://api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${actualCityCode}&radius=5&radiusUnit=KM&hotelSource=ALL`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const hotelData = response.data.data; // Assuming response structure includes `data` array

        // Step 3: Prepare bulk operations for upsert
        const bulkOperations = hotelData.map(({ chainCode, iataCode, dupeId, name, hotelId, geoCode, address, distance, lastUpdate }) => ({
            updateOne: {
                filter: { hotelId }, // Identify by hotelId
                update: {
                    $set: {
                        chainCode,
                        iataCode,
                        dupeId,
                        name,
                        hotelId,
                        geoCode,
                        address,
                        distance,
                        lastUpdate: new Date(lastUpdate),
                    }
                },
                upsert: true // Insert if not exists, otherwise update
            }
        }));

        // Step 4: Execute bulkWrite operation
        await Hotel.bulkWrite(bulkOperations);

        // Step 5: Respond with the fetched data
        return res.status(200).json({ message: 'Fetched and saved/updated hotel data successfully', hotels: hotelData });
    } catch (error) {
        console.error('Error fetching hotels:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch and save hotel data' });
    }
};