import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";
import RightSidebar from "@/components/RightSidebar";

const Home= () => {
    const loggedIn = { firstName: "Pradyut", lastName: "Nair", email:"geeky@gmail.com"}
    return (
        <section className={"home"}>
            <div className={"home-content"}>
                <header className={"home-header"}>
                <HeaderBox
                    type="greeting"
                    title="Welcome,"
                    user={loggedIn?.firstName || "Guest"}
                    subtext="Access your account information and manage your transactions."
                    />

                <TotalBalanceBox
                   accounts={[]}
                   totalBanks={1}
                   totalCurrentBalance={1250.32}
                />

                </header>
             RECENT TRANSACTIONS

            </div>
                <RightSidebar user={loggedIn}
                              transactions={[]}
                              banks={[{currentBalance:1100.23}, {currentBalance:150.09}]}
                                />
        </section>
    );
}
export default Home;