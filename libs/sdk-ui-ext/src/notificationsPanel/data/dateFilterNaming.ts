// (C) 2024-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DateFilterGranularity,
    type IAbsoluteDateFilterValues,
    type IDateFilter,
    type IRelativeDateFilterValues,
    absoluteDateFilterValues,
    isRelativeDateFilter,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";

interface IRelativeDateFilterMeta extends IRelativeDateFilterValues {
    type: "relative";
}

interface IAbsoluteDateFilterMeta extends IAbsoluteDateFilterValues {
    type: "absolute";
}

type DateFilterMeta = IRelativeDateFilterMeta | IAbsoluteDateFilterMeta;

export function translateDateFilter(intl: IntlShape, filter: IDateFilter, dateFormat: string): string {
    const metadata = filterMetadata(filter);

    // Keep consistent with `getDateFilterTitleUsingTranslator` in sdk-ui-filters:
    // - Special case for "All time" with excluded empty values.
    // - For included empty values, decorate the base representation.
    // - For "only" empty values, use the dedicated title.
    //
    // Week granularity is the one deliberate divergence: `getDateFilterTitleUsingTranslator` renders an
    // absolute week filter as "Week 15/2026 - Week 17/2026", which needs both the filter's granularity and
    // the workspace week start. The AFM shape carries no granularity at all today, and the week start is a
    // workspace setting this function cannot reach either, so an absolute week filter is spelled out here
    // as the plain day range it resolves to. MC-5254 gives the absolute AFM filter an optional granularity;
    // even then the missing week start keeps this branch on the day range, which is exactly what
    // `getDateFilterTitleUsingTranslator` itself falls back to when no week start reaches it.
    if (
        metadata.type === "relative" &&
        metadata.granularity === "ALL_TIME_GRANULARITY" &&
        metadata.emptyValueHandling === "exclude"
    ) {
        return intl.formatMessage({ id: "filters.allTime.exceptEmptyValues.title" });
    }

    if (metadata.emptyValueHandling === "only") {
        return intl.formatMessage({ id: "filters.emptyValues.title" });
    }

    const base =
        metadata.type === "absolute"
            ? DateFilterHelpers.formatAbsoluteDateRange(metadata.from, metadata.to, dateFormat)
            : DateFilterHelpers.formatRelativeDateRange(
                  metadata.from,
                  metadata.to,
                  metadata.granularity as DateFilterGranularity,
                  intl,
                  "full",
                  metadata.boundedFilter,
              );

    if (
        metadata.type === "relative" &&
        metadata.granularity === "ALL_TIME_GRANULARITY" &&
        metadata.emptyValueHandling === "include"
    ) {
        return base;
    }

    if (metadata.emptyValueHandling === "include") {
        return intl.formatMessage({ id: "filters.emptyValues.label" }, { title: base });
    }

    return base;
}

function filterMetadata(filter: IDateFilter): DateFilterMeta {
    if (isRelativeDateFilter(filter)) {
        return { ...relativeDateFilterValues(filter), type: "relative" };
    }

    return { ...absoluteDateFilterValues(filter), type: "absolute" };
}
