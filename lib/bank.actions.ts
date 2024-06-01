import {createGoCardlessClient} from "@/lib/gocardless";
import {createAdminClient} from "@/lib/appwrite";
import {getLoggedInUser} from "@/lib/user.actions";
import {Query} from "node-appwrite";

export const getRequisitions = async () => {
    const {database} = await createAdminClient();
    const user = await getLoggedInUser();
    const userId = user.$id;

    try {
        // Get all the requisitions associated with the user
        const query = await database.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_REQ_COLLECTION_ID!,
            [
                Query.equal('userId', userId)
            ]
        )

        // Get the documents from the query (only the first one for now)
        const document = query.documents[0];

        // Return the requisition data
        return {
            requisitionId: document.requisitionId,
            bankName: document.bankName,
            bankLogo: document.bankLogo
        };

    } catch (error) {
        console.error('Error getting requisitions:', error);
    }
}

export const getAccounts = async ({ requisitionId }: {requisitionId: string}) => {
    const client = await createGoCardlessClient();

    try{
        // Generate new access token. Token is valid for 24 hours
        await client.generateToken();

        // Get the requisition data
        const requisitionData = await client.requisition.getRequisitionById(requisitionId);

        // Get all the accounts associated with the requisition
        return requisitionData.accounts;
    }

    catch (error) {
        console.error('Error getting accounts:', error);
        return null;
    }

}

export const getBalances = async ({ requisitionId }: {requisitionId: string}) => {
    const client = await createGoCardlessClient();

    // Generate new access token
    await client.generateToken();

    try{
        const accounts = await getAccounts({ requisitionId });

        let result: { [key: string]: { amount: string, currency: string } } = {};

        for (let accountId of accounts) {
            let account = client.account(accountId);
            let balances = await account.getBalances();
            let balanceAmount = balances.balances[0].balanceAmount;
            result[accountId] = {
                amount: balanceAmount.amount,
                currency: balanceAmount.currency
            };
        }

        // Convert the result object to an array and sort it by the amount in descending order
        return Object.fromEntries(Object.entries(result).sort(
            ([,a], [,b]) =>
                parseFloat(b.amount) - parseFloat(a.amount)));


    } catch (error) {
        console.error('Error getting balances:', error);
        return null;
    }
}

// lib/bank.actions.ts
import { BankData } from '@/types';


export const getBankData = async (): Promise<BankData> => {
    const { requisitionId, bankName, bankLogo } = await getRequisitions();
    const balances = await getBalances({ requisitionId });

    return { requisitionId, bankName, bankLogo, balances };
};
