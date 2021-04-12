// (C) 2007-2019 GoodData Corporation
import { LineChart } from "@gooddata/sdk-ui-charts";
import { LineChartTwoMeasuresWithTrendyBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { responsiveScenarios, IResponsiveSize } from "../_infra/responsiveScenarios";
import { ReferenceLdm } from "@gooddata/reference-workspace";

const sizeVariantsSimple: Array<IResponsiveSize> = [
    { label: "without y axis title", width: 140, height: 354 },
    { label: "without y axis labels, with y axis title", width: 60, height: 354 },
];

const simpleScenarios = responsiveScenarios(
    "LineChart",
    ScenarioGroupNames.Responsive,
    LineChart,
    {
        measures: [ReferenceLdm.Amount],
        trendBy: ReferenceLdm.CreatedQuarterYear,
        config: { enableCompactSize: true, legend: { enabled: false } },
    },
    sizeVariantsSimple,
    false,
);

export const sizeVariantsComplex: Array<IResponsiveSize> = [
    { label: "without x axis, without y axis (very small container)", width: 40, height: 70 },
    { label: "without x axis labels", width: 650, height: 90 },
    { label: "without x axis title", width: 650, height: 140 },
    { label: "without y axis labels", width: 60, height: 354 },
];

const complexScenarios = responsiveScenarios(
    "LineChart",
    ScenarioGroupNames.Responsive,
    LineChart,
    {
        ...LineChartTwoMeasuresWithTrendyBy,
        config: { enableCompactSize: true, legend: { enabled: false } },
    },
    sizeVariantsComplex,
    false,
);

export default [...complexScenarios, ...simpleScenarios];
