// import type { NextApiRequest, NextApiResponse } from 'next';
import Amadeus from 'amadeus';

// Initialize the Amadeus client with your API key and secret
const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_API_KEY,
    clientSecret: process.env.AMADEUS_API_SECRET,
});

export const convertToIata = async (location: string) => {
    try {
        const response = await amadeus.referenceData.locations.get({
            keyword: location as string,
            subType: 'CITY', // You can also use 'AIRPORT'
        });

        // console.log("convertToIata: ", response.data[0]?.iataCode || null)
        return response.data[0]?.iataCode || null;

    } catch (error) {
        return null
    }
}
