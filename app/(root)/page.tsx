import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";
import RightSidebar from "@/components/RightSidebar";
import {getLoggedInUser} from "@/lib/user.actions";
import {parseStringify} from "@/lib/utils";

const Home = async () => {
    //const loggedInold = { firstName: "Pradyut", lastName: "Nair", email:"geeky@gmail.com"}
    const loggedIn = await getLoggedInUser();
    console.log("BOMBOCLAT User logged in: ", parseStringify(loggedIn));

    // Get the first name of the user
    const firstName = loggedIn?.name.split(" ")[0];
    // if (!loggedIn) redirect("/account")

    return (
        <section className={"home"}>
            <div className={"home-content"}>
                <header className={"home-header"}>
                    <HeaderBox
                        type="greeting"
                        title="Welcome,"
                        user={firstName || "Guest"}
                        subtext="Access your account information and manage your transactions."
                    />

                    <TotalBalanceBox
                        accounts={[]}
                        totalBanks={1}
                        totalCurrentBalance={12500.32}
                    />

                </header>
                RECENT TRANSACTIONS

            </div>

        </section>
    );
}
export default Home;