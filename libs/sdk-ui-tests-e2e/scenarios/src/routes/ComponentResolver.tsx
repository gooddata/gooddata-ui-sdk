// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AttributeFilterButtonPreselectedScenario } from "../components/Scenarios/Filters/AttributeFilterButtonPreselectedScenario";
import { AttributeFilterButtonScenario } from "../components/Scenarios/Filters/AttributeFilterButtonScenario";

import { DashboardScenario } from "../components/Scenarios/Dashboard/DashboardScenario";
import { DateFilterScenario } from "../components/Scenarios/Filters/DateFilterScenario";
import { ImplicitDrillToAttributeUrlScenario } from "../components/Scenarios/Dashboard/ImplicitDrillToAttributeUrlScenario";
import { BarChartDrillingScenario } from "../components/Scenarios/Visualizations/BarChart/BarChartDrillingScenario";
import { AttributeFilterButtonParentChildScenario } from "../components/Scenarios/Filters/AttributeFilterButtonParentChildScenario";
import { ParentChildFiltersWithPlaceholders } from "../components/Scenarios/Filters/ParentChildFiltersWithPlaceholders";

// todo add path to other scenarios

/**
 * Add key here for your new E2E test. Use the key in the map below with the scenario as well as in
 * the test spec within Navigation.
 */
export const SCENARIO_KEYS = {
    DASHBOARD: "dashboard/dashboard",
    IMPLICIT_DRILL_TO_ATTRIBUTE: "dashboard/implicit-drill-to-attribute-url",
    FILTERS_DATE_FILTER: "filters/date-filter",
    VIS_BAR_CHART_DRILL: "visualizations/barchart/bar-chart-drilling-scenario",
    FILTERS_ATTRIBUTE_FILTER_BUTTON: "filters/attribute-filter-button",
    FILTERS_ATTRIBUTE_FILTER_BUTTON_WITH_SELECTION: "filters/attribute-filter-button-with-selection",
    FILTERS_ATTRIBUTE_FILTER_BUTTON_PARENT_CHILD: "filters/attribute-filter-button-parent-child",
    FILTERS_PARENT_CHILD_FILTERS_WITH_PLACEHOLDERS: "filters/parent-child-filters-with-placeholder",
};

const scenarios = new Map<string, React.ComponentType>([
    [SCENARIO_KEYS.DASHBOARD, DashboardScenario],
    [SCENARIO_KEYS.IMPLICIT_DRILL_TO_ATTRIBUTE, ImplicitDrillToAttributeUrlScenario],
    [SCENARIO_KEYS.FILTERS_DATE_FILTER, DateFilterScenario],
    [SCENARIO_KEYS.VIS_BAR_CHART_DRILL, BarChartDrillingScenario],
    [SCENARIO_KEYS.FILTERS_ATTRIBUTE_FILTER_BUTTON, AttributeFilterButtonScenario],
    [SCENARIO_KEYS.FILTERS_ATTRIBUTE_FILTER_BUTTON_WITH_SELECTION, AttributeFilterButtonPreselectedScenario],
    [SCENARIO_KEYS.FILTERS_ATTRIBUTE_FILTER_BUTTON_PARENT_CHILD, AttributeFilterButtonParentChildScenario],
    [SCENARIO_KEYS.FILTERS_PARENT_CHILD_FILTERS_WITH_PLACEHOLDERS, ParentChildFiltersWithPlaceholders],
]);

const ComponentResolver: React.FC = () => {
    const searchParams = window.location.search;
    const scenario = searchParams
        .substring(1)
        .split("&")
        .find((param) => param.includes("scenario"))
        ?.split("=")[1];

    const ScenarioComponent =
        scenario && scenarios.has(scenario) ? scenarios.get(scenario)! : DashboardScenario;
    return <ScenarioComponent />;
};

export default ComponentResolver;
