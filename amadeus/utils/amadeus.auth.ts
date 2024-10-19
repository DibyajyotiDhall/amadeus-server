import axios from 'axios';
import qs from 'qs';
import dotenv from 'dotenv';
dotenv.config();

export const getAccessToken = async () => {
    try {

        const data = qs.stringify({
            grant_type: 'client_credentials',
            client_id: process.env.AMADEUS_API_KEY,
            client_secret: process.env.AMADEUS_API_SECRET,
        });

        const response = await axios.post('https://api.amadeus.com/v1/security/oauth2/token', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        // console.log("getAccessToken response", response.data.access_token)
        return response.data.access_token; // Return the access token
    } catch (error) {
        console.error('Error fetching access token:', error.response?.data || error.message);
        throw new Error('Failed to retrieve access token');
    }
};