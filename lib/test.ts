import { Client, Databases, Query } from "node-appwrite";
import {createGoCardlessClient} from "@/lib/gocardless";
import {getLoggedInUser} from "@/lib/user.actions";

// @ts-ignore
const client = await createGoCardlessClient();

const databases = new Databases(client);
// @ts-ignore
const user = await getLoggedInUser();
const userId = user.$id;
let promise = databases.listDocuments(
    process.env.APPWRITE_DATABASE_ID!,
    process.env.APPWRITE_REQ_COLLECTION_ID!,
    [
        Query.equal('userId', userId)
    ]
)

promise.then((response) => {
    console.log(response);
} ).catch((error) => {
    console.log(error);
})