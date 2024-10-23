import { Request, Response } from "express";
import { Webhook } from "svix";
import User from "../models/user.model";

interface WebhookEvent {
    type: string;
    data: {
        id: string;
        first_name: string;
        last_name: string;
        email_addresses: { email_address: string }[];
    };
}


export const handleWebhook = async (req: Request, res: Response) => {
    const { WEBHOOK_SECRET } = process.env;
    const { svix_id, svix_timestamp, svix_signature } = req.headers;

    if (!WEBHOOK_SECRET || !svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ message: "Invalid headers", status: 400 });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    try {
        const evt = wh.verify(JSON.stringify(req.body), {
            "svix-id": svix_id as string,
            "svix-timestamp": svix_timestamp as string,
            "svix-signature": svix_signature as string,
        }) as WebhookEvent;

        if (evt.type === "user.created") {
            const { id, first_name, last_name, email_addresses } = evt.data;
            const newUser = await User.create({
                clerkId: id,
                firstName: first_name,
                lastName: last_name,
                email: email_addresses[0].email_address,
            });
            console.log("New user created:", newUser);
        }

        res.status(200).json({ success: true, message: "Webhook received" });
    } catch (error) {
        console.error("Error verifying webhook:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};
