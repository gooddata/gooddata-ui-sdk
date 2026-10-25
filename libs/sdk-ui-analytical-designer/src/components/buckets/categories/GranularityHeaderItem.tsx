// (C) 2021-2026 GoodData Corporation

import { FormattedMessage, defineMessages } from "react-intl";

import { Header } from "@gooddata/sdk-ui-kit";

import { GRANULARITY, type Granularity } from "../../../models/granularity.js";

const granularityHeaderMessages = defineMessages({
    second: { id: "granularity.header.second" },
    minute: { id: "granularity.header.minute" },
    hour: { id: "granularity.header.hour" },
    day: { id: "granularity.header.day" },
    week: { id: "granularity.header.week" },
    month: { id: "granularity.header.month" },
    fiscal_month: { id: "granularity.header.fiscal_month" },
    quarter: { id: "granularity.header.quarter" },
    fiscal_quarter: { id: "granularity.header.fiscal_quarter" },
    year: { id: "granularity.header.year" },
    fiscal_year: { id: "granularity.header.fiscal_year" },
});

const getHeaderIntlKey = (granularity: Granularity): string => {
    switch (granularity) {
        case GRANULARITY.SECOND:
            return granularityHeaderMessages.second.id;
        case GRANULARITY.MINUTE:
            return granularityHeaderMessages.minute.id;
        case GRANULARITY.HOUR:
            return granularityHeaderMessages.hour.id;
        case GRANULARITY.DATE:
            return granularityHeaderMessages.day.id;
        case GRANULARITY.WEEK:
            return granularityHeaderMessages.week.id;
        case GRANULARITY.MONTH:
            return granularityHeaderMessages.month.id;
        case GRANULARITY.FISCAL_MONTH:
            return granularityHeaderMessages.fiscal_month.id;
        case GRANULARITY.QUARTER:
            return granularityHeaderMessages.quarter.id;
        case GRANULARITY.FISCAL_QUARTER:
            return granularityHeaderMessages.fiscal_quarter.id;
        case GRANULARITY.YEAR:
            return granularityHeaderMessages.year.id;
        case GRANULARITY.FISCAL_YEAR:
            return granularityHeaderMessages.fiscal_year.id;
        default:
            return undefined;
    }
};

export function GranularityHeader({ granularity }: { granularity: Granularity }) {
    return (
        <Header key={`header_${granularity}`}>
            <FormattedMessage id={getHeaderIntlKey(granularity)} />
        </Header>
    );
}
