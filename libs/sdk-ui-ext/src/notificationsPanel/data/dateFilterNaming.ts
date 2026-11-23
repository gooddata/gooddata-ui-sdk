// (C) 2024-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DateFilterGranularity,
    type DateFilterOfAnyType,
    type IAbsoluteDateFilterValues,
    type IRelativeDateFilterValues,
    absoluteDateFilterValues,
    isAbsoluteDateFilter,
    isAbsoluteGranularityDateFilter,
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

export function translateDateFilter(
    intl: IntlShape,
    filter: DateFilterOfAnyType,
    dateFormat: string,
): string | undefined {
    const metadata = filterMetadata(filter);

    if (!metadata) {
        return undefined;
    }

    // Keep consistent with `getDateFilterTitleUsingTranslator` in sdk-ui-filters:
    // - Special case for "All time" with excluded empty values.
    // - For included empty values, decorate the base representation.
    // - For "only" empty values, use the dedicated title.
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

function filterMetadata(filter: DateFilterOfAnyType): DateFilterMeta | undefined {
    if (isRelativeDateFilter(filter)) {
        return { ...relativeDateFilterValues(filter), type: "relative" };
    }

    if (isAbsoluteGranularityDateFilter(filter)) {
        console.warn(
            "Notification titles do not support absolute date filters with granularity yet.",
            filter,
        );
        return undefined;
    }

    if (isAbsoluteDateFilter(filter)) {
        return { ...absoluteDateFilterValues(filter), type: "absolute" };
    }

    const unknownFilter: never = filter;
    console.warn("Cannot name a date filter of an unknown type.", unknownFilter);
    return undefined;
}
