import {createGoCardlessClient} from "@/lib/gocardless";
import {createAdminClient} from "@/lib/appwrite";
import {getLoggedInUser} from "@/lib/user.actions";
import {Query} from "node-appwrite";
// lib/bank.actions.ts
import {BankData, Transaction} from '@/types';
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

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


export const getBankData = async (): Promise<BankData> => {
    const { requisitionId, bankName, bankLogo } = await getRequisitions();
    const balances = await getBalances({ requisitionId });

    return { requisitionId, bankName, bankLogo, balances };
};


export const getTransactions = async ({ requisitionId, dateFrom, dateTo }: { requisitionId: string, dateFrom?: string, dateTo?: string }) => {
    const client = await createGoCardlessClient();

    // Default to current date if dateTo is not provided
    dateTo = dateTo || dayjs().format("YYYY-MM-DD");

    // Generate new access token
    await client.generateToken();

    const accounts = await getAccounts({ requisitionId });

    if (!accounts) {
        throw new Error('No accounts found for the provided requisition ID');
    }

    // Create an empty array to hold all transactions
    let allTransactions: Transaction[] = [];

    // Get the latest transaction date if dateFrom is not provided
    if (!dateFrom) {
        dateFrom = await checkLatestTransaction();
    }

    console.log(`Retrieving transactions from ${dateFrom} to ${dateTo}...`);

    for (const accountId of accounts) {
        const account = client.account(accountId);

        // Fetch transactions for each account
        const transactionResponse = await account.getTransactions({ dateFrom, dateTo });

        // Get the booked and pending transactions
        const bookedTransactions = transactionResponse.transactions.booked;
        const pendingTransactions = transactionResponse.transactions.pending;

        // Concatenate the booked and pending transactions
        allTransactions = allTransactions.concat(bookedTransactions, pendingTransactions);
    }

    console.log(`Retrieved ${allTransactions.length} transactions`)
    console.log(allTransactions);

    // Apply data corrections if needed (implement this function as needed)
    return applyDataCorrections(allTransactions);


};

// Implement checkLatestTransaction to find the latest transaction date
const checkLatestTransaction = async (): Promise<string> => {
    // Your logic to find the latest transaction date
    // This can involve reading from a database or a file
    return "2023-01-01"; // Placeholder date
};


const applyDataCorrections = (transactions: Transaction[]): Transaction[] => {
    // Check if the transactions array contains data
    if (!Array.isArray(transactions) || transactions.length === 0) {
        throw new Error("transactions must be a non-empty array");
    }

    // Check if required fields exist
    transactions.forEach(transaction => {
        if (!transaction.transactionAmount || !transaction.bookingDate) {
            throw new Error("transactionAmount and bookingDate are required fields");
        }
    });

    // Predefine the words to match and remove
    const wordsToRemove = [
        "Savings vault", "Flexible account", "Vault", "To EUR", "To USD", "Exchanged",
        "Weekly Rule", "Monthly Rule", "From Main", "To Main", "From Personal", "To Personal",
        "Balance migration", "EUR Subscriptions", "Savings", "To EUR Subscriptions", "Savings", "Flexible Cash"
    ];
    const wordsToRemoveStr = new RegExp(wordsToRemove.join('|'), 'i'); // Case-insensitive matching

    const correctedTransactions: Transaction[] = [];

    transactions.forEach(transaction => {
        const { transactionAmount,
            bookingDate,
            creditorName,
            debtorName,
            creditorAccount,
            debtorAccount,
            remittanceInformationUnstructuredArray } = transaction;

        // Extract amount and currency
        const amount = transactionAmount.amount;
        const currency = transactionAmount.currency;

        // Convert bookingDate to Date object and extract date parts
        dayjs.extend(require('dayjs/plugin/weekOfYear'));
        const bookingDateObj = dayjs(bookingDate);
        const year = bookingDateObj.year();
        const month = bookingDateObj.month() + 1; // month() is 0-indexed in dayjs
        const week = bookingDateObj.week(); // Use  week()
        const day = bookingDateObj.date();
        const dayOfWeek = bookingDateObj.day();

        // Determine the first and second columns for payee information
        const firstColumn = creditorName ?? debtorName ?? '';
        const secondColumn = creditorAccount ?? debtorAccount ?? '';
        const remittanceInfo = remittanceInformationUnstructuredArray?.join(' ') ?? '';

        // Coalesce creditorName and creditorAccount
        let payee = firstColumn || secondColumn || remittanceInfo;
        if (!payee) {
            payee = "Unknown";
        } if (typeof payee === 'object') {
            // Get the string representation of the object
            payee = JSON.stringify(payee);

        }
        payee = payee.replace(/\s+/g, ' ').trim();

        // Check words to remove in all three columns
        const containsWordsToRemove = wordsToRemoveStr.test(payee);
        const containsWordsToRemoveFirstColumn = wordsToRemoveStr.test(firstColumn);
        const containsWordsToRemoveRemittanceInfo = wordsToRemoveStr.test(remittanceInfo);


        if (!containsWordsToRemove && !containsWordsToRemoveFirstColumn && !containsWordsToRemoveRemittanceInfo) {
            // Create a new transaction object with the corrected data
            const correctedTransaction: Transaction = {
                ...transaction,
                transactionAmount: { amount, currency },
                bookingDate: bookingDateObj.format("YYYY-MM-DD"),
                Year: year,
                Month: month,
                Week: week,
                Day: day,
                DayOfWeek: dayOfWeek,
                Payee: payee,
                Bank: "YourBankName" // Replace with the actual bank name or a dynamic value
            };
            correctedTransactions.push(correctedTransaction);
        }
    });

    return correctedTransactions;
};