'use server';
import {createAdminClient, createSessionClient} from "@/lib/server/appwrite";
import {ID} from "node-appwrite";
import {cookies} from "next/headers";
import {parseStringify} from "@/lib/utils";
import {redirect} from "next/navigation";

export const signIn = async (formData: FormData) => {
    "use server";
    try {
        const { account } = await createAdminClient();
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const response = await account.createEmailPasswordSession(email, password);
        console.log("FUNCTION signIn RESPONSE:", parseStringify(response));

        // Set the session cookie
        cookies().set("appwrite-session", response.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        redirect("/");

    } catch (error) {
        console.error('SIGN IN Error:', error);
        throw error; // propagate the error to the caller
    }
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        return await account.get();
    } catch (error) {
        return null;
    }
}

export async function signUpWithEmail(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;

    // Combine first and last name
    const name = `${firstName} ${lastName}`;

    // Check if any of the fields are empty
    if (!email || !password || !firstName || !lastName) {
        throw new Error('Invalid form data');
    }

    // Create a new account
    const { account } = await createAdminClient();

    // Create a new account with the provided email, password, and name
    await account.create(ID.unique(), email, password, name);
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });

    redirect("/");
}

export const logoutAccount = async () => {
    try {
        const {account} = await createSessionClient();
        cookies().delete("appwrite-session");
        await account.deleteSession("current");
    } catch (error) {
        console.error('Error:', error);
        throw error; // propagate the error to the caller
    }
}

