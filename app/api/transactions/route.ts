import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, getRequisitions } from '@/lib/bank.actions';

export const GET = async (req: NextRequest) => {
    try {
        // Get the requisition details including requisitionId
        const { requisitionId } = await getRequisitions();

        if (!requisitionId) {
            // Throw an error if the requisitionId is not found
            throw new Error('Requisition ID not found');

        }

        // Fetch transactions using the retrieved requisitionId
        const transactions = await getTransactions({
                                                                    requisitionId,
                                                                });

        // Return the transactions as the response body
        return NextResponse.json(transactions);

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return {
            status: 500,
            body: 'Error fetching transactions',
        };
    }
};
