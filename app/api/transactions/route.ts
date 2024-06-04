import { NextRequest, NextResponse } from 'next/server';
import { getGCTransactions, getRequisitions } from '@/lib/bank.actions';

export const GET = async (req: NextRequest) => {
    try {
        // Get the requisition details including requisitionId
        const requisitionData = await getRequisitions();

        // Initialize an empty array to hold all transactions
        let allTransactions: any[] = [];

        for (let { requisitionId, bankName } of requisitionData) {
            // Fetch transactions using the retrieved requisitionId
            const transactions = await getGCTransactions(
                {
                    requisitionIds: [requisitionId],
                    bankNames: [bankName],
                    //dateFrom: "2024-06-01"
                }
            );

            // Concatenate the transactions to the allTransactions array
            allTransactions = allTransactions.concat(transactions);
        }

        // Return the transactions as the response body
        return NextResponse.json(allTransactions);

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return {
            status: 500,
            body: 'Error fetching transactions',
        };
    }
};