import React from "react";

import { DashboardScenario } from "../components/Scenarios/DashboardScenario";
import { DateFilterScenario } from "../components/Scenarios/DateFilterScenario";

const ComponentResolver: React.FC = () => {
    const hash = window.location.hash;
    switch (hash) {
        case "#dashboard":
            return <DashboardScenario />;
        case "#dateFilter":
            return <DateFilterScenario />;
        default:
            return <div>No component specified. Specify what component should be tested in URL hash.</div>;
    }
};

export default ComponentResolver;
