// (C) 2021-2022 GoodData Corporation
import React from "react";

import { DashboardScenario } from "../components/Scenarios/Dashboard/DashboardScenario";
import { DateFilterScenario } from "../components/Scenarios/Filters/DateFilterScenario";
import { ImplicitDrillToAttributeUrlScenario } from "../components/Scenarios/Dashboard/ImplicitDrillToAttributeUrlScenario";
import { BarChartDrillingScenario } from "../components/Scenarios/Visualizations/BarChart/BarChartDrillingScenario";

// todo add path to other scenarios

const ComponentResolver: React.FC = () => {
    const hash = window.location.hash;
    switch (hash) {
        case "#dashboard/dashboard":
            return <DashboardScenario />;
        case "#dashboard/implicit-drill-to-attribute-url":
            return <ImplicitDrillToAttributeUrlScenario />;
        case "#filters/dateFilter":
            return <DateFilterScenario />;
        case "#visualizations/barchart/bar-chart-drilling-scenario":
            return <BarChartDrillingScenario />;
        default:
            return <div>No component specified. Specify what component should be tested in URL hash.</div>;
    }
};

export default ComponentResolver;
