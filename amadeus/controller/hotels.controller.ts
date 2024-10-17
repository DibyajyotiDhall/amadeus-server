import axios from 'axios';
import { getAccessToken } from '../utils/amadeus.auth';
import {convertToIata} from "../utils/getIataCode";

export const getHotelsByCity = async (req, res) => {
    const { cityCode } = req.params;
    console.log(cityCode)
    try {
        const accessToken = await getAccessToken(); // Get the access token
        const actualCityCode = await convertToIata(cityCode);

        // Make the GET request to fetch hotels by city
        const response = await axios.get(
            `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${actualCityCode}&radius=5&radiusUnit=KM&hotelSource=ALL`,
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
            `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-hotels?hotelIds=${id}`,
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
            `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelId}&adults=${adults}&checkInDate=${checkIn}&roomQuantity=1&paymentPolicy=NONE&bestRateOnly=true`,
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

export const createHotelOrder = async (req, res) => {
    const data = req.body;

    try {
        const accessToken = await getAccessToken(); // Get the access token

        // Make the POST request to create hotel order
        const response = await axios.post(
            'https://test.api.amadeus.com/v2/booking/hotel-orders',
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

// export const getOfferPricing = async (req, res) => {
//     const { offerId } = req.params;  // offer id

//     try {
//         const accessToken = await getAccessToken(); // Get the access token

//         // Make the GET request to fetch hotels offer pricing
//         const response = await axios.get(
//             `https://test.api.amadeus.com/v3/shopping/hotel-offers/${offerId}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`, // Add access token to Authorization header
//                 },
//             }   
//         );  

//         return res.status(200).json(response.data);
//     } catch (error) {
//         console.error('Error fetching hotels:', error.response?.data || error.message);
//         return res.status(500).json({ error: error.response?.data?.errors || 'Failed to fetch hotels' });
//     }
// }