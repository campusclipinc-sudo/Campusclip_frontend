import React from "react";
import DashboardHeader from "./DashboardHeader";
import "../scss/layout.scss";

const DashboardLayout = ({ children }) => {
    return (
        <div className="cc-shell cc-shell--header ">
            <DashboardHeader />
            <main className="">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;