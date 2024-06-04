// lib/bank.actions.ts
import {BankData, Transaction} from '@/types';
import dayjs from "dayjs";
import {createGoCardlessClient} from "@/lib/gocardless";
import {createAdminClient} from "@/lib/appwrite";
import {getLoggedInUser} from "@/lib/user.actions";
import {Query} from "node-appwrite";
import weekOfYear from "dayjs/plugin/weekOfYear";

export const getRequisitions = async () => {
    const { database } = await createAdminClient();
    const user = await getLoggedInUser();
    const userId = user.$id;

    try {
        const query = await database.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_REQ_COLLECTION_ID!,
            [
                Query.equal('userId', userId)
            ]
        );

        return query.documents.map((document: any) => ({
            requisitionId: document.requisitionId,
            bankName: document.bankName,
            bankLogo: document.bankLogo
        }));
    } catch (error) {
        console.error('Error getting requisitions:', error);
        return [];
    }
}

export const getAccounts = async ({ requisitionIds }: { requisitionIds: string[] }) => {
    const client = await createGoCardlessClient();
    let allAccounts = [];

    try {
        await client.generateToken();

        // Fetch all accounts in parallel
        const accountPromises = requisitionIds.map(async (requisitionId) => {
            const requisitionData = await client.requisition.getRequisitionById(requisitionId);
            return requisitionData.accounts;
        });

        const accountsArrays = await Promise.all(accountPromises);
        allAccounts = accountsArrays.flat(); // Flatten the arrays

        return allAccounts;
    } catch (error) {
        console.error('Error getting accounts:', error);
        return null;
    }
}

export const getBalances = async ({ requisitionIds }: { requisitionIds: string[] }) => {
    const client = await createGoCardlessClient();
    let result: { [key: string]: { amount: string, currency: string } } = {};

    await client.generateToken();

    try {
        const accounts = await getAccounts({ requisitionIds });

        if (!accounts) {
            throw new Error('No accounts found for the provided requisition ID');
        }

        // Fetch balances for all accounts in parallel
        const balancePromises = accounts.map(async (accountId) => {
            let account = client.account(accountId);
            let balances = await account.getBalances();
            let balanceAmount = balances.balances[0].balanceAmount;
            return { accountId, amount: balanceAmount.amount, currency: balanceAmount.currency };
        });

        const balances = await Promise.all(balancePromises);

        // Map results into the result object
        balances.forEach(({ accountId, amount, currency }) => {
            result[accountId] = { amount, currency };
        });

        // Sort balances by amount in descending order
        return Object.fromEntries(Object.entries(result).sort(
            ([, a], [, b]) =>
                parseFloat(b.amount) - parseFloat(a.amount)));
    } catch (error) {
        console.error('Error getting balances:', error);
        return null;
    }
}

export const getBankData = async (): Promise<BankData[]> => {
    const requisitionData = await getRequisitions();

    if (!requisitionData.length) {
        throw new Error('No requisitions found');
    }

    // Fetch balances for all requisitions in parallel
    const bankDataPromises = requisitionData.map(async ({ requisitionId, bankName, bankLogo }) => {
        const balances = await getBalances({ requisitionIds: [requisitionId] }) || {};
        return { requisitionId, bankName, bankLogo, balances };
    });

    return await Promise.all(bankDataPromises);
};


export const getGCTransactions = async ({ requisitionIds, bankNames, dateFrom, dateTo }: { requisitionIds: string[], bankNames?: string[], dateFrom?: string, dateTo?: string }) => {
    const client = await createGoCardlessClient();
    let allTransactions: Transaction[] = [];

    // Default to current date if dateTo is not provided
    dateTo = dateTo || dayjs().format("YYYY-MM-DD");

    // Generate new access token
    await client.generateToken();

    // If dateFrom is not provided, fetch it once instead of in the loop
    if (!dateFrom) {
        dateFrom = await checkLatestTransaction();
    }

    // Fetch transactions concurrently for all requisition IDs
    const transactionsPromises = requisitionIds.map(async (requisitionId, index) => {
        const bankName = bankNames ? bankNames[index] : undefined;
        console.log(`Fetching transactions for requisition ID ${requisitionId} and bank ${bankName}`);
        const accounts = await getAccounts({ requisitionIds: [requisitionId] });

        if (!accounts) {
            throw new Error('No accounts found for the provided requisition ID');
        }

        // Fetch transactions for all accounts concurrently
        const accountTransactionsPromises = accounts.map(async (accountId) => {
            const account = client.account(accountId);
            const transactionResponse = await account.getTransactions({ dateFrom, dateTo });

            // Get the booked and pending transactions
            return transactionResponse.transactions.booked.concat(transactionResponse.transactions.pending);
        });

        // Await all transaction fetches for the current requisition ID
        const accountTransactions = await Promise.all(accountTransactionsPromises);

        // Flatten the array of arrays and apply data corrections
        const flattenedTransactions = accountTransactions.flat();
        return applyDataCorrections(flattenedTransactions, bankName);
    });

    // Await all transactions fetches for all requisition IDs
    const allTransactionsArrays = await Promise.all(transactionsPromises);
    allTransactions = allTransactionsArrays.flat();

    console.log(`Retrieved ${allTransactions.length} transactions`);
    //console.log(allTransactions);

    return allTransactions;
};

// Implement checkLatestTransaction to find the latest transaction date
const checkLatestTransaction = async (): Promise<string> => {
    // Your logic to find the latest transaction date
    // This can involve reading from a database or a file
    return "2023-01-01"; // Placeholder date
};


const applyDataCorrections = (transactions: Transaction[], bankName?: string): Transaction[] => {
    console.log(`Applying data corrections to ${transactions.length} transactions for ${bankName}`);
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
        // Convert bookingDate to Date object and extract date parts
        let bookingDateObj;
        bookingDateObj = dayjs(bookingDate);
        dayjs.extend(require('dayjs/plugin/weekOfYear'));
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

        if (!bankName) {
            bankName = "YourBankName"; // Replace with the actual bank name or a dynamic value
        } else {
            // Apply data corrections by removing underscores and hyphens
            bankName = bankName.replace(/_/g, ' ').replace(/-/g, ' ');
            // Split the bank name and only use the first word
            bankName = bankName.split(' ')[0];
        }

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
                Bank: bankName,
                remittanceInformationUnstructuredArray: [remittanceInfo]
            };
            correctedTransactions.push(correctedTransaction);
        }
    });

    // Sort the transactions by booking date in descending order
    correctedTransactions.sort((a, b) => dayjs(b.bookingDate).unix() - dayjs(a.bookingDate).unix());


    return correctedTransactions;
};
