// (C) 2025 GoodData Corporation

import { ITotal, totalIsNative } from "@gooddata/sdk-model";

import { IBucketFilter } from "../../../interfaces/Visualization.js";
import { isActiveMeasureValueFilter, isRankingFilter } from "../../../utils/bucketHelper.js";

const isNativeTotalInvalid = (total: ITotal, hasRankingFilter: boolean, hasMeasureValueFilter: boolean) => {
    return totalIsNative(total) && (hasRankingFilter || hasMeasureValueFilter);
};

const removeInvalidNativeTotals = (totals: ITotal[], filters: IBucketFilter[]): ITotal[] => {
    const hasRankingFilter = filters.some(isRankingFilter);
    const hasMeasureValueFilter = filters.some(isActiveMeasureValueFilter);

    return totals.filter((total) => !isNativeTotalInvalid(total, hasRankingFilter, hasMeasureValueFilter));
};

export const removeInvalidTotals = (totals: ITotal[], filters: IBucketFilter[]): ITotal[] => {
    return removeInvalidNativeTotals(totals, filters);
};
