import React from "react";

import { DashboardScenario } from "../components/Scenarios/DashboardScenario";

const Home: React.FC = () => {
    console.log("location hash", window.location.hash);

    const hash = window.location.hash;
    switch (hash) {
        case "#dashboard":
            return <DashboardScenario />;
        default:
            return <div>No component specified. Specify what component should be tested in URL hash.</div>;
    }
};

export default Home;
