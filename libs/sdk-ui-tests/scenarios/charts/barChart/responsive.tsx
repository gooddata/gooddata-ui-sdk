// (C) 2007-2019 GoodData Corporation
import { BarChart } from "@gooddata/sdk-ui-charts";
import { BarChartWithSingleMeasureViewByAndStackBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios, IResponsiveSize } from "../_infra/responsiveScenarios.js";

const sizeVariants: Array<IResponsiveSize> = [
    { label: "without x axis, without y axis (very small container)", width: 100, height: 70 },
    { label: "without x axis labels", width: 650, height: 90 },
    { label: "without x axis title", width: 650, height: 120 },
    { label: "without y axis labels", width: 120, height: 354 },
    { label: "without y axis title", width: 165, height: 354 },
];

const scenarios = responsiveScenarios(
    "BarChart",
    ScenarioGroupNames.Responsive,
    BarChart,
    {
        ...BarChartWithSingleMeasureViewByAndStackBy,
        config: {
            enableCompactSize: true,
            legend: { enabled: false },
        },
    },
    sizeVariants,
    false,
);

export default [...scenarios];
