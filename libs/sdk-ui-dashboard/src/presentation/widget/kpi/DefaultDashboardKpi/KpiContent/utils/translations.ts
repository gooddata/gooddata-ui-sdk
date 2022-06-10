// (C) 2019-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import {
    IDateFilter,
    IRelativeDateFilter,
    isAllTimeDateFilter,
    isRelativeDateFilter,
    relativeDateFilterValues,
    DateFilterGranularity,
    IKpiComparisonTypeComparison,
} from "@gooddata/sdk-model";

const getGeneralKpiPopLabel = (intl: IntlShape): string =>
    intl.formatMessage({ id: "filters.allTime.previousPeriod" });

const getRelativeFilterKpiPopLabel = (filter: IRelativeDateFilter, intl: IntlShape): string => {
    const { from, to, granularity } = relativeDateFilterValues(filter);
    const n = Math.abs(to - from) + 1;

    switch (granularity as DateFilterGranularity) {
        case "GDC.time.minute":
            return intl.formatMessage({ id: `filters.minute.previousPeriod` }, { n });
        case "GDC.time.hour":
            return intl.formatMessage({ id: `filters.hour.previousPeriod` }, { n });
        case "GDC.time.date":
            return intl.formatMessage({ id: `filters.day.previousPeriod` }, { n });
        case "GDC.time.week_us":
            return intl.formatMessage({ id: `filters.week.previousPeriod` }, { n });
        case "GDC.time.month":
            return intl.formatMessage({ id: `filters.month.previousPeriod` }, { n });
        case "GDC.time.quarter":
            return intl.formatMessage({ id: `filters.quarter.previousPeriod` }, { n });
        case "GDC.time.year":
            return intl.formatMessage({ id: `filters.year.previousPeriod` }, { n });
        default:
            return "";
    }
};

export const getKpiPopLabel = (
    filter: IDateFilter | undefined,
    comparisonType: IKpiComparisonTypeComparison,
    intl: IntlShape,
): string => {
    if (comparisonType === "lastYear") {
        // This string is meant to be the same no matter the filter
        return intl.formatMessage({ id: "filters.allTime.lastYear" });
    }

    if (isRelativeDateFilter(filter) && !isAllTimeDateFilter(filter)) {
        return getRelativeFilterKpiPopLabel(filter, intl);
    }

    return getGeneralKpiPopLabel(intl);
};
