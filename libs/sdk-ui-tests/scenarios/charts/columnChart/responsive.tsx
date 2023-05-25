// (C) 2007-2019 GoodData Corporation
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { ColumnChartWithArithmeticMeasuresAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios, IResponsiveSize } from "../_infra/responsiveScenarios.js";
import { ReferenceMd } from "@gooddata/reference-workspace";

const sizeVariantsSimple: Array<IResponsiveSize> = [
    { label: "without y axis title", width: 120, height: 354 },
    { label: "without y axis labels, with y axis title", width: 60, height: 354 },
];

const simpleScenarios = responsiveScenarios(
    "ColumnChart",
    ScenarioGroupNames.Responsive,
    ColumnChart,
    {
        measures: [ReferenceMd.Amount],
        viewBy: [ReferenceMd.Product.Name],
        config: { enableCompactSize: true, legend: { enabled: false } },
    },
    sizeVariantsSimple,
    false,
);

const sizeVariantsComplex: Array<IResponsiveSize> = [
    { label: "without x axis, without y axis (very small container)", width: 40, height: 60 },
    { label: "without x axis labels", width: 650, height: 90 },
    { label: "without x axis title", width: 650, height: 120 },
    { label: "without y axis labels", width: 60, height: 354 },
];

const complexCcenarios = responsiveScenarios(
    "ColumnChart",
    ScenarioGroupNames.Responsive,
    ColumnChart,
    {
        ...ColumnChartWithArithmeticMeasuresAndViewBy,
        config: { enableCompactSize: true, legend: { enabled: false } },
    },
    sizeVariantsComplex,
    false,
);

export default [...complexCcenarios, ...simpleScenarios];
