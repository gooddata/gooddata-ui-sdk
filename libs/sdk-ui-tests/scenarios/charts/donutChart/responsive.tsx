// (C) 2007-2019 GoodData Corporation
import { DonutChart } from "@gooddata/sdk-ui-charts";
import { DonutChartWithSingleMeasureAndViewBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { responsiveScenarios } from "../_infra/responsiveScenarious";
import { IResponsiveSize } from "../_infra/responsiveScenarious";

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
);

export default [...scenarios];
