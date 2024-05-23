// src/app/oauth/route.js

import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET({request}: {request: any}) {
    if (!request || !request.nextUrl) {
        throw new Error('Invalid request object NIGGA');
    }

    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    const { account } = await createAdminClient();
    const session = await account.createSession(userId, secret);

    cookies().set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    return NextResponse.redirect(`${request.nextUrl.origin}/`);
}