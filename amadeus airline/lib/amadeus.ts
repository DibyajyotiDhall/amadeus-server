import axios from "axios";

export const fetchClientCredentials = async (): Promise<string | null> => {

    console.log("***********************\n", process.env.AMADEUS_API_KEY, process.env.AMADEUS_API_SECRET)
    try {
        const response = await axios.post(
            "https://api.amadeus.com/v1/security/oauth2/token",
            {
                client_id: process.env.AMADEUS_API_KEY,
                client_secret: process.env.AMADEUS_API_SECRET,
                grant_type: "client_credentials",
            },
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching client credentials");
        return null;
    }
};
