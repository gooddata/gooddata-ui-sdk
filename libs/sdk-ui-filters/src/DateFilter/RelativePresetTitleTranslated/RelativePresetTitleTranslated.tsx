// (C) 2007-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { DateFilterGranularity } from "@gooddata/sdk-model";

const intlIdDict: { [key in DateFilterGranularity]: string } = {
    "GDC.time.date": "filters.day.title",
    "GDC.time.week_us": "filters.week.title",
    "GDC.time.month": "filters.month.title",
    "GDC.time.quarter": "filters.quarter.title",
    "GDC.time.year": "filters.year.title",
};

export const RelativePresetTitleTranslated: React.FC<{
    granularity: DateFilterGranularity;
}> = ({ granularity }) => {
    const intlId = intlIdDict[granularity] || null;
    if (!intlId) {
        return null;
    }

    return <FormattedMessage id={intlId} />;
};
