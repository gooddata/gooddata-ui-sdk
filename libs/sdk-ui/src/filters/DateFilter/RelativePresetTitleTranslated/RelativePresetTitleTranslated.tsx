// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

const intlIdDict: { [key in ExtendedDateFilters.DateFilterGranularity]: string } = {
    "GDC.time.date": "filters.day.title",
    "GDC.time.week_us": "filters.week.title",
    "GDC.time.month": "filters.month.title",
    "GDC.time.quarter": "filters.quarter.title",
    "GDC.time.year": "filters.year.title",
};

export const RelativePresetTitleTranslated: React.FC<{
    granularity: ExtendedDateFilters.DateFilterGranularity;
}> = ({ granularity }) => {
    const intlId = intlIdDict[granularity] || null;
    if (!intlId) {
        return null;
    }

    return <FormattedMessage id={intlId} />;
};
