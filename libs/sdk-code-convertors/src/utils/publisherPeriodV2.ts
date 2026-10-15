// (C) 2026 GoodData Corporation

import type {
    PublisherPeriodV2 as AacPublisherPeriodV2,
    PublisherRelativePeriodV2,
} from "@gooddata/sdk-code-schemas/v1";
import { type DateFilterGranularity, type PublisherPeriodV2 } from "@gooddata/sdk-model";

type YamlPeriodGranularity = PublisherRelativePeriodV2["granularity"];

const storedGranularities = {
    SECOND: "GDC.time.second",
    MINUTE: "GDC.time.minute",
    HOUR: "GDC.time.hour",
    DAY: "GDC.time.date",
    WEEK_US: "GDC.time.week_us",
    MONTH: "GDC.time.month",
    QUARTER: "GDC.time.quarter",
    YEAR: "GDC.time.year",
    FISCAL_YEAR: "GDC.time.fiscal_year",
    FISCAL_QUARTER: "GDC.time.fiscal_quarter",
    FISCAL_MONTH: "GDC.time.fiscal_month",
} as const satisfies Record<YamlPeriodGranularity, DateFilterGranularity>;

const yamlGranularities = Object.fromEntries(
    Object.entries(storedGranularities).map(([yaml, stored]) => [stored, yaml]),
) as Record<DateFilterGranularity, YamlPeriodGranularity>;

/** @internal */
export function periodToDeclarativeV2(period: AacPublisherPeriodV2): PublisherPeriodV2 {
    if ("granularity" in period) {
        return {
            type: "relative",
            granularity: storedGranularities[period.granularity],
            from: period.from,
            to: period.to,
        };
    }
    return { type: "absolute", granularity: "GDC.time.date", from: period.from, to: period.to };
}

/** @internal */
export function periodToYamlV2(period: PublisherPeriodV2): AacPublisherPeriodV2 {
    if (period.type === "relative") {
        return { granularity: yamlGranularities[period.granularity], from: period.from, to: period.to };
    }
    return { from: period.from, to: period.to };
}
