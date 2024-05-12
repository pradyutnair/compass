import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";

const Home= () => {
    const loggedIn = { firstName: "Pradyut"}
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

            </div>
        </section>
    );
}
export default Home;