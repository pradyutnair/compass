import {Account, Client, OAuthProvider} from "appwrite"
import {cookies, headers} from "next/headers";

export async function signInWithGoogle()  {
    const client = new Client()
    client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const account = new Account(client);

    account.createOAuth2Session(
        OAuthProvider.Google,
        "http://localhost:3000/", // Callback URL for success
        "http://localhost:3000/error" // Callback URL for failure
    );


}