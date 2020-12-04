// (C) 2019-2020 GoodData Corporation
import { IntlShape } from "react-intl";
import {
    IDateFilter,
    IRelativeDateFilter,
    isAbsoluteDateFilter,
    isAllTimeDateFilter,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import { DateFilterGranularity } from "@gooddata/sdk-backend-spi";

const granularityIntlCodes: {
    [key in DateFilterGranularity]: string;
} = {
    "GDC.time.date": "day",
    "GDC.time.week_us": "week",
    "GDC.time.month": "month",
    "GDC.time.quarter": "quarter",
    "GDC.time.year": "year",
};

const getGeneralKpiPopLabel = (intl: IntlShape): string =>
    intl.formatMessage({ id: "filters.allTime.previousPeriod" });

const getRelativeFilterKpiPopLabel = (filter: IRelativeDateFilter, intl: IntlShape): string => {
    const { from, to, granularity } = relativeDateFilterValues(filter);
    const intlGranularity = granularityIntlCodes[granularity];
    if (!intlGranularity) {
        return "";
    }

    return intl.formatMessage(
        { id: `filters.${intlGranularity}.previousPeriod` },
        { n: Math.abs(to - from) + 1 },
    );
};

export const getKpiPopLabel = (
    filter: IDateFilter,
    comparisonType: "previousPeriod" | "lastYear",
    intl: IntlShape,
): string => {
    if (comparisonType === "lastYear") {
        // This string is meant to be the same no matter the filter
        return intl.formatMessage({ id: "filters.allTime.lastYear" });
    }

    if (isAbsoluteDateFilter(filter) || isAllTimeDateFilter(filter)) {
        return getGeneralKpiPopLabel(intl);
    } else {
        return getRelativeFilterKpiPopLabel(filter, intl);
    }
};
