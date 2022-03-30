// (C) 2019-2020 GoodData Corporation

import { uriRef } from "../../objRef/factory";
import { ILegacyKpiWithComparison, ILegacyKpiWithoutComparison } from "../kpi";

export const legacyKpiWithoutComparison: ILegacyKpiWithoutComparison = {
    comparisonType: "none",
    metric: uriRef("/measure"),
};

export const legacyKpiWithComparison: ILegacyKpiWithComparison = {
    comparisonDirection: "growIsGood",
    comparisonType: "previousPeriod",
    metric: uriRef("/measure"),
};
