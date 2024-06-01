// app/my-banks/page.tsx
import React, { Suspense } from 'react';
import BankCard from '@/components/BankCard';
import BankCardSkeleton from '@/components/skeletons/BankCardSkeleton';
import { getBankData } from '@/lib/bank.actions';
import { BankData } from '@/types';

// A wrapper component to fetch data and pass it as props
const MyBanks = () => {
    const dataPromise: Promise<BankData> = getBankData();

    return (
        <Suspense fallback={<SkeletonFallback />}>
            <AsyncMyBanks dataPromise={dataPromise} />
        </Suspense>
    );
};

// The component to render while loading
const SkeletonFallback = () => (
    <section className='flex'>
        <div className="my-banks">
            <div className="space-y-4">
                <h2 className="header-2">Your cards</h2>
                <div className="flex flex-wrap gap-6">
                    <BankCardSkeleton />
                    <BankCardSkeleton />
                    <BankCardSkeleton />
                </div>
            </div>
        </div>
    </section>
);

// The component to render the actual data
const AsyncMyBanks = async ({ dataPromise }: { dataPromise: Promise<BankData> }) => {
    const { requisitionId, bankName, bankLogo, balances } = await dataPromise;

    return (
        <section className='flex'>
            <div className="my-banks">
                <div className="space-y-4">
                    <h2 className="header-2">Your cards</h2>
                    <div className="flex flex-wrap gap-6">
                        {balances && Object.entries(balances).map(([accountId, balance]) => (
                            <BankCard
                                key={accountId}
                                balances={balance}
                                userName={"Geeky"}
                                bankName={bankName}
                                bankLogo={bankLogo}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MyBanks;
