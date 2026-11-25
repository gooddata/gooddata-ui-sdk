// (C) 2026 GoodData Corporation

import { type IntlShape, defineMessages } from "react-intl";

import type { IDateRangeParameterPeriod } from "@gooddata/sdk-model";

import { type PeriodGranularity, isValidPeriodLiteral, toPeriodGranularity } from "./dateRangePeriod.js";

const messages = defineMessages({
    openEnd: { id: "analyticsCatalog.parameter.period.openEnd" },
    openStart: { id: "analyticsCatalog.parameter.period.openStart" },
    quarter: { id: "analyticsCatalog.parameter.period.quarter" },
    week: { id: "analyticsCatalog.parameter.period.week" },
});

// Local stand-in: replace it with the shared period range label of the date filters once that lands.
/** Names a period by its ends, such as "Aug 2025 – Aug 2026"; undefined when it has neither end. */
export function formatPeriodRange(intl: IntlShape, period: IDateRangeParameterPeriod): string | undefined {
    const granularity = toPeriodGranularity(period.granularity);
    const from = period.from === undefined ? undefined : formatPeriodEnd(intl, granularity, period.from);
    const to = period.to === undefined ? undefined : formatPeriodEnd(intl, granularity, period.to);
    if (from !== undefined && to !== undefined) {
        return `${from} – ${to}`;
    }
    if (from !== undefined) {
        return intl.formatMessage(messages.openEnd, { from });
    }
    return to === undefined ? undefined : intl.formatMessage(messages.openStart, { to });
}

function formatPeriodEnd(intl: IntlShape, granularity: PeriodGranularity, literal: string): string {
    if (!isValidPeriodLiteral(granularity, literal)) {
        return literal;
    }
    const [year, part] = literal.split("-");
    switch (granularity) {
        case "MONTH": {
            const month = new Date(0);
            month.setUTCFullYear(Number(year), Number(part) - 1, 1);
            return intl.formatDate(month, { year: "numeric", month: "short", timeZone: "UTC" });
        }
        case "QUARTER":
            return intl.formatMessage(messages.quarter, { quarter: part, year });
        case "WEEK":
            return intl.formatMessage(messages.week, { week: part, year });
        default:
            return literal;
    }
}
