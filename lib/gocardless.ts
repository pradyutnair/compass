// lib/gocardless.ts

import NordigenClient from 'nordigen-node';
import { parseStringify } from "@/lib/utils";

export async function createGoCardlessClient(data: { country: string }) {
    try {
        const client = new NordigenClient({
            secretId: process.env.GOCARDLESS_SECRET_ID!,
            secretKey: process.env.GOCARDLESS_SECRET_KEY!
        });

        const institutions = await client.institution.getInstitutions({ country: data.country });
        return parseStringify(institutions);
    } catch (error) {
        console.error('Error:', error);
        throw error; // propagate the error to the caller
    }
}
