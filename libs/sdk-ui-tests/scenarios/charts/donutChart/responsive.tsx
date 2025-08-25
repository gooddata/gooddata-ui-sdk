// (C) 2007-2025 GoodData Corporation
import { DonutChart } from "@gooddata/sdk-ui-charts";

import { DonutChartWithSingleMeasureAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { IResponsiveSize, responsiveScenarios } from "../_infra/responsiveScenarios.js";

const sizeVariants: Array<IResponsiveSize> = [
    { label: "auto data labels", width: 300, height: 250 },
    { label: "without data labels", width: 200, height: 200 },
];

const scenarios = responsiveScenarios(
    "DonutChart",
    ScenarioGroupNames.Responsive,
    DonutChart,
    {
        ...DonutChartWithSingleMeasureAndViewBy,
        config: {
            enableCompactSize: true,
            dataLabels: {
                visible: true,
            },
            legend: { enabled: false },
        },
    },
    sizeVariants,
    false,
);

export default [...scenarios];
