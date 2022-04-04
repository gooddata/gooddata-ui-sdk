// (C) 2019-2022 GoodData Corporation

import { uriRef } from "../../objRef/factory";
import { IKpiWithComparison, IKpiWithoutComparison } from "../kpi";

export const kpiWithoutComparison: IKpiWithoutComparison = {
    comparisonType: "none",
    metric: uriRef("/measure"),
};

export const kpiWithComparison: IKpiWithComparison = {
    comparisonDirection: "growIsGood",
    comparisonType: "previousPeriod",
    metric: uriRef("/measure"),
};
