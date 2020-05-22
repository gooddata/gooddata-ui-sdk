// (C) 2019-2020 GoodData Corporation

import { ILegacyKpiWithComparison, ILegacyKpiWithoutComparison } from "../kpi";
import { uriRef } from "@gooddata/sdk-model";

export const legacyKpiWithoutComparison: ILegacyKpiWithoutComparison = {
    comparisonType: "none",
    metric: uriRef("/measure"),
};

export const legacyKpiWithComparison: ILegacyKpiWithComparison = {
    comparisonDirection: "growIsGood",
    comparisonType: "previousPeriod",
    metric: uriRef("/measure"),
};
