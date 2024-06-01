import { NextRequest, NextResponse } from 'next/server';
import NordigenClient from 'nordigen-node';
import { randomUUID } from 'crypto';
import {getLoggedInUser} from "@/lib/user.actions";
import {createAdminClient} from "@/lib/appwrite";
import {ID} from "node-appwrite";
import {createGoCardlessClient} from "@/lib/gocardless";

const { APPWRITE_DATABASE_ID, APPWRITE_REQ_COLLECTION_ID } = process.env;

// Define the POST function
export async function POST(request: NextRequest) {
    try {
        // Parse the institutionId from the request body
        const { institutionId, logo } = await request.json();

        // console.log('CREATE SESSION Institution ID:', institutionId);
        // console.log('CREATE SESSION ogo:', logo);

        // If no institutionId is provided, redirect to the sign-up page
        if (!institutionId) {
            return NextResponse.redirect('http://localhost:3000/sign-up');
        }

        // Create a new Nordigen client with the provided secret ID and key
        const client = await createGoCardlessClient()

        // Generate a new access token
        await client.generateToken();

        // Get the currently logged-in user
        const user = await getLoggedInUser();
        const userId = user.$id;
        console.log('CREATE SESSION User ID:', userId);

        // Initialize a new session with the provided institutionId and a random referenceId
        const init = await client.initSession({
            redirectUrl: "http://localhost:3000/",
            institutionId: institutionId,
            referenceId: randomUUID(),
        });

        // Create a new admin client
        const { database } = await createAdminClient();

        // Create a new document in the requisitions collection with the user ID and requisition ID
        const newRequisition = await database.createDocument(
            APPWRITE_DATABASE_ID!,
            APPWRITE_REQ_COLLECTION_ID!,
            ID.unique(), // Unique ID for the document
            {
                userId: userId, // User ID
                requisitionId: init.id,
                bankName: institutionId,
                bankLogo: logo,
            }
        );

        // If the document creation failed, throw an error
        if (!newRequisition) {
            throw new Error('Failed to write requisition to database');
        }

        // Return a JSON response with the agreement link
        return NextResponse.json({ link: init.link });

    } catch (error) {
        // If an error occurred, log it and return a 500 response
        console.error('CREATE SESSION POST Error:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}