// (C) 2007-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { BulletChart } from "@gooddata/sdk-ui-charts";

import { BulletChartWithAllMeasuresAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { IResponsiveSize, responsiveScenarios } from "../_infra/responsiveScenarios.js";

const sizeVariantsSimple: Array<IResponsiveSize> = [
    { label: "without x axis title", width: 650, height: 120 },
    { label: "without x axis labels, with x axis title", width: 650, height: 80 },
];

const simpleScenarios = responsiveScenarios(
    "BulletChart",
    ScenarioGroupNames.Responsive,
    BulletChart,
    {
        primaryMeasure: ReferenceMd.Won,
        config: { enableCompactSize: true, legend: { enabled: false } },
    },
    sizeVariantsSimple,
    false,
);

const sizeVariantsComplex: Array<IResponsiveSize> = [
    { label: "without x axis, without y axis (very small container)", width: 80, height: 50 },
    { label: "without x axis labels", width: 650, height: 50 },
    { label: "without y axis labels", width: 140, height: 354 },
    { label: "without y axis title", width: 165, height: 354 },
];

const complexScenarios = responsiveScenarios(
    "BulletChart",
    ScenarioGroupNames.Responsive,
    BulletChart,
    {
        ...BulletChartWithAllMeasuresAndViewBy,
        config: { enableCompactSize: true, legend: { enabled: false } },
    },
    sizeVariantsComplex,
    false,
);

export const responsive = [...complexScenarios, ...simpleScenarios];
