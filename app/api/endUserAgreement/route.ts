import { NextRequest, NextResponse } from 'next/server';
import NordigenClient from 'nordigen-node';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        console.log('CREATE SESSION POST Request:', request);
        const { institutionId } = await request.json();
        console.log('POST Institution ID:', institutionId);

        if (!institutionId) {
            return NextResponse.redirect('http://localhost:3000/');
        }

        // Create new Nordigen client
        const client = new NordigenClient({
            secretId: process.env.GOCARDLESS_SECRET_ID!,
            secretKey: process.env.GOCARDLESS_SECRET_KEY!
        });

        // Create new access token
        await client.generateToken();

        // Initialize connection
        const init = await client.initSession({
            redirectUrl: "http://localhost:3000/",
            institutionId: institutionId,
            referenceId: randomUUID()
        });

        // Optionally save the requisition ID in session or database here
        // For example, if using a session:
        // req.session.requisition = init.id;
        // await req.session.save();

        // Redirect the user to the agreement link
        //return NextResponse.redirect(init.link);
        return NextResponse.json({ link: init.link });

    } catch (error) {
        console.error('CREATE SESSION POST Error:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}
