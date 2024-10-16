// import axios from 'axios';
// import qs from 'qs';

// const getAccessToken = async () => {
//     try {

//         const data = qs.stringify({
//             grant_type: 'client_credentials',
//             client_id: process.env.AMADEUS_API_KEY,
//             client_secret: process.env.AMADEUS_API_SECRET,
//         });

//         const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', data, {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//         });
//         console.log("getAccessToken response", response.data.access_token)
//         return response.data.access_token; // Return the access token
//     } catch (error) {
//         console.error('Error fetching access token:', error.response?.data || error.message);
//         throw new Error('Failed to retrieve access token');
//     }
// };


// export const getHotelsByCity = async (req, res) => {
//     const { cityCode } = req.params;
//     try {
//         const accessToken = await getAccessToken(); // Get the access token

//         // Make the GET request to fetch hotels by city
//         const response = await axios.get(
//             `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=5&radiusUnit=KM&hotelSource=ALL`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`, // Add access token to Authorization header
//                 },
//             }
//         );

//         // console.log('Hotels data:', response.data); // Log the hotel data
//         return res.status(200).json(response.data);
//     } catch (error) {
//         console.error('Error fetching hotels:', error.response?.data || error.message);
//         return res.status(500).json({ error: 'Failed to fetch hotels' });
//     }
// };