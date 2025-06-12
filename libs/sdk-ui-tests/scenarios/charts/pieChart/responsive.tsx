// (C) 2007-2019 GoodData Corporation
import { PieChart } from "@gooddata/sdk-ui-charts";
import { PieChartWithSingleMeasureAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios, IResponsiveSize } from "../_infra/responsiveScenarios.js";

const sizeVariants: Array<IResponsiveSize> = [
    { label: "auto data labels", width: 300, height: 250 },
    { label: "without data labels", width: 200, height: 200 },
];

const scenarios = responsiveScenarios(
    "PieChart",
    ScenarioGroupNames.Responsive,
    PieChart,
    {
        ...PieChartWithSingleMeasureAndViewBy,
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
