// (C) 2021 GoodData Corporation
import React from "react";

import { DashboardScenario } from "../components/Scenarios/DashboardScenario";
import { DateFilterScenario } from "../components/Scenarios/DateFilterScenario";
import { ImplicitDrillToAttributeUrlScenario } from "../components/Scenarios/ImplicitDrillToAttributeUrlScenario";

const ComponentResolver: React.FC = () => {
    const hash = window.location.hash;
    switch (hash) {
        case "#dashboard":
            return <DashboardScenario />;
        case "#dateFilter":
            return <DateFilterScenario />;
        case "#implicit-drill-to-attribute-url":
            return <ImplicitDrillToAttributeUrlScenario />;
        default:
            return <div>No component specified. Specify what component should be tested in URL hash.</div>;
    }
};

export default ComponentResolver;
