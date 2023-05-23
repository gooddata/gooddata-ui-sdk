// (C) 2019-2022 GoodData Corporation

import { uriRef } from "../../objRef/factory.js";
import { IKpiWithComparison, IKpiWithoutComparison } from "../kpi.js";

export const kpiWithoutComparison: IKpiWithoutComparison = {
    comparisonType: "none",
    metric: uriRef("/measure"),
};

export const kpiWithComparison: IKpiWithComparison = {
    comparisonDirection: "growIsGood",
    comparisonType: "previousPeriod",
    metric: uriRef("/measure"),
};
